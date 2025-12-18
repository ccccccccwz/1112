# services/project_service.py
from flask import jsonify
from backend.db.connection import fetch_all, fetch_one, execute
from backend.utils.common_utils import BASE_DI_LIST
from get_from_itest import get_project_info, get_person_idms, get_task_factor
from datetime import date


# 项目相关的所有函数：
# get_all_projects, insert_project, delete_project, search_projects,
# increase_head_counts, decrease_head_counts, update_test_group,
# update_project_level, update_project_status, update_project_start_date,
# update_project, refresh_all_projects


def insert_project(data):
    try:
        average_issues = int(data['AverageIssues']) if data['AverageIssues'] else None
        average_di = float(data['AverageDI']) if data['AverageDI'] else None

        if data['dataSource'] == "manual":
            count = fetch_one(
                "SELECT COUNT(*) AS cnt FROM Projects WHERE TestGroup = ? AND ProjectName = ?",
                (data['testgroup'], data['projectname'])
            )['cnt']
            if count > 0:
                return jsonify({"error": "Project with the same test group and name already exists"}), 409
            # Insert new project
            # print(type(data['expecteddi']))
            execute("""
                INSERT INTO Projects (TestGroup, ProjectName, ConversionFactor, ProjectLevel, HeadCounts, ExpectedIssues, ExpectedDI, AverageIssues, AverageDI, StartDate, Status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                data['testgroup'],
                data['projectname'],
                data['conversionFactor'],
                data['projectlevel'],
                data['headcounts'],
                data['expectedissues'],
                data['expecteddi'],
                average_issues,
                average_di,
                data['startdate'],
                data.get('status', '进行中')
            ))
        if data['dataSource'] == "itest":
            task_code = data['taskId']
            test_round = data['testRound']
            task_id = get_project_info(task_code)['task_id']
            task_name = get_project_info(task_code)['name'] + "-第"+test_round+"轮"
            task_start_time = get_project_info(task_code)['start_time']
            task_factor = get_task_factor(task_id)[0]



            task_people_data = get_person_idms(task_id, int(test_round))
            length = len(task_people_data)
            count = fetch_one(
                "SELECT COUNT(*) AS cnt FROM Projects WHERE TestGroup = ? AND ProjectName = ?",
                (data['testgroup'], task_name)
            )['cnt']
            if count > 0:
                return jsonify({"error": "Project with the same test group and name already exists"}), 409
            execute("""
                        INSERT INTO Projects (TestGroup, ProjectName, ConversionFactor, ProjectLevel, HeadCounts, ExpectedIssues, ExpectedDI, AverageIssues, AverageDI, StartDate, Status, TaskID, TestRound)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, (
                data['testgroup'],
                task_name,
                str(task_factor),
                data['projectlevel'],
                length,
                data['expectedissues'],
                data['expecteddi'],
                round(int(data['expectedissues'])/length,0),
                round(float(data['expecteddi'])/length,2),
                task_start_time,
                data.get('status', '进行中'),
                task_id,
                test_round
            ))
            project_id = fetch_one("SELECT ID FROM Projects WHERE ProjectName = ?", (task_name,))
            project_id = project_id['ID'] if project_id else None

            for name, values in task_people_data.items():
                # 设置天数
                task_type_check = get_task_factor(task_id)[1]
                task_days = 15 if task_type_check == "ADCP" else 10


                # 查找匹配的执行人
                found_executor = next((item for item in BASE_DI_LIST if item[0] == name), None)
                if not found_executor:
                    expected_issues, expected_di = 1, 1
                else:
                    expected_issues = round(task_days * round((found_executor[1] / 0.7), 2))
                    expected_di = round(task_days * found_executor[1], 2)
                    # 这里需要检查##########计算后因为过小仍为0#############################
                    expected_issues = expected_issues or 1
                    expected_di = expected_di or 1

                # 确定达标状态
                issues_on_target = int(values[0] >= expected_issues)
                di_on_target = int(values[1] >= expected_di)

                execute("""
                               INSERT INTO Executors (
                                   ExecutorName, ExpectedIssues, ExpectedDI, ActualIssues, ActualDI, 
                                   Level1Issues, Level2Issues, Level3Issues, Level4Issues, 
                                   IsIssuesOnTarget, IsDIOnTarget, IsTargetIssuesOnTarget, IsTargetDIOnTarget, 
                                   ProjectID, Days
                               ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                               """, (
                    name, expected_issues, expected_di, values[0], values[1],
                    values[2], values[3], values[4], values[5],
                    0, 0, issues_on_target, di_on_target,
                    project_id, task_days
                ))
        return jsonify({"message": "Project added successfully"}), 201
    except Exception as e:
        print("Error:", e)
        return jsonify({"error": "Failed to add project"}), 500


def get_all_projects():
    projects = fetch_all("SELECT * FROM Projects ORDER BY StartDate DESC")
    for p in projects:
        if 'StartDate' in p and isinstance(p['StartDate'], date):
            p['StartDate'] = p['StartDate'].strftime('%Y-%m-%d')
    return projects



def delete_project(request):
    data = request.get_json()
    project_id = data.get('id')
    if not project_id:
        return jsonify({"message": "No project ID provided"}), 400
    execute("DELETE FROM Executors WHERE ProjectID = ?", (project_id,))
    execute("DELETE FROM Projects WHERE ID = ?", (project_id,))
    return jsonify({"message": "Project and its executors deleted successfully"}), 200


def search_projects(request):
    testgroup = request.args.get('testgroup', '')
    projectlevel = request.args.get('projectlevel', '')
    projectstatus = request.args.get('projectstatus', '')
    projectname = request.args.get('projectname', '')
    ID = request.args.get('ID', '')

    query = "SELECT * FROM Projects WHERE 1=1"
    params = []
    if testgroup:
        query += " AND TestGroup = ?"
        params.append(testgroup)
    if projectlevel:
        query += " AND ProjectLevel = ?"
        params.append(projectlevel)
    if projectstatus:
        query += " AND Status = ?"
        params.append(projectstatus)
    if projectname:
        query += " AND ProjectName LIKE ?"
        params.append(f"%{projectname}%")
    if ID:
        query += " AND ID = ?"
        params.append(ID)

    projects = fetch_all(query, params)
    for p in projects:
        if 'StartDate' in p and isinstance(p['StartDate'], date):
            p['StartDate'] = p['StartDate'].strftime('%Y-%m-%d')
    return jsonify(projects)


def increase_head_counts(request):
    data = request.get_json()
    project_id = data.get('projectID')
    if project_id is None:
        return jsonify({'error': 'Project ID required'}), 400
    rowcount = execute("UPDATE Projects SET HeadCounts = HeadCounts + 1 WHERE ID = ?", (project_id,))
    if rowcount == 0:
        return jsonify({'error': 'Project not found'}), 404
    return jsonify({'message': 'HeadCounts updated successfully'}), 200


def decrease_head_counts(request):
    data = request.get_json()
    project_id = data.get('projectID')
    if project_id is None:
        return jsonify({'error': 'Project ID required'}), 400
    rowcount = execute("UPDATE Projects SET HeadCounts = HeadCounts - 1 WHERE ID = ?", (project_id,))
    if rowcount == 0:
        return jsonify({'error': 'Project not found'}), 404
    return jsonify({'message': 'HeadCounts updated successfully'}), 200


def update_test_group(request):
    data = request.get_json()
    id = data.get('id')
    test_group = data.get('testGroup')
    if not id or not test_group:
        return jsonify({'error': 'Invalid input'}), 400
    rowcount = execute("UPDATE Projects SET TestGroup = ? WHERE ID = ?", (test_group, id))
    if rowcount == 0:
        return jsonify({'error': 'Record not found'}), 404
    return jsonify({'message': 'Test group updated successfully'}), 200


def update_project_level(request):
    data = request.get_json()
    id = data.get('id')
    projectLevel = data.get('projectLevel')
    if not id or not projectLevel:
        return jsonify({'error': 'Invalid input'}), 400
    rowcount = execute("UPDATE Projects SET ProjectLevel = ? WHERE ID = ?", (projectLevel, id))
    if rowcount == 0:
        return jsonify({'error': 'Record not found'}), 404
    return jsonify({'message': 'Project level updated successfully'}), 200


def update_project_status(request):
    data = request.get_json()
    id = data.get('id')
    status = data.get('status')
    if not id or not status:
        return jsonify({'error': 'Invalid input'}), 400
    rowcount = execute("UPDATE Projects SET Status = ? WHERE ID = ?", (status, id))
    if rowcount == 0:
        return jsonify({'error': 'Record not found'}), 404
    return jsonify({'message': 'Project status updated successfully'}), 200


def update_project_start_date(request):
    data = request.get_json()
    id = data.get('id')
    startDate = data.get('startDate')
    if not id or not startDate:
        return jsonify({'error': 'Invalid input'}), 400
    rowcount = execute("UPDATE Projects SET StartDate = ? WHERE ID = ?", (startDate, id))
    if rowcount == 0:
        return jsonify({'error': 'Record not found'}), 404
    return jsonify({'message': 'StartDate updated successfully'}), 200


def update_project(request):
    data = request.get_json()
    id = data.get('id')
    column = data.get('column')
    value = data.get('value')
    if not id or not column or value is None:
        return jsonify({'error': 'Invalid input'}), 400
    rowcount = execute(f"UPDATE Projects SET {column} = ? WHERE ID = ?", (value, id))
    if rowcount == 0:
        return jsonify({'error': 'Record not found'}), 404
    return jsonify({'message': 'Project updated successfully'}), 200


def refresh_all_projects():
    results = []
    try:
        data = get_all_projects()  # 重用已改造的函数
        for item in data:
            project_id = item['ID']
            task_id = item['TaskID']
            test_round = item['TestRound']

            if not task_id or not test_round:
                results.append({
                    "project_id": project_id,
                    "status": "跳过",
                    "reason": "手工创建项目，不支持刷新"
                })
                continue

            try:
                task_people_data = get_person_idms(task_id, int(test_round))
                processed_executors = 0

                for name, values in task_people_data.items():
                    # 获取任务天数
                    days_row = fetch_one(
                        "SELECT Days FROM Executors WHERE ProjectID = ? AND ExecutorName = ?",
                        (project_id, name)
                    )
                    task_days = days_row['Days'] if days_row else None

                    # 判断数据是否存在
                    exists = fetch_one(
                        "SELECT COUNT(*) AS cnt FROM Executors WHERE ProjectID = ? AND ExecutorName = ?",
                        (project_id, name)
                    )['cnt'] > 0

                    # 判断是否需要更新期望DI
                    expected_updated_row = fetch_one(
                        "SELECT IsExpectedUpdated FROM Executors WHERE ProjectID = ? AND ExecutorName = ?",
                        (project_id, name)
                    )
                    expected_updated = expected_updated_row['IsExpectedUpdated'] if expected_updated_row else 0

                    # 设置默认天数
                    if not task_days:
                        task_type_check = get_task_factor(task_id)[1]
                        task_days = 15 if task_type_check == "ADCP" else 10

                    # 查找匹配的执行人
                    found_executor = next((item for item in BASE_DI_LIST if item[0] == name), None)
                    if not found_executor:
                        expected_issues = 1
                        expected_di = 1
                        print(f"处理项目{project_id}时，{name}的员工基线数据未找到")
                    elif expected_updated == 1:
                        row = fetch_one(
                            "SELECT ExpectedDI, ExpectedIssues FROM Executors WHERE ProjectID = ? AND ExecutorName = ?",
                            (project_id, name)
                        )
                        expected_di = row['ExpectedDI'] if row else 1
                        expected_issues = row['ExpectedIssues'] if row else 1
                    else:
                        expected_issues = round(task_days * round((found_executor[1] / 0.7), 2))
                        expected_di = round(task_days * found_executor[1], 2)
                        expected_di = expected_di or 1
                        expected_issues = expected_issues or 1

                    # 确定达标状态
                    issues_on_target = int(values[0] >= expected_issues)
                    di_on_target = int(values[1] >= expected_di)

                    if not exists:
                        execute("""
                            INSERT INTO Executors (
                                ExecutorName, ExpectedIssues, ExpectedDI, ActualIssues, ActualDI, 
                                Level1Issues, Level2Issues, Level3Issues, Level4Issues, 
                                IsIssuesOnTarget, IsDIOnTarget, IsTargetIssuesOnTarget, IsTargetDIOnTarget, 
                                ProjectID, Days
                            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        """, (
                            name, expected_issues, expected_di, values[0], values[1],
                            values[2], values[3], values[4], values[5],
                            0, 0, issues_on_target, di_on_target,
                            project_id, task_days
                        ))
                    else:
                        execute("""
                            UPDATE Executors SET
                                ExpectedIssues = ?,
                                ExpectedDI = ?,
                                ActualIssues = ?,
                                ActualDI = ?,
                                Level1Issues = ?,
                                Level2Issues = ?,
                                Level3Issues = ?,
                                Level4Issues = ?,
                                IsIssuesOnTarget = ?,
                                IsDIOnTarget = ?,
                                IsTargetIssuesOnTarget = ?,
                                IsTargetDIOnTarget = ?,
                                Days = ?
                            WHERE ProjectID = ? AND ExecutorName = ?
                        """, (
                            expected_issues, expected_di, values[0], values[1],
                            values[2], values[3], values[4], values[5],
                            0, 0, issues_on_target, di_on_target,
                            task_days, project_id, name
                        ))
                    processed_executors += 1

                results.append({
                    "project_id": project_id,
                    "status": "成功",
                    "processed_executors": processed_executors
                })

            except Exception as e:
                results.append({
                    "project_id": project_id,
                    "status": "失败",
                    "error": str(e)
                })
                continue  # 不手动 rollback，每次操作是独立提交

        return jsonify({"message": "全部更新完毕", "results": results}), 200

    except Exception as e:
        return jsonify({"error": f"全局错误: {str(e)}", "partial_results": results}), 500


def update_head_counts(request):
    data = request.get_json()
    project_id = data.get('projectID')
    count = data.get('count')

    if project_id is None or count is None:
        return jsonify({'error': 'Project ID and count are required'}), 400

    rowcount = execute("UPDATE Projects SET HeadCounts = ? WHERE ID = ?", (count, project_id))
    if rowcount == 0:
        return jsonify({'error': 'Project not found'}), 404

    return jsonify({'message': 'HeadCounts updated successfully'}), 200




from flask import jsonify
from backend.db.connection import create_connection
from get_from_itest import get_person_idms, get_task_factor

# 执行人相关的所有函数：
# add_executor, get_executors_by_project_id, get_executor_by_executor_id,
# delete_executor, update_executor, update_executor_issues,
# update_executors_data, record_expected_update, reset_expected_update

def add_executor(request):
    try:
        # 从请求中获取 JSON 数据
        executor_data = request.get_json()
        print("Received executor data:", executor_data)

        # 使用与输入数据匹配的小写字段名称
        executor_name = executor_data.get('executorName')
        days = float(executor_data.get('days', 0.0))
        expected_issues = int(executor_data.get('expectedIssues', 0))  # 转换为整数
        expected_di = float(executor_data.get('expectedDI', 0.0))  # 转换为浮点数
        actual_issues = int(executor_data.get('actualIssues', 0))  # 转换为整数
        actual_di = float(executor_data.get('actualDI', 0.0))  # 转换为浮点数
        level1_issues = int(executor_data.get('level1Issues', 0))  # 新增字段：一级问题
        level2_issues = int(executor_data.get('level2Issues', 0))  # 新增字段：二级问题
        level3_issues = int(executor_data.get('level3Issues', 0))  # 新增字段：三级问题
        level4_issues = int(executor_data.get('level4Issues', 0))  # 新增字段：四级问题
        is_issues_on_target = int(executor_data.get('isIssuesOnTarget', 0))  # 转换为整数 (0 或 1)
        is_di_on_target = int(executor_data.get('isDIOnTarget', 0))  # 转换为整数 (0 或 1)
        is_target_issues_on_target = int(executor_data.get('isTargetIssuesOnTarget', 0))  # 新增字段：是否目标问题数达标
        is_target_di_on_target = int(executor_data.get('isTargetDIOnTarget', 0))  # 新增字段：是否目标 DI 达标
        project_id = int(executor_data.get('projectID', 0))  # 转换为整数

        # 验证数据是否完整
        if not all([executor_name, project_id]):  # executor_name 和 project_id 是必需字段
            print("Error: Incomplete data")
            return jsonify({"error": "Incomplete data"}), 400

        conn = create_connection()
        if conn:
            cursor = conn.cursor()

            # 打印调试信息：数据库连接成功
            print("Database connection established.")

            # 打印调试信息：检查是否存在重复记录
            check_sql = "SELECT COUNT(*) FROM Executors WHERE ExecutorName = ? AND ProjectID = ?"
            print("Executing SQL for duplication check:", check_sql)
            print("Parameters:", (executor_name, project_id))
            cursor.execute(check_sql, (executor_name, project_id))
            (count,) = cursor.fetchone()
            print("Duplication check result:", count)

            if count > 0:
                # 如果存在重复项
                cursor.close()
                conn.close()
                print("Error: Executor with the same name and project ID already exists")
                return jsonify({"error": "Executor with the same name and project ID already exists"}), 409

            # 打印调试信息：准备插入新记录
            insert_sql = """
            INSERT INTO Executors (
                ExecutorName, 
                ExpectedIssues, 
                ExpectedDI, 
                ActualIssues, 
                ActualDI, 
                Level1Issues, 
                Level2Issues, 
                Level3Issues, 
                Level4Issues, 
                IsIssuesOnTarget, 
                IsDIOnTarget, 
                IsTargetIssuesOnTarget, 
                IsTargetDIOnTarget, 
                ProjectID,
                Days
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """
            # print("Executing SQL for insertion:", insert_sql)
            # print("Parameters:", (
            #     executor_name,
            #     expected_issues,
            #     expected_di,
            #     actual_issues,
            #     actual_di,
            #     level1_issues,
            #     level2_issues,
            #     level3_issues,
            #     level4_issues,
            #     is_issues_on_target,
            #     is_di_on_target,
            #     is_target_issues_on_target,
            #     is_target_di_on_target,
            #     project_id
            # ))
            cursor.execute(insert_sql, (
                executor_name,
                expected_issues,
                expected_di,
                actual_issues,
                actual_di,
                level1_issues,
                level2_issues,
                level3_issues,
                level4_issues,
                is_issues_on_target,
                is_di_on_target,
                is_target_issues_on_target,
                is_target_di_on_target,
                project_id,
                days
            ))
            conn.commit()

            # 打印调试信息：记录插入成功
            print("Record inserted successfully.")
            cursor.close()
            conn.close()
            return jsonify({"message": "Executor added successfully"}), 201
        else:
            print("Error: Database connection failed")
            return jsonify({"error": "Database connection failed"}), 500

    except ValueError as ve:
        # 捕获类型转换错误
        print("ValueError occurred while adding an executor:", ve)
        return jsonify({"error": "Invalid data type"}), 400
    except Exception as e:
        # 捕获其他异常并返回服务器错误
        print("An error occurred while adding an executor:", e)
        return jsonify({"error": str(e)}), 500


def get_executors_by_project_id(project_id):
    conn = create_connection()
    executors = []
    if conn:
        try:
            cursor = conn.cursor()
            # 查询与指定 project_id 相关的执行人
            cursor.execute("SELECT * FROM Executors WHERE ProjectID = ?", (project_id,))
            columns = [column[0] for column in cursor.description]

            for row in cursor.fetchall():
                executor = dict(zip(columns, row))
                executors.append(executor)
        except Exception as e:
            print(f"An error occurred while fetching the executors for project ID {project_id}:", e)
        finally:
            cursor.close()
            conn.close()
    else:
        print("Connection to the database failed.")

    if not executors:
        return jsonify({"error": "Executors not found"}), 404

    return jsonify(executors), 200


def get_executor_by_executor_id(executor_id):
    conn = create_connection()  # 创建数据库连接
    executors = []  # 定义一个空数组，用于存储结果
    if conn:
        try:
            cursor = conn.cursor()
            # 查询与指定 executor_id 相关的执行人
            cursor.execute("SELECT * FROM Executors WHERE ID = ?", (executor_id,))
            columns = [column[0] for column in cursor.description]
            row = cursor.fetchone()
            if row:
                executor = dict(zip(columns, row))
                executors.append(executor)  # 将结果封装为数组
        except Exception as e:
            print(f"An error occurred while fetching the executor for ID {executor_id}:", e)
        finally:
            cursor.close()
            conn.close()
    else:
        print("Connection to the database failed.")

    if not executors:  # 检查数组是否为空
        return jsonify({"error": "Executor not found"}), 404

    return jsonify(executors), 200  # 返回数组


def delete_executor(request):
    try:
        data = request.get_json()
        executor_id = data.get('id')

        if not executor_id:
            return jsonify({"message": "No executor ID provided"}), 400

        conn = create_connection()
        if conn:
            try:
                cursor = conn.cursor()
                cursor.execute("DELETE FROM Executors WHERE ID = ?", (executor_id,))
                conn.commit()
                cursor.close()
                print(f"Executor with ID {executor_id} deleted.")
            except Exception as e:
                print(f"Error executing delete operation: {e}")
                return jsonify({"message": "Failed to delete executor"}), 500
            finally:
                conn.close()
        else:
            return jsonify({"message": "Database connection failed"}), 500

        return jsonify({"message": "Executor deleted successfully!"}), 200
    except Exception as e:
        print(f"Error deleting executor: {e}")
        return jsonify({"message": str(e)}), 400


def update_executor(request):
    try:
        data = request.get_json()
        # print("Received data:", data)
        id = int(data.get('id', 0))
        column = data.get('column')
        value = data.get('value')
        integer_columns = {"ExpectedIssues", "ActualIssues", "Level1Issues", "Level2Issues",
                           "Level3Issues", "Level4Issues", "IsIssuesOnTarget", "IsDIOnTarget",
                           "IsTargetIssuesOnTarget", "IsTargetDIOnTarget"}

        float_columns = {"ExpectedDI", "ActualDI"}

        if column in integer_columns:
            value = int(data.get('value', 0))

        if column in float_columns:
            value = float(data.get('value', 0.0))
        # print("Parsed id:", id)
        # print("Parsed column:", column)
        # print("Parsed value:", value)

        if id is None or column is None or value is None:
            return jsonify({'error': 'Invalid input'}), 400

        # Convert value to an integer explicitly
        value = int(value) if isinstance(value, (int, bool)) else value

        conn = create_connection()
        cursor = conn.cursor()

        # Debug: Print the SQL statement and parameters
        # print(f"Executing SQL: UPDATE executors SET {column} = ? WHERE ID = ? with values ({value}, {id})")

        cursor.execute(f"UPDATE executors SET {column} = ? WHERE ID = ?", (value, id))
        conn.commit()

        if cursor.rowcount == 0:
            return jsonify({'error': 'Record not found'}), 404

        conn.close()
        return jsonify({'message': 'Test executors update successfully'}), 200

    except pyodbc.Error as ex:
        sqlstate = ex.args[0]
        return jsonify({'error': f'SQL error: {sqlstate}'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500


def update_executor_issues(request):
    data = request.get_json()
    executor_id = data.get('executorId')
    # days = data.get('Days', 0)
    level1_issues = data.get('level1Issues', 0)
    level2_issues = data.get('level2Issues', 0)
    level3_issues = data.get('level3Issues', 0)
    level4_issues = data.get('level4Issues', 0)
    actual_issues = data.get('actualIssues', 0)
    # print(level1_issues)
    # print(level2_issues)
    # print(level3_issues)
    # print(level4_issues)
    # print(actual_issues)
    if not executor_id:
        return jsonify({'error': 'Invalid executor ID'}), 400

    try:
        conn = create_connection()  # 替换为您的数据库连接函数
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE executors
            SET Level1Issues = ?, Level2Issues = ?, Level3Issues = ?, Level4Issues = ?, ActualIssues = ?
            WHERE ID = ?
        """, (level1_issues, level2_issues, level3_issues, level4_issues, actual_issues, executor_id))
        conn.commit()
        return jsonify({'message': 'Executor issues updated successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


def update_executors_data(request):
    conn = create_connection()
    # 获取前端发送的JSON数据
    data = request.get_json()
    print(f"#################\nupdate_executors_data:{data}\n############################")
    project_id = data.get('id')  # 获取要刷新的项目 ID
    cursor = conn.cursor()
    cursor.execute(f"SELECT TaskID FROM Projects WHERE ID = '{project_id}';")
    task_id = cursor.fetchval()
    cursor.execute(f"SELECT TestRound FROM Projects WHERE ID = '{project_id}';")
    test_round = cursor.fetchval()
    cursor.execute(f"SELECT StartDate FROM Projects WHERE ID = '{project_id}';")
    start_date = cursor.fetchval()

    if task_id and test_round:
        task_people_data = get_person_idms(task_id, int(test_round))

        for name, values in task_people_data.items():
            # 获取任务天数
            cursor.execute(
                "SELECT Days FROM Executors WHERE ProjectID = ? AND ExecutorName = ?",
                (project_id, name)
            )
            task_days = cursor.fetchone()
            task_days = task_days[0] if task_days else None

            # 判断数据是否存在
            cursor.execute(
                "SELECT COUNT(*) FROM Executors WHERE ProjectID = ? AND ExecutorName = ?",
                (project_id, name)
            )
            exists = cursor.fetchone()[0] > 0

            # 判断是否需要更新期望DI
            cursor.execute(
                "SELECT IsExpectedUpdated FROM Executors WHERE ProjectID = ? AND ExecutorName = ?",
                (project_id, name)
            )
            expected_updated = cursor.fetchone()[0]
            # print(f"project_id={project_id}, name={name}, expected_updated= {expected_updated}")

            # 设置默认天数
            if not task_days:
                task_type_check = get_task_factor(task_id)[1]
                task_days = 15 if task_type_check == "ADCP" else 10

            # 查找匹配的执行人
            found_executor = next((item for item in base_di_list if item[0] == name), None)
            if not found_executor:
                expected_issues = 1
                expected_di = 1
                print(f"{name}数据未找到")
            elif expected_updated == 1:
                cursor.execute(
                        "SELECT ExpectedDI,ExpectedIssues FROM Executors WHERE ProjectID = ? AND ExecutorName = ?",
                        (project_id, name)
                    )
                results = cursor.fetchone()
                expected_di = results[0] if results else 1
                expected_issues = results[1] if results else 1
            else:
                expected_issues = round(task_days * round((found_executor[1]/0.7),2))
                expected_di = round(task_days * found_executor[1], 2)
                # 这里需要检查#######################################
                if expected_di == 0:
                    expected_di = 1
                if expected_issues == 0:
                    expected_issues = 1

            # 确定达标状态
            issues_on_target = int(values[0] >= expected_issues)
            di_on_target = int(values[1] >= expected_di)

            if not exists:
                cursor.execute("""
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
                # if values[0] >= expected_issues and values[1] >= expected_di:
                #     cursor.execute(insert_sql, (
                #         name, expected_issues, expected_di, values[0], values[1], values[2], values[3],
                #         values[4], values[5], 0, 0, 1, 1,
                #         project_id, task_days))
                # elif values[0] < expected_issues and values[1] >= expected_di:
                #     cursor.execute(insert_sql, (
                #         name, expected_issues, expected_di, values[0], values[1], values[2], values[3],
                #         values[4], values[5], 0, 0, 0, 1,
                #         project_id, task_days))
                # elif values[0] >= expected_issues and values[1] < expected_di:
                #     cursor.execute(insert_sql, (
                #         name, expected_issues, expected_di, values[0], values[1], values[2], values[3],
                #         values[4], values[5], 0, 0, 1, 0,
                #         project_id, task_days))
                # else:
                #     cursor.execute(insert_sql, (
                #         name, expected_issues, expected_di, values[0], values[1], values[2], values[3],
                #         values[4], values[5], 0, 0, 0, 0,
                #         project_id, task_days))
            else:
                cursor.execute("""
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

        conn.commit()
        return jsonify({"message": "Project data refresh successfully!"}), 200
    else:
        return jsonify({"message": "Project data no task ID for refresh!"}), 400


def record_expected_update(request):
    conn = create_connection()
    cursor = conn.cursor()
    data = request.get_json()
    project_id = data.get('projectID')
    executor_id = data.get('executorID')
    update_expected = data.get('updateExpected')
    # print(f"project_id={project_id}, executor_id={executor_id}, update_expected= {update_expected}")
    try:
        if not all([project_id, executor_id, update_expected is not None]):
            return jsonify({"error": "Missing required fields (projectID, executorID, updateExpected)"}), 400
        # 更新 Executors 表的 updateExpected 字段
        cursor.execute("""
            UPDATE Executors 
            SET IsExpectedUpdated = ?
            WHERE ID = ? AND ProjectID = ?
        """, (update_expected, executor_id, project_id))

        conn.commit()  # 提交事务
        # print(
        #     f"Updated Executors table: ExecutorID={executor_id}, ProjectID={project_id}, updateExpected={update_expected}")

        return jsonify({"message": "Expected update recorded successfully"}), 200
    except Exception as e:
        conn.rollback()  # 回滚事务
        print(f"Error updating Executors table: {e}")
        return jsonify({"error": "Failed to update expected status"}), 500
    finally:
        cursor.close()
        conn.close()  # 确保连接关闭


def reset_expected_update(request):
    conn = create_connection()
    cursor = conn.cursor()
    data = request.get_json()
    project_id = data.get('projectID')
    executor_id = data.get('executorID')

    try:
        # 检查必填字段
        if not all([project_id, executor_id]):
            return jsonify({"error": "Missing required fields (projectID, executorID)"}), 400

        # 将 IsExpectedUpdated 重置为 0
        cursor.execute("""
            UPDATE Executors 
            SET IsExpectedUpdated = 0
            WHERE ID = ? AND ProjectID = ?
        """, (executor_id, project_id))

        conn.commit()  # 提交事务
        return jsonify({"message": "Expected update reset successfully"}), 200

    except Exception as e:
        conn.rollback()  # 回滚事务
        print(f"Error resetting expected update: {e}")
        return jsonify({"error": "Failed to reset expected status"}), 500

    finally:
        cursor.close()
        conn.close()  # 确保连接关闭


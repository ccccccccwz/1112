import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime, timedelta
import random

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000"], supports_credentials=True)

# 模拟数据存储
projects_db = []
executors_db = []
next_project_id = 1
next_executor_id = 1

# 初始化假数据
def init_fake_data():
    global next_project_id, next_executor_id, projects_db, executors_db

    test_groups = ["路由", "交换", "安全"]
    project_levels = ["重要", "普通"]
    statuses = ["进行中", "已完成"]
    executor_names = ["张三", "李四", "王五", "赵六", "钱七", "孙八", "周九", "吴十"]

    # 创建5个项目
    for i in range(5):
        start_date = datetime.now() - timedelta(days=random.randint(30, 180))
        project = {
            "ID": next_project_id,
            "TestGroup": random.choice(test_groups),
            "ProjectName": f"测试项目{i+1}-版本{random.randint(1,10)}鉴定测试",
            "ConversionFactor": round(random.uniform(0.5, 2.0), 2),
            "ProjectLevel": random.choice(project_levels),
            "HeadCounts": random.randint(3, 8),
            "ExpectedIssues": random.randint(50, 200),
            "ExpectedDI": round(random.uniform(20, 80), 2),
            "AverageIssues": random.randint(10, 30),
            "AverageDI": round(random.uniform(5, 15), 2),
            "StartDate": start_date.strftime("%Y-%m-%d"),
            "Status": random.choice(statuses),
            "TaskID": f"T2025{random.randint(10,12)}{random.randint(10,28)}{random.randint(1000,9999)}" if i % 2 == 0 else None,
            "TestRound": str(random.randint(1, 3)) if i % 2 == 0 else None
        }
        projects_db.append(project)

        # 为每个项目创建执行人
        num_executors = random.randint(3, 6)
        for j in range(num_executors):
            days = random.randint(10, 20)
            expected_issues = random.randint(8, 25)
            expected_di = round(random.uniform(3, 12), 2)
            actual_issues = random.randint(5, 30)
            level1 = random.randint(0, 3)
            level2 = random.randint(0, 5)
            level3 = random.randint(2, 10)
            level4 = random.randint(1, 8)
            actual_di = round(level1 * 10 * project["ConversionFactor"] +
                            level2 * 3 * project["ConversionFactor"] +
                            level3 * project["ConversionFactor"] +
                            level4 * 0.5 * project["ConversionFactor"], 2)

            executor = {
                "ID": next_executor_id,
                "ExecutorName": random.choice(executor_names),
                "ExpectedIssues": expected_issues,
                "ExpectedDI": expected_di,
                "ActualIssues": actual_issues,
                "ActualDI": actual_di,
                "Level1Issues": level1,
                "Level2Issues": level2,
                "Level3Issues": level3,
                "Level4Issues": level4,
                "IsIssuesOnTarget": 0,
                "IsDIOnTarget": 0,
                "IsTargetIssuesOnTarget": 1 if actual_issues >= expected_issues else 0,
                "IsTargetDIOnTarget": 1 if actual_di >= expected_di else 0,
                "ProjectID": next_project_id,
                "Days": days,
                "IsExpectedUpdated": 0
            }
            executors_db.append(executor)
            next_executor_id += 1

        next_project_id += 1

# 项目API
@app.route('/api/projects/projects', methods=['GET'])
def get_projects():
    return jsonify(projects_db)

@app.route('/api/projects/add_project', methods=['POST'])
def add_project():
    global next_project_id
    data = request.json

    if data.get('dataSource') == 'itest':
        project = {
            "ID": next_project_id,
            "TestGroup": data['testgroup'],
            "ProjectName": f"iTest项目-{data['taskId']}-第{data['testRound']}轮",
            "ConversionFactor": round(random.uniform(0.8, 1.5), 2),
            "ProjectLevel": data['projectlevel'],
            "HeadCounts": random.randint(3, 6),
            "ExpectedIssues": data.get('expectedissues', random.randint(50, 150)),
            "ExpectedDI": data.get('expecteddi', round(random.uniform(20, 60), 2)),
            "AverageIssues": random.randint(10, 25),
            "AverageDI": round(random.uniform(5, 12), 2),
            "StartDate": datetime.now().strftime("%Y-%m-%d"),
            "Status": data.get('status', '进行中'),
            "TaskID": data['taskId'],
            "TestRound": data['testRound']
        }
    else:
        project = {
            "ID": next_project_id,
            "TestGroup": data['testgroup'],
            "ProjectName": data['projectname'],
            "ConversionFactor": data.get('conversionFactor', 1.0),
            "ProjectLevel": data['projectlevel'],
            "HeadCounts": data.get('headcounts', 1),
            "ExpectedIssues": data['expectedissues'],
            "ExpectedDI": data['expecteddi'],
            "AverageIssues": data.get('AverageIssues'),
            "AverageDI": data.get('AverageDI'),
            "StartDate": data['startdate'],
            "Status": data.get('status', '进行中'),
            "TaskID": None,
            "TestRound": None
        }

    projects_db.append(project)
    next_project_id += 1
    return jsonify({"message": "Project added successfully"}), 201

@app.route('/api/projects/delete_project', methods=['POST'])
def delete_project():
    global projects_db, executors_db
    project_id = request.json.get('id')
    projects_db = [p for p in projects_db if p['ID'] != project_id]
    executors_db = [e for e in executors_db if e['ProjectID'] != project_id]
    return jsonify({"message": "Deleted successfully"}), 200

@app.route('/api/projects/update_project', methods=['POST'])
def update_project():
    data = request.json
    project_id = data.get('id')
    column = data.get('column')
    value = data.get('value')

    for project in projects_db:
        if project['ID'] == project_id:
            project[column] = value
            break

    return jsonify({"message": "Updated successfully"}), 200

@app.route('/api/projects/refresh_all_projects', methods=['POST'])
def refresh_all_projects():
    results = []
    for project in projects_db:
        if project['TaskID']:
            results.append({
                "project_id": project['ID'],
                "status": "成功",
                "processed_executors": len([e for e in executors_db if e['ProjectID'] == project['ID']])
            })
    return jsonify({"message": "全部更新完毕", "results": results}), 200

# 执行人API
@app.route('/api/executors/executors/<int:project_id>', methods=['GET'])
def get_executors(project_id):
    executors = [e for e in executors_db if e['ProjectID'] == project_id]
    return jsonify(executors)

@app.route('/api/executors/add_executor', methods=['POST'])
def add_executor():
    global next_executor_id
    data = request.json

    executor = {
        "ID": next_executor_id,
        "ExecutorName": data['executorName'],
        "ExpectedIssues": data['expectedIssues'],
        "ExpectedDI": data['expectedDI'],
        "ActualIssues": 0,
        "ActualDI": 0,
        "Level1Issues": 0,
        "Level2Issues": 0,
        "Level3Issues": 0,
        "Level4Issues": 0,
        "IsIssuesOnTarget": 0,
        "IsDIOnTarget": 0,
        "IsTargetIssuesOnTarget": 0,
        "IsTargetDIOnTarget": 0,
        "ProjectID": data['projectId'],
        "Days": data['days'],
        "IsExpectedUpdated": 0
    }

    executors_db.append(executor)
    next_executor_id += 1
    return jsonify({"message": "Executor added successfully"}), 201

@app.route('/api/executors/delete_executor', methods=['POST'])
def delete_executor():
    global executors_db
    executor_id = request.json.get('id')
    executors_db = [e for e in executors_db if e['ID'] != executor_id]
    return jsonify({"message": "Deleted successfully"}), 200

@app.route('/api/executors/update_executor', methods=['POST'])
def update_executor():
    data = request.json
    executor_id = data.get('id')

    for executor in executors_db:
        if executor['ID'] == executor_id:
            for key, value in data.items():
                if key != 'id':
                    executor[key] = value

            # 重新计算ActualDI和ActualIssues
            project = next((p for p in projects_db if p['ID'] == executor['ProjectID']), None)
            if project:
                factor = project['ConversionFactor']
                executor['ActualDI'] = round(
                    executor['Level1Issues'] * 10 * factor +
                    executor['Level2Issues'] * 3 * factor +
                    executor['Level3Issues'] * factor +
                    executor['Level4Issues'] * 0.5 * factor, 2
                )
                executor['ActualIssues'] = (executor['Level1Issues'] +
                                          executor['Level2Issues'] +
                                          executor['Level3Issues'] +
                                          executor['Level4Issues'])

                executor['IsTargetIssuesOnTarget'] = 1 if executor['ActualIssues'] >= executor['ExpectedIssues'] else 0
                executor['IsTargetDIOnTarget'] = 1 if executor['ActualDI'] >= executor['ExpectedDI'] else 0
            break

    return jsonify({"message": "Updated successfully"}), 200

@app.route('/api/executors/reset_expected_update', methods=['POST'])
def reset_expected_update():
    executor_id = request.json.get('id')
    for executor in executors_db:
        if executor['ID'] == executor_id:
            executor['IsExpectedUpdated'] = 0
            # 重新计算期望值
            executor['ExpectedIssues'] = random.randint(8, 25)
            executor['ExpectedDI'] = round(random.uniform(3, 12), 2)
            break
    return jsonify({"message": "Reset successfully"}), 200

# 统计API
@app.route('/api/statistics', methods=['GET'])
def get_statistics():
    start = request.args.get('start')
    end = request.args.get('end')

    # 筛选日期范围内的项目
    filtered_projects = projects_db
    if start and end:
        filtered_projects = [
            p for p in projects_db
            if start <= p['StartDate'] <= end
        ]

    if not filtered_projects:
        return jsonify({"labels": [], "values": []})

    # 计算每个执行人的总DI
    executor_di_map = {}
    for project in filtered_projects:
        project_executors = [e for e in executors_db if e['ProjectID'] == project['ID']]
        for executor in project_executors:
            name = executor['ExecutorName']
            if name not in executor_di_map:
                executor_di_map[name] = 0
            executor_di_map[name] += executor['ActualDI']

    # 排序并返回
    sorted_executors = sorted(executor_di_map.items(), key=lambda x: x[1], reverse=True)
    labels = [item[0] for item in sorted_executors[:10]]
    values = [item[1] for item in sorted_executors[:10]]

    return jsonify({"labels": labels, "values": values})

if __name__ == '__main__':
    init_fake_data()
    print("=" * 60)
    print("测试后端已启动!")
    print(f"已创建 {len(projects_db)} 个项目和 {len(executors_db)} 个执行人的假数据")
    print("访问地址: http://localhost:65001")
    print("=" * 60)

    host = os.environ.get('FLASK_HOST', '0.0.0.0')
    port = int(os.environ.get('FLASK_PORT', 65001))
    app.run(host=host, port=port, debug=True)

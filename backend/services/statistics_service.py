# services/statistics_service.py
from flask import render_template, redirect, url_for, jsonify
from backend.db.connection import create_connection
from backend.utils.common_utils import ALLOWED_EXECUTORS, BASE_DI_LIST
from backend.utils.common_utils import get_quarter_range, validate_dates, calculate_final_di, get_quarter_dates
from get_from_itest import get_task_factor
from datetime import datetime

#  / 、/task、/cal_target_di、/statistical_di 的逻辑 + cal_per_di
# 把 request 参数传入函数，从 routes 调用

def index(request):
    if request.method == 'POST':
        # 接收表单数据而不是JSON
        current_start = request.form.get('start_time')
        current_end = request.form.get('end_time')
        # 验证参数有效性
        if not validate_dates(current_start, current_end):
            return redirect(url_for('index')) # 这个返回有bug

        # 重定向到GET请求并携带参数
        return redirect(url_for('statistics.index_route', start=current_start, end=current_end))

    # GET请求处理（包含重定向后的参数）
    current_start = request.args.get('start', default=get_quarter_range()[0])
    current_end = request.args.get('end', default=get_quarter_range()[1])
    conn = create_connection()
    if conn:
        try:
            cursor = conn.cursor()
            query_project = f"SELECT ID,ExpectedDI,ProjectLevel,AverageDI,ConversionFactor,TaskID FROM Projects WHERE StartDate BETWEEN '{current_start}' AND '{current_end}';"
            cursor.execute(query_project)
            project_info = [[project.ID,project.ExpectedDI,project.ProjectLevel,project.AverageDI,project.ConversionFactor,project.TaskID] for project in cursor.fetchall()]
            project_factor = []

            # 项目因子计算：
            for item in project_info:
                if item[5]:
                    task_type_check = get_task_factor(item[5])[1]
                    total_days = 15 if task_type_check == "ADCP" else 10
                else:
                    total_days = -1

                if item[2] == '重要':
                    query_sum_di = f"SELECT SUM(ISNULL(ActualDI, 0)) FROM Executors WHERE ProjectID = {item[0]};"
                    cursor.execute(query_sum_di)
                    sum_di = cursor.fetchval()
                    if sum_di:
                        project_factor.append([item[0], round(sum_di / item[1], 2), item[3], item[4], total_days])
                if item[2] == '普通':
                    query_sum_di = f"SELECT SUM(ISNULL(ActualDI, 0)) FROM Executors WHERE ProjectID = {item[0]};"
                    cursor.execute(query_sum_di)
                    sum_di = cursor.fetchval()
                    if sum_di:
                        if sum_di < item[1]:
                            project_factor.append([item[0], round(sum_di / item[1],2), item[3], item[4], total_days])
                        else:
                            project_factor.append([item[0], 1, item[3], item[4], total_days])
            user_di_info = []
            # 目标DI不能为0
            # project_factor: item[0]=project.ID; item[1]=项目因子; item[2]=项目平均预期DI; item[3]=产品系数; item[4]=total_days;
            for item in project_factor:
                query_project_di = f"SELECT ExecutorName,ActualDI,ExpectedDI,Level1Issues,Level2Issues,Level3Issues,Level4Issues,Days FROM Executors WHERE ProjectID = {item[0]};"
                cursor.execute(query_project_di)
                # less_pro_average_user_di = [[user_item.ExecutorName, round((user_item.Level1Issues*10*item[3]+user_item.Level2Issues*3*item[3]+user_item.Level3Issues*item[3]+user_item.Level4Issues*0.5*item[3])*item[1]*round(user_item.ActualDI/item[2],2),2), user_item.ExpectedDI, user_item.ActualDI] if user_item.ActualDI  < item[2]else [user_item.ExecutorName, round((user_item.Level1Issues*10*item[3]+user_item.Level2Issues*3*item[3]+user_item.Level3Issues*item[3]+user_item.Level4Issues*0.5*item[3])*item[1],2), user_item.ExpectedDI, user_item.ActualDI] for user_item in cursor.fetchall()]
                # print(less_pro_average_user_di)
                # 暂时将系数固定为0.9
                # less_pro_average_user_di = [[user_item.ExecutorName, round((user_item.Level1Issues*10*item[3]+user_item.Level2Issues*3*item[3]+user_item.Level3Issues*item[3]+user_item.Level4Issues*0.5*item[3])*item[1]*0.9,2), user_item.ExpectedDI, user_item.ActualDI] if user_item.ActualDI  < item[2]else [user_item.ExecutorName, round((user_item.Level1Issues*10*item[3]+user_item.Level2Issues*3*item[3]+user_item.Level3Issues*item[3]+user_item.Level4Issues*0.5*item[3])*item[1],2), user_item.ExpectedDI, user_item.ActualDI] for user_item in cursor.fetchall()]
                # 个人目标DI不能为0
                # print(less_pro_average_user_di)

                less_pro_average_user_di = [
                    [user_item.ExecutorName,
                     calculate_final_di(user_item, item),
                     user_item.ExpectedDI,
                     user_item.ActualDI]
                    for user_item in cursor.fetchall()
                ]

                more_person_target_user_di = [[per_item[0], round(per_item[1]*min(per_item[3]/per_item[2], 1.2),2)] if per_item[1] > per_item[2] else [per_item[0], per_item[1]] for per_item in less_pro_average_user_di]
                user_di_info.extend(more_person_target_user_di)

            # 用字典合并同名数据
            merged = {}
            for item in user_di_info:
                name = item[0]
                values = item[1]
                if name not in merged:
                    merged[name] = values
                else:
                    merged[name] += values

            # 生成结果列表，忽略最后两个布尔值
            result = sorted([(name, round(sums, 2)) for name, sums in merged.items()], key=lambda x:x[1], reverse=True)
            # print(result)  # 返回合并人名后的列表，每个人的数据为一个元组，内容依次为：人名，实际DI
            # 使用列表推导式过滤
            filtered_data = [(name, di) for name, di in result if name in ALLOWED_EXECUTORS]
            print(filtered_data)
            user_di_dict = {row[0]: row[1] for row in filtered_data}
            return render_template('index.html', values=tuple(user_di_dict.values()), labels=tuple(user_di_dict.keys()), start_time=current_start,
                         end_time=current_end)
        except Exception as e:
            print("查询数据库数据出错：",e)
    else:
        print("数据库连接错误！")


def task():
    # 渲染HTML页面
    return render_template('task.html')


def cal_per_di(conn=create_connection()):
    # conn = create_connection()
    quarter = get_quarter_dates()
    all_di_info = []
    if conn:
        try:
            cursor = conn.cursor()
            for item in quarter:
                di_info = []
                merged = {}
                query_pro = f"SELECT ID FROM Projects WHERE StartDate BETWEEN '{item[0]}' AND '{item[1]}';"
                cursor.execute(query_pro)
                pro_info = [project.ID for project in cursor.fetchall()]
                for pro_id in pro_info:
                    query_di = f"SELECT ExecutorName,ActualDI,ActualIssues,Days FROM Executors WHERE ProjectID = {pro_id};"
                    cursor.execute(query_di)
                    di_item = [[per_item.ExecutorName, per_item.ActualDI, per_item.ActualIssues, per_item.Days] for per_item in cursor.fetchall()]
                    di_info.extend(di_item)
                for sub_list in di_info:
                    key = sub_list[0]
                    values = sub_list[1:]  # 提取数值部分，如 [1,2,3]
                    if key not in merged:
                        merged[key] = values.copy()  # 初次遇到 key，直接存储数值
                    else:
                        # 合并数值：将当前数值逐个加到已有结果上
                        for i in range(len(values)):
                            merged[key][i] += values[i]
                new_dict = {
                    k: [round(v[0] / v[2],2), round(v[1] / v[2], 2)]
                    for k, v in merged.items()
                }
                all_di_info.append(new_dict)

            avg_di_info = {}

            for per_quarter in all_di_info:
                for k in per_quarter.keys():
                    if k not in avg_di_info:
                        avg_di_info[k] = []

            for idx in range(len(all_di_info)):
                for k, v in all_di_info[idx].items():
                    if k in avg_di_info.keys():
                        avg_di_info[k] += all_di_info[idx][k]
                        avg_di_info[k] += [[idx]]
            new_avg = {}
            for k,v in avg_di_info.items():
                tmp = []
                for i in range(len(v)-1, 0, -3):
                    tmp.append(v[i][0])
                new_v = [x for x in v if not isinstance(x, list)]
                if 0 not in tmp:
                    new_v = [0,0] + new_v
                if 1 not in tmp:
                    new_v = new_v[:2] + [0,0] + new_v[2:]
                if 2 not in tmp:
                    new_v = new_v[:4] + [0,0] + new_v[4:]
                if 3 not in tmp:
                    new_v = new_v + [0,0]
                new_avg[k] = new_v

            res = [
                [key] + values
                for key, values in new_avg.items()]
            return res
        except Exception as e:
            print("查询数据库数据出错_statis：", e)
    else:
        print("数据库连接错误！")


def statistical_di():
    avt_item = cal_per_di()
    filtered_data = [item for item in avt_item if item[0] in ALLOWED_EXECUTORS]
    avt_dict = {item[0]: item for item in filtered_data}
    # print(filtered_data)
    # 刷新期望DI
    # 遍历 base_di_list 并替换 avt_dict 中对应人的第一个数值
    for name, value in BASE_DI_LIST:
        if name in avt_dict:
            # print(avt_dict[name][1])
            avt_dict[name][1] = value  # 替换q1 DI
            avt_dict[name][2] = round((value / 0.7), 2)
        else:
            # print(f"警告：'{name}' 不在 dic1 中，跳过")  # 可选：处理不存在的键
            pass
    print(filtered_data)
    # 渲染HTML页面
    return render_template('statistical_di.html',avt_items=filtered_data)


def cal_target_di(request):
    # 获取前端发送的JSON数据
    request_data = request.get_json()
    executor_name = request_data.get('executor_name')
    days = float(request_data.get('days', 0))
    target_date = datetime.now()
    last_quarter = (target_date.month - 1) // 3

    avt_item = cal_per_di()
    # 查找匹配的执行人
    found_executor = next(
        (item for item in avt_item if item[0] == executor_name),
        None
    )
    if not found_executor:
        return jsonify({'error': '执行人未找到'}), 404
        # 计算结果
    expected_issues = days * found_executor[2*last_quarter-1]
    expected_di = days * found_executor[2*last_quarter]

    return jsonify({
        'expected_issues': round(expected_issues, 0),
        'expected_di': round(expected_di, 1)
    })


def get_di_data(current_start=None, current_end=None):
    """获取 DI 数据，如果没有日期参数则默认取当前季度"""
    # 默认日期范围
    if not current_start or not current_end:
        current_start, current_end = get_quarter_range()

    conn = create_connection()
    if not conn:
        return {"error": "数据库连接错误"}

    try:
        cursor = conn.cursor()

        # 查询项目基本信息
        query_project = """
        SELECT ID, ExpectedDI, ProjectLevel, AverageDI, ConversionFactor, TaskID
        FROM Projects
        WHERE StartDate BETWEEN ? AND ?;
        """
        cursor.execute(query_project, (current_start, current_end))
        project_info = cursor.fetchall()

        project_factor = []
        for project in project_info:
            project_id = project.ID
            expected_di = project.ExpectedDI
            level = project.ProjectLevel
            avg_di = project.AverageDI
            conv_factor = project.ConversionFactor
            task_id = project.TaskID

            # 任务类型判断
            if task_id:
                task_type_check = get_task_factor(task_id)[1]
                total_days = 15 if task_type_check == "ADCP" else 10
            else:
                total_days = -1

            # 汇总执行者DI
            query_sum_di = """
            SELECT SUM(ISNULL(ActualDI, 0))
            FROM Executors
            WHERE ProjectID = ?;
            """
            cursor.execute(query_sum_di, (project_id,))
            sum_di = cursor.fetchval()

            if sum_di:
                if level == '重要':
                    project_factor.append([project_id,
                                           round(sum_di / expected_di, 2),
                                           avg_di, conv_factor, total_days])
                elif level == '普通':
                    if sum_di < expected_di:
                        project_factor.append([project_id,
                                               round(sum_di / expected_di, 2),
                                               avg_di, conv_factor, total_days])
                    else:
                        project_factor.append([project_id, 1,
                                               avg_di, conv_factor, total_days])

        # 计算每个执行者的DI
        user_di_info = []
        for pf in project_factor:
            query_executors = """
            SELECT ExecutorName, ActualDI, ExpectedDI,
                   Level1Issues, Level2Issues, Level3Issues, Level4Issues, Days
            FROM Executors
            WHERE ProjectID = ?;
            """
            cursor.execute(query_executors, (pf[0],))
            executors = cursor.fetchall()

            less_avg_user_di = [
                [u.ExecutorName,
                 calculate_final_di(u, pf),
                 u.ExpectedDI,
                 u.ActualDI]
                for u in executors
            ]

            more_target_di = [
                [e[0], round(e[1] * min(e[3] / e[2], 1.2), 2)] if e[1] > e[2]
                else [e[0], e[1]]
                for e in less_avg_user_di
            ]

            user_di_info.extend(more_target_di)

        # 合并同名执行者DI
        merged = {}
        for name, di_value in user_di_info:
            merged[name] = merged.get(name, 0) + di_value

        # 排序 & 过滤允许名单
        sorted_res = sorted(merged.items(), key=lambda x: x[1], reverse=True)
        filtered_res = [(name, di) for name, di in sorted_res if name in ALLOWED_EXECUTORS]

        user_di_dict = {name: di for name, di in filtered_res}
        return_data = {
            "labels": list(user_di_dict.keys()),
            "values": list(user_di_dict.values()),
            "start": current_start,
            "end": current_end
        }
        print(return_data)
        return  return_data

    except Exception as e:
        return {"error": str(e)}
    finally:
        if conn:
            conn.close()

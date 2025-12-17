import pandas as pd
from datetime import date, datetime, timedelta
import re
from dateutil.relativedelta import relativedelta

# 允许的执行人列表
def load_person_data(file_path):
    # 读取Excel文件，指定sheet名称
    sheet_name = '员工技能详情'
    data = pd.read_excel(file_path, sheet_name=sheet_name)

    # 提取并处理员工姓名
    employee_names = data['员工姓名'].astype(str)  # 强制转为字符串类型
    cleaned_names = [
        re.sub(r'\s*[\(\（].*?[\)\）]', '', name).strip()  # 同时匹配中英文括号
        for name in employee_names
    ]
    # 去重并转为列表
    unique_names = list(dict.fromkeys(cleaned_names))  # 保持顺序去重
    return unique_names

def load_di_data(file_path):
    # 读取Excel文件，指定sheet名称
    sheet_name = '员工技能详情'
    data = pd.read_excel(file_path, sheet_name=sheet_name)
    # 提取"员工姓名"和"基线DI/人天"列
    employee_names = data['员工姓名']
    baseline_di = data['基线DI/人天']
    # 处理员工姓名，去掉括号内的拼音
    cleaned_names = [re.sub(r'\s*\(.*?\)', '', name).strip() for name in employee_names]
    # 将结果存储为列表
    result = list(zip(cleaned_names, baseline_di))
    return result

def get_quarter_range(input_date=None):
    """
    返回指定日期所属季度的开始和结束日期（格式：YYYY-MM-DD）
    :param input_date: 日期对象（默认为当前日期）
    :return: (季度开始日期, 季度结束日期)
    """
    if input_date is None:
        input_date = date.today()

    year = input_date.year
    month = input_date.month

    # 计算季度及月份范围
    quarter = (month - 1) // 3 + 1
    start_month = 3 * (quarter - 1) + 1
    end_month = start_month + 2  # 季度结束月份（3、6、9、12）

    # 生成季度开始日期（固定为当月1号）
    start_date = date(year, start_month, 1)

    # 动态计算季度结束日期
    if end_month == 12:
        end_date = date(year, 12, 31)
    else:
        # 获取下一季度的首日，再减1天得到本月最后一天
        next_month_first_day = date(year, end_month + 1, 1)
        end_date = next_month_first_day - timedelta(days=1)

    # 格式化为字符串返回
    return start_date.strftime('%Y-%m-%d'), end_date.strftime('%Y-%m-%d')

def validate_dates(start, end):
    """验证日期格式是否正确"""
    try:
        datetime.strptime(start, '%Y-%m-%d')
        datetime.strptime(end, '%Y-%m-%d')
        return True
    except (ValueError, TypeError):
        return False

def calculate_base_di(user_item, project_factor):
    """计算基础DI值"""
    return (user_item.Level1Issues * 10 * project_factor +
            user_item.Level2Issues * 3 * project_factor +
            user_item.Level3Issues * project_factor +
            user_item.Level4Issues * 0.5 * project_factor)

def calculate_final_di(user_item, item):
    """计算最终DI值"""
    base_di = calculate_base_di(user_item, item[3])  # item[3]是项目系数
    # 手工添加的项目，执行天数不加权
    if item[4] == -1:
        days_weight = 1
    else:
        days_weight = user_item.Days / item[4]
    # 判断是否达标
    if user_item.ActualDI < item[2] * days_weight:  # item[2]是预期DI均值，按实际执行天数进行加权
        final_di = base_di * item[1] * 0.9  # item[1]是达标系数，不达标乘以0.9
    else:
        final_di = base_di * item[1]  # 达标则直接乘以达标系数

    return round(final_di, 2)

def get_quarter_dates():
    """获取当前年份的所有季度日期范围"""
    current_year = datetime.now().year
    quarters = []
    quarter_months = [(1, 3), (4, 6), (7, 9), (10, 12)]

    for start_month, end_month in quarter_months:
        # 计算季度开始日期
        start_date = date(current_year, start_month, 1)

        # 计算季度结束日期（下个月首日减去一天）
        if end_month == 12:
            next_year = current_year + 1
            next_month = 1
        else:
            next_year = current_year
            next_month = end_month + 1
        end_date = date(next_year, next_month, 1) - timedelta(days=1)
        # 格式化为字符串
        quarters.append([start_date.strftime('%Y-%m-%d'),end_date.strftime('%Y-%m-%d')])
    return quarters


ALLOWED_EXECUTORS = load_person_data("expected_di.xlsx")
BASE_DI_LIST = load_di_data("expected_di.xlsx")

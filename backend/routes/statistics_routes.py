# routes/statistics_routes.py
from flask import Blueprint, request, jsonify
from backend.services import statistics_service

statistics_bp = Blueprint('statistics', __name__)

@statistics_bp.route('/', methods=['GET'])
def statistics_data_route():
    # 获取请求参数
    current_start = request.args.get('start')
    current_end = request.args.get('end')

    # 调用业务逻辑层
    data = statistics_service.get_di_data(current_start, current_end)
    print(f"-----------------data:{data}")
    # 统一返回 JSON
    return jsonify(data)

@statistics_bp.route('/task')
def task_route():
    return statistics_service.task()

@statistics_bp.route('/cal_target_di', methods=['POST'])
def cal_target_di_route():
    return statistics_service.cal_target_di(request)

@statistics_bp.route('/statistical_di')
def statistical_di_route():
    return statistics_service.statistical_di()
# routes/executor_routes.py
from flask import Blueprint, request
from backend.services import executor_service

executor_bp = Blueprint('executor', __name__)

@executor_bp.route('/add_executor', methods=['POST'])
def add_executor_route():
    return executor_service.add_executor(request)

@executor_bp.route('/executors/<int:project_id>', methods=['GET'])
def get_executors_route(project_id):
    return executor_service.get_executors_by_project_id(project_id)

@executor_bp.route('/executor/<int:executor_id>', methods=['GET'])
def get_executor_by_id_route(executor_id):
    return executor_service.get_executor_by_executor_id(executor_id)

@executor_bp.route('/delete_executor', methods=['POST'])
def delete_executor_route():
    return executor_service.delete_executor(request)

@executor_bp.route('/update_executor', methods=['POST'])
def update_executor_route():
    return executor_service.update_executor(request)

@executor_bp.route('/update_executor_issues', methods=['POST'])
def update_executor_issues_route():
    return executor_service.update_executor_issues(request)

@executor_bp.route('/update_executors_data', methods=['POST'])
def update_executors_data_route():
    return executor_service.update_executors_data(request)

@executor_bp.route('/record_expected_update', methods=['POST'])
def record_expected_update_route():
    return executor_service.record_expected_update(request)

@executor_bp.route('/reset_expected_update', methods=['POST'])
def reset_expected_update_route():
    return executor_service.reset_expected_update(request)
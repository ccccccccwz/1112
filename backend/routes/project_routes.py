from flask import Blueprint, request, jsonify
from backend.services import project_service

project_bp = Blueprint('project', __name__)

@project_bp.route('/projects', methods=['GET'])
def projects():
    return jsonify(project_service.get_all_projects())

@project_bp.route('/add_project', methods=['POST'])
def add_project():
    return project_service.insert_project(request.json)

@project_bp.route('/delete_project', methods=['POST'])
def delete_project_route():
    return project_service.delete_project(request)

@project_bp.route('/search_projects', methods=['GET'])
def search_projects_route():
    return project_service.search_projects(request)

@project_bp.route('/increase_head_counts', methods=['POST'])
def increase_head_counts_route():
    return project_service.increase_head_counts(request)

@project_bp.route('/decrease_head_counts', methods=['POST'])
def decrease_head_counts_route():
    return project_service.decrease_head_counts(request)

@project_bp.route('/update_test_group', methods=['POST'])
def update_test_group_route():
    return project_service.update_test_group(request)

@project_bp.route('/update_project_level', methods=['POST'])
def update_project_level_route():
    return project_service.update_project_level(request)

@project_bp.route('/update_project_status', methods=['POST'])
def update_project_status_route():
    return project_service.update_project_status(request)

@project_bp.route('/update_project_start_date', methods=['POST'])
def update_project_start_date_route():
    return project_service.update_project_start_date(request)

@project_bp.route('/update_project', methods=['POST'])
def update_project_route():
    return project_service.update_project(request)

@project_bp.route('/refresh_all_projects', methods=['POST'])
def refresh_all_projects_route():
    return project_service.refresh_all_projects()


@project_bp.route('/refresh_project', methods=['POST'])
def refresh_project_route():
    return project_service.refresh_project(request)


@project_bp.route('/update_head_counts', methods=['POST'])
def update_head_counts():
    return project_service.update_head_counts(request)


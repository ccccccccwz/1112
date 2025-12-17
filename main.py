from flask import Flask
from backend.db.connection import init_all_tables
from backend.routes.project_routes import project_bp
from backend.routes.executor_routes import executor_bp
from backend.routes.statistics_routes import statistics_bp

def create_app():
    app = Flask(__name__)

    # 注册蓝图
    app.register_blueprint(project_bp)
    app.register_blueprint(executor_bp)
    app.register_blueprint(statistics_bp)

    return app

if __name__ == '__main__':
    init_all_tables()  # 初始化所有数据表
    app = create_app()
    app.run(host='0.0.0.0', debug=True, port=65001)
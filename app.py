import os
from flask import Flask
from flask_cors import CORS
from backend.db.connection import init_all_tables
from backend.routes.project_routes import project_bp
from backend.routes.executor_routes import executor_bp
from backend.routes.statistics_routes import statistics_bp

def create_app():
    app = Flask(__name__)

    # 注册蓝图 + 统一 API 前缀
    app.register_blueprint(project_bp, url_prefix='/api/projects')
    app.register_blueprint(executor_bp, url_prefix='/api/executors')
    app.register_blueprint(statistics_bp, url_prefix='/api/statistics')

    return app

if __name__ == '__main__':
    # 初始化所有数据表
    init_all_tables()

    app = create_app()

    # 开启 CORS 跨域支持，允许本地前端访问
    CORS(app, origins=["http://localhost:3000"], supports_credentials=True)
    # 从环境变量读配置，提供默认值
    host = os.environ.get('FLASK_HOST', '0.0.0.0')
    port = int(os.environ.get('FLASK_PORT', 65001))
    debug = os.environ.get('FLASK_DEBUG', 'True').lower() in ('true', '1', 't')

    app.run(host=host, port=port, debug=debug)
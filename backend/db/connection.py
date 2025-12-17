import pyodbc

# =========================
# 数据库配置
# =========================
DB_CONFIG = {
    'server': '127.0.0.1',
    'database': 'TC_Project_Performance_Test',
    'username': 'sa',
    'password': 'Password@_',
    'driver': '{ODBC Driver 17 for SQL Server}',
}

# =========================
# 数据库连接
# =========================
def create_connection():
    """创建数据库连接"""
    try:
        conn = pyodbc.connect(
            f"DRIVER={DB_CONFIG['driver']};"
            f"SERVER={DB_CONFIG['server']};"
            f"DATABASE={DB_CONFIG['database']};"
            f"UID={DB_CONFIG['username']};"
            f"PWD={DB_CONFIG['password']};"
            "Encrypt=no;TrustServerCertificate=yes"
        )
        return conn
    except Exception as e:
        print("Failed to connect to database:", e)
        return None

# =========================
# 建表函数
# =========================
def create_projects_table():
    """创建 Projects 表"""
    conn = create_connection()
    if conn:
        try:
            cursor = conn.cursor()
            create_table_sql = """
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Projects' AND xtype='U')
            CREATE TABLE Projects (
                ID INT IDENTITY(1,1) PRIMARY KEY,
                TestGroup NVARCHAR(50),
                ProjectName NVARCHAR(100),
                ConversionFactor FLOAT,
                ProjectLevel NVARCHAR(50),
                HeadCounts INT,
                ExpectedIssues INT,
                ExpectedDI FLOAT,
                AverageIssues INT NULL,
                AverageDI FLOAT NULL,
                StartDate DATE,
                Status NVARCHAR(20) DEFAULT '进行中',
                TaskID NVARCHAR(100) NULL,
                TestRound NVARCHAR(50) NULL
            )
            """
            cursor.execute(create_table_sql)
            conn.commit()
            print("✅ Projects table ready.")
        except Exception as e:
            print("Error creating Projects table:", e)
        finally:
            cursor.close()
            conn.close()
    else:
        print("❌ Connection failed when creating Projects table.")

def create_executors_table():
    """创建 Executors 表"""
    conn = create_connection()
    if conn:
        try:
            cursor = conn.cursor()
            create_table_sql = """
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Executors' AND xtype='U')
            BEGIN
                CREATE TABLE Executors (
                    ID INT IDENTITY(1,1) PRIMARY KEY,
                    ExecutorName NVARCHAR(100),
                    ExpectedIssues INT,
                    ExpectedDI FLOAT,
                    ActualIssues INT,
                    ActualDI FLOAT,
                    Level1Issues INT,
                    Level2Issues INT,
                    Level3Issues INT,
                    Level4Issues INT,
                    IsIssuesOnTarget BIT,
                    IsDIOnTarget BIT,
                    IsTargetIssuesOnTarget BIT,
                    IsTargetDIOnTarget BIT,
                    ProjectID INT,
                    Days INT NULL,
                    IsExpectedUpdated BIT DEFAULT 0,
                    FOREIGN KEY (ProjectID) REFERENCES Projects(ID)
                )
            END
            """
            cursor.execute(create_table_sql)
            conn.commit()
            print("✅ Executors table ready.")
        except Exception as e:
            print("Error creating Executors table:", e)
        finally:
            cursor.close()
            conn.close()
    else:
        print("❌ Connection failed when creating Executors table.")

def create_system_settings_table():
    """创建 system_settings 表"""
    conn = create_connection()
    if conn:
        try:
            cursor = conn.cursor()
            create_table_sql = """
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='system_settings' AND xtype='U')
            CREATE TABLE system_settings (
                id INT IDENTITY(1,1) PRIMARY KEY,
                auto_update_last_run_time DATETIME
            )
            """
            cursor.execute(create_table_sql)
            conn.commit()
            print("✅ system_settings table ready.")
        except Exception as e:
            print("Error creating system_settings table:", e)
        finally:
            cursor.close()
            conn.close()
    else:
        print("❌ Connection failed when creating system_settings table.")

# =========================
# 初始化所有数据表
# =========================
def init_all_tables():
    create_projects_table()
    create_executors_table()
    create_system_settings_table()


def fetch_all(sql, params=None):
    """执行查询SQL，返回所有结果 -> list[dict]"""
    conn = create_connection()
    if not conn:
        return []
    try:
        cursor = conn.cursor()
        cursor.execute(sql, params or [])
        rows = cursor.fetchall()
        columns = [col[0] for col in cursor.description]
        return [dict(zip(columns, row)) for row in rows]
    finally:
        cursor.close()
        conn.close()


def fetch_one(sql, params=None):
    """执行查询SQL，返回单条结果 -> dict 或 None"""
    conn = create_connection()
    if not conn:
        return None
    try:
        cursor = conn.cursor()
        cursor.execute(sql, params or [])
        row = cursor.fetchone()
        if not row:
            return None
        columns = [col[0] for col in cursor.description]
        return dict(zip(columns, row))
    finally:
        cursor.close()
        conn.close()


def execute(sql, params=None):
    """执行 INSERT / UPDATE / DELETE，返回受影响行数"""
    conn = create_connection()
    if not conn:
        return 0
    try:
        cursor = conn.cursor()
        cursor.execute(sql, params or [])
        conn.commit()
        return cursor.rowcount
    finally:
        cursor.close()
        conn.close()



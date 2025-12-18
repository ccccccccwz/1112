# CLAUDE.md - AI助手项目文档

## 项目概述

这是一个**绩效管理系统**，用于跟踪测试项目执行和团队成员的绩效指标。系统功能包括：
- 管理测试项目和执行人员
- 跟踪缺陷指标（DI）和问题数量
- 通过图表可视化绩效统计数据
- 从 iTest API（H3C内部测试平台）导入数据
- 计算和监控绩效基准

**主要语言**: 中文
**技术栈**: Python Flask（后端）+ React（前端）
**数据库**: Microsoft SQL Server

---

## ⚡ AI助手工作守则（重要）

### 核心原则
**专注、高效、精准** - 完成用户要求的任务，不做额外的事情。

### 1. Token优化规则

#### 📖 文件读取
- **只读一次**: 同一文件在对话中只读取一次，后续引用使用记忆
- **精确读取**: 如果知道具体文件路径，直接使用Read工具，不要先搜索
- **按需读取**: 只读取完成任务必需的文件，不要"以防万一"而读取
- **避免重复**: 不要重复读取已经在对话中出现过的文件内容

#### 🔍 代码搜索
- **明确目标**: 知道要找什么再搜索，不要探索性搜索
- **用对工具**:
  - 找特定函数/类：直接Grep
  - 找文件：直接Glob
  - 不确定的情况才用Task工具
- **搜索后停止**: 找到目标后立即停止，不要继续探索相关代码

#### 💬 响应长度
- **简洁回复**: 完成任务后简短确认即可，不要长篇解释
- **省略明显**: 不要复述用户已知的信息
- **代码优先**: 需要展示代码时，只展示关键部分，不要全文引用

### 2. 任务执行规则

#### ✅ 做什么
- **只做要求的**: 严格按照用户需求执行，不擅自扩展
- **最小改动**: 用最少的代码改动完成任务
- **直接修改**: 能改现有文件就不创建新文件
- **保持风格**: 遵循项目现有代码风格，不要重构

#### ❌ 不做什么
- **不写测试**: 除非用户明确要求，否则不编写测试代码
- **不加注释**: 不要给未修改的代码添加注释或文档字符串
- **不做验证**: 不要运行测试、不要执行代码验证（除非要求）
- **不做优化**: 不要"顺便"优化性能、重构代码、改进架构
- **不加错误处理**: 不要添加用户未要求的try-catch、验证逻辑
- **不做向后兼容**: 不需要保留旧代码、添加deprecated标记等
- **不创建文档**: 不要创建README、文档文件（除非明确要求）
- **不添加功能**: 不要添加"可能有用"的额外功能

### 3. 具体场景指南

#### 🐛 修复Bug
1. 定位问题代码（最多读2-3个文件）
2. 做最小修改修复
3. 说明修复了什么，完成

**不要做**:
- 检查相关代码是否有类似bug
- 添加额外的错误处理
- 重构周围的代码

#### ➕ 添加功能
1. 确认需要修改的文件（查看现有类似功能）
2. 参照现有模式添加代码
3. 确认完成

**不要做**:
- 考虑"如果将来需要XX怎么办"
- 添加配置项以增加灵活性
- 创建抽象层或工具函数
- 添加日志、监控、统计

#### 🔧 修改现有功能
1. 找到相关代码
2. 直接修改
3. 确认完成

**不要做**:
- 考虑影响范围
- 修改调用方
- 更新相关功能使其"一致"

#### 📝 代码审查请求
- 如果用户只是问"看看这个"，简短回答即可
- 不要主动指出所有潜在问题
- 不要建议大规模重构

### 4. Git操作规则

#### Commit
- **简洁消息**: 一句话说明改了什么
- **不要详述**: 不需要列出所有文件变更
- **立即推送**: commit后直接push，不要检查status

#### 示例
```bash
# ✅ 好的做法
git add . && git commit -m "添加用户登录功能" && git push

# ❌ 避免的做法
git add file1.py file2.py file3.py
git commit -m "feat: 添加用户登录功能

- 添加login API端点
- 添加用户认证逻辑
- 更新数据库模型
- 添加前端登录表单
- 添加表单验证
..."
git status  # 不需要
git log -1  # 不需要
git push
```

### 5. 对话效率

#### 🎯 理解需求
- **直接开始**: 理解需求后立即执行，不要问"我应该XX吗？"
- **合理假设**: 根据项目惯例做合理假设，不要每个细节都确认
- **只在真不确定时才问**: 如果有两种完全不同的实现方式，才需要询问

#### 💭 思考过程
- **内部思考**: 复杂逻辑在思考块中处理，不要输出给用户
- **不解释**: 完成任务即可，不要解释"为什么这样做"
- **不教育**: 不要解释技术概念、最佳实践等

### 6. 项目特定规则

#### 本项目约定
- **数据库操作**: 使用`fetch_all/fetch_one/execute`，不要引入ORM
- **中文注释**: 项目使用中文注释，保持一致即可
- **print调试**: 项目使用print而非logging，保持一致
- **无测试**: 项目没有测试，不要添加
- **硬编码配置**: 配置直接写在代码中，不需要改成环境变量（除非要求）

### 7. 效率检查清单

在开始任务前问自己：
- [ ] 我是否只读取必需的文件？
- [ ] 我是否要做任何用户未要求的事？
- [ ] 我的改动是否是最小化的？
- [ ] 我是否要写测试/文档/注释？（如果是，停止）
- [ ] 我是否在"改进"代码？（如果是，停止）

### 8. 响应模板

#### 简单任务完成
```
已完成。在 `文件路径` 添加了XX功能。
```

#### 复杂任务完成
```
已完成以下修改：
1. `文件1` - 添加XX
2. `文件2` - 修改YY

已提交并推送到 `分支名`。
```

#### 需要确认
```
需要确认：是在 `文件A` 还是 `文件B` 中实现？
```

---

## 架构与技术栈

### 后端
- **框架**: Flask
- **数据库**: SQL Server（通过 pyodbc + ODBC Driver 17）
- **API架构**: 基于 Blueprint 的 RESTful 路由
- **外部API集成**: iTest API（H3C测试平台）

### 前端
- **框架**: React 19.2.0
- **UI库**: Ant Design (antd 6.1.0)、Bootstrap 5.3.8
- **图表**: Ant Design Charts、Plotly.js
- **状态管理**: React hooks（useState、useEffect）
- **HTTP客户端**: Axios
- **开发服务器**: react-scripts（Create React App）

### 核心依赖
**后端**:
- `pyodbc` - SQL Server 连接
- `flask-cors` - 跨域请求处理
- `pandas` - 数据处理（Excel文件）
- `requests` - 外部API调用
- `urllib3` - HTTP工具

**前端**:
- `axios` - HTTP请求
- `antd` - UI组件
- `@ant-design/charts` - 图表库
- `plotly.js-dist` - 额外图表
- `bootstrap` - 样式框架

---

## 目录结构

```
/home/user/1112/
├── app.py                      # Flask应用主入口（带CORS配置）
├── main.py                     # 备用入口（无CORS配置）
├── get_from_itest.py          # iTest API集成模块
├── expected_di.xlsx           # 员工基线数据（DI指标）
│
├── backend/
│   ├── __init__.py
│   ├── db/
│   │   ├── connection.py      # 数据库连接和表初始化
│   │   └── __init__.py
│   ├── routes/                # API路由蓝图
│   │   ├── project_routes.py  # 项目CRUD端点
│   │   ├── executor_routes.py # 执行人管理端点
│   │   └── statistics_routes.py # 统计和图表数据端点
│   ├── services/              # 业务逻辑层
│   │   ├── project_service.py
│   │   ├── executor_service.py
│   │   └── statistics_service.py
│   └── utils/
│       └── common_utils.py    # 工具函数（日期、DI计算）
│
├── front/                     # React前端应用
│   ├── public/
│   ├── src/
│   │   ├── App.js            # 主应用组件和布局
│   │   ├── index.js          # React入口点
│   │   ├── components/
│   │   │   ├── ChartPanel.jsx      # 绩效图表
│   │   │   ├── DateFilter.jsx      # 日期范围选择器
│   │   │   ├── HelpModal.jsx       # 帮助文档弹窗
│   │   │   ├── Top5List.jsx        # 排名前5的执行人列表
│   │   │   └── TaskPanel/          # 项目/执行人管理
│   │   │       ├── TaskPanel.jsx
│   │   │       ├── ProjectTable.jsx
│   │   │       ├── ExecutorTable.jsx
│   │   │       ├── AddProjectModal.jsx
│   │   │       ├── AddExecutorModal.jsx
│   │   │       └── SearchBar.jsx
│   │   └── styles/
│   │       └── app.css
│   ├── package.json          # npm依赖
│   └── README.md
│
├── static/                   # 遗留静态资源（jQuery、Plotly）
├── templates/                # 遗留Flask模板（HTML）
└── .git/                     # Git仓库
```

---

## 数据库架构

### 数据表

#### 1. Projects（项目表）
存储测试项目信息。

```sql
CREATE TABLE Projects (
    ID INT IDENTITY(1,1) PRIMARY KEY,
    TestGroup NVARCHAR(50),           -- 测试组/团队名称
    ProjectName NVARCHAR(100),        -- 项目名称
    ConversionFactor FLOAT,           -- DI计算系数
    ProjectLevel NVARCHAR(50),        -- 项目复杂度等级
    HeadCounts INT,                   -- 团队人数
    ExpectedIssues INT,               -- 预期问题总数
    ExpectedDI FLOAT,                 -- 预期DI总值
    AverageIssues INT NULL,           -- 人均问题数
    AverageDI FLOAT NULL,             -- 人均DI
    StartDate DATE,                   -- 项目开始日期
    Status NVARCHAR(20) DEFAULT '进行中', -- 状态：进行中/已完成
    TaskID NVARCHAR(100) NULL,        -- iTest任务ID（如果是导入的）
    TestRound NVARCHAR(50) NULL       -- 测试轮次
)
```

#### 2. Executors（执行人表）
存储个人执行人员的绩效数据。

```sql
CREATE TABLE Executors (
    ID INT IDENTITY(1,1) PRIMARY KEY,
    ExecutorName NVARCHAR(100),       -- 执行人姓名
    ExpectedIssues INT,               -- 预期问题数
    ExpectedDI FLOAT,                 -- 预期DI值
    ActualIssues INT,                 -- 实际发现问题数
    ActualDI FLOAT,                   -- 实际达到的DI
    Level1Issues INT,                 -- 严重问题（一级）
    Level2Issues INT,                 -- 高严重性问题（二级）
    Level3Issues INT,                 -- 中等严重性问题（三级）
    Level4Issues INT,                 -- 低严重性问题（四级）
    IsIssuesOnTarget BIT,             -- 遗留标志
    IsDIOnTarget BIT,                 -- 遗留标志
    IsTargetIssuesOnTarget BIT,       -- 问题数是否达标？
    IsTargetDIOnTarget BIT,           -- DI是否达标？
    ProjectID INT,                    -- 外键关联到Projects
    Days INT NULL,                    -- 执行天数
    IsExpectedUpdated BIT DEFAULT 0,  -- 手动更新期望值标志
    FOREIGN KEY (ProjectID) REFERENCES Projects(ID)
)
```

#### 3. system_settings（系统设置表）
系统配置表。

```sql
CREATE TABLE system_settings (
    id INT IDENTITY(1,1) PRIMARY KEY,
    auto_update_last_run_time DATETIME  -- 最后自动更新时间戳
)
```

### 数据库连接
- **服务器**: 127.0.0.1（本地）
- **数据库**: TC_Project_Performance_Test
- **凭据**: 存储在 `backend/db/connection.py`
- **驱动**: ODBC Driver 17 for SQL Server

---

## API端点

### 基础URL
- **后端**: `http://localhost:65001/api`
- **前端开发服务器**: `http://localhost:3000`

### 项目API（`/api/projects`）

| 方法 | 端点 | 说明 |
|--------|----------|-------------|
| GET | `/projects` | 获取所有项目 |
| POST | `/add_project` | 添加新项目（手动或iTest导入）|
| POST | `/delete_project` | 删除项目及其执行人 |
| GET | `/search_projects` | 按筛选条件搜索项目 |
| POST | `/increase_head_counts` | 增加项目人数 |
| POST | `/decrease_head_counts` | 减少项目人数 |
| POST | `/update_test_group` | 更新项目测试组 |
| POST | `/update_project_level` | 更新项目等级 |
| POST | `/update_project_status` | 更新项目状态 |
| POST | `/update_project_start_date` | 更新开始日期 |
| POST | `/update_project` | 通用项目字段更新 |
| POST | `/refresh_all_projects` | 刷新所有iTest导入的项目 |
| POST | `/update_head_counts` | 直接设置项目人数 |

### 执行人API（`/api/executors`）

| 方法 | 端点 | 说明 |
|--------|----------|-------------|
| POST | `/add_executor` | 添加执行人到项目 |
| GET | `/executors/<project_id>` | 根据项目ID获取执行人 |
| GET | `/executor/<executor_id>` | 根据执行人ID获取单个执行人 |
| POST | `/delete_executor` | 删除执行人 |
| POST | `/update_executor` | 更新执行人详情 |
| POST | `/update_executor_issues` | 更新执行人问题数 |
| POST | `/update_executors_data` | 批量更新执行人数据 |
| POST | `/record_expected_update` | 标记期望值为手动更新 |
| POST | `/reset_expected_update` | 重置手动更新标志 |

### 统计API（`/api/statistics`）

| 方法 | 端点 | 说明 |
|--------|----------|-------------|
| GET | `/` | 获取DI统计数据（带日期过滤）|
| GET | `/task` | 获取任务相关统计 |
| POST | `/cal_target_di` | 计算目标DI值 |
| GET | `/statistical_di` | 获取统计DI摘要 |

---

## 核心组件与模块

### 后端服务

#### project_service.py
- `insert_project(data)` - 创建项目（手动或iTest导入）
- `get_all_projects()` - 返回所有项目并格式化日期
- `delete_project(request)` - 删除项目并级联删除执行人
- `search_projects(request)` - 按多个条件筛选项目
- `refresh_all_projects()` - 同步iTest导入的项目最新数据
- `update_*` 函数 - 各种字段更新操作

**重要逻辑**:
- 添加iTest项目时，自动从 `get_person_idms()` 创建执行人
- 根据 `expected_di.xlsx` 中的 `BASE_DI_LIST` 计算预期DI
- 使用不同的默认天数：ADCP任务=15天，其他=10天

#### executor_service.py
- 管理单个执行人的CRUD操作
- 处理问题等级更新（Level1-4）
- 通过 `IsExpectedUpdated` 标志跟踪手动期望值更新

#### statistics_service.py
- `get_di_data(start, end)` - 聚合图表的DI数据
- 按日期范围筛选季度报告
- 计算达标百分比

### 前端组件

#### App.js
- 使用Ant Design Layout的主布局
- 侧边导航：图表面板、任务面板、日均统计
- 日期过滤器集成，默认为季度范围
- 帮助弹窗触发

#### ChartPanel.jsx
- 使用Ant Design Charts显示绩效图表
- 从 `/api/statistics/` 获取数据并应用日期过滤
- 显示DI趋势、问题分布、排名前列的执行人

#### TaskPanel/
- **TaskPanel.jsx**: 包含搜索和表格标签的容器
- **ProjectTable.jsx**: 项目CRUD表格，支持内联编辑
- **ExecutorTable.jsx**: 按项目管理执行人
- **AddProjectModal.jsx**: 手动/iTest项目创建表单
- **AddExecutorModal.jsx**: 执行人创建表单

### 工具模块

#### common_utils.py
- `load_person_data()` - 从Excel加载允许的执行人姓名
- `load_di_data()` - 从Excel加载基线DI指标
- `get_quarter_range()` - 计算季度开始/结束日期
- `calculate_base_di()` - DI计算公式
- `calculate_final_di()` - 带权重和惩罚的最终DI
- `ALLOWED_EXECUTORS` - 有效执行人姓名的全局列表
- `BASE_DI_LIST` - (姓名, 基线DI)元组的全局列表

**DI计算公式**:
```python
base_di = (Level1 * 10 * factor + Level2 * 3 * factor +
           Level3 * factor + Level4 * 0.5 * factor)
final_di = base_di * 达标系数 * (0.9 if below_target else 1.0)
```

#### get_from_itest.py
**关键**: 包含iTest系统的硬编码API凭据。

函数:
- `get_token()` - 使用iTest API进行身份验证
- `get_project_info(task_code)` - 根据代码获取任务详情
- `get_person_idms(task_id, round)` - 获取测试轮次的执行人数据
- `get_task_factor(task_id)` - 获取DI产品系数和任务类型

**安全警告**: 包含明文凭据（账号: c23566，密码: Cwz9601231）

---

## 开发工作流

### 启动应用

#### 后端
```bash
# 方法1: 启用CORS运行（推荐用于开发）
python app.py

# 方法2: 无显式CORS配置运行
python main.py

# 服务器运行在: http://0.0.0.0:65001
# 环境变量:
#   FLASK_HOST (默认: 0.0.0.0)
#   FLASK_PORT (默认: 65001)
#   FLASK_DEBUG (默认: True)
```

#### 前端
```bash
cd front
npm install           # 仅首次需要
npm start             # 运行在 http://localhost:3000

# 其他命令:
npm run build         # 生产构建
npm test              # 运行测试
```

### 数据库初始化
首次运行时，表会通过 `app.py:21` 和 `main.py:18` 中的 `init_all_tables()` 自动创建。

### 添加新的API端点

1. **创建服务函数** 在 `backend/services/*_service.py`
2. **添加路由** 在对应的 `backend/routes/*_routes.py`
3. **注册蓝图** 在 `app.py`（如果是新蓝图）
4. **前端集成**: 在React组件中添加axios调用

示例:
```python
# backend/services/project_service.py
def my_new_function(request):
    data = request.get_json()
    # 业务逻辑
    return jsonify({"result": "success"}), 200

# backend/routes/project_routes.py
@project_bp.route('/my_endpoint', methods=['POST'])
def my_endpoint_route():
    return project_service.my_new_function(request)
```

### 使用iTest集成

从iTest添加项目时:
1. 用户提供 `task_code`（例如："T202511180041"）
2. 系统调用 `get_project_info(task_code)` 获取任务详情
3. 调用 `get_person_idms(task_id, round)` 获取执行人数据
4. 调用 `get_task_factor(task_id)` 获取DI系数
5. 在一个事务中自动创建项目和所有执行人

**刷新操作**:
- 更新所有iTest导入项目的最新数据
- 保留手动更新的期望值（`IsExpectedUpdated = 1`）
- 跳过手动创建的项目（`TaskID IS NULL`）

---

## 编码规范

### 后端（Python）

1. **命名**:
   - 函数: `snake_case`
   - 类: `PascalCase`（如果有）
   - 常量: `UPPER_SNAKE_CASE`
   - 中文注释可接受且常见

2. **数据库操作**:
   - 使用 `connection.py` 中的 `fetch_all()`、`fetch_one()`、`execute()`
   - 始终参数化查询: `execute(sql, (param1, param2))`
   - 返回格式: `list[dict]` 或 `dict`

3. **API响应**:
   - 成功: `jsonify({...}), 20X`
   - 错误: `jsonify({"error": "message"}), 4XX`
   - 始终包含状态码

4. **日期格式化**:
   - 数据库: `DATE` 类型
   - JSON响应: `'YYYY-MM-DD'` 字符串
   - 使用 `.strftime('%Y-%m-%d')` 进行转换

### 前端（React）

1. **命名**:
   - 组件: `PascalCase.jsx`
   - 函数: `camelCase`
   - CSS类: `kebab-case` 或 Bootstrap类

2. **状态管理**:
   - 使用 `useState` 管理本地状态
   - 使用 `useEffect` 获取数据
   - 传递回调进行子到父通信

3. **API调用**:
   - 使用axios
   - 用try-catch处理错误
   - 显示用户反馈（Ant Design message/notification）

4. **组件结构**:
   ```jsx
   import 语句

   export default function ComponentName() {
     // 状态声明
     // Effect钩子
     // 处理函数
     // 渲染逻辑
   }
   ```

### 通用实践

- **注释**: 中英文混合可接受
- **错误处理**: 始终用try-except包装数据库操作
- **日志**: 使用 `print()` 语句（无正式日志框架）
- **测试**: 没有测试文件；假定手动测试

---

## 重要文件与配置

### 新功能必读文件

| 文件 | 用途 | 何时修改 |
|------|---------|---------------|
| `backend/db/connection.py` | 数据库配置和帮助函数 | 添加新表、更改数据库 |
| `backend/utils/common_utils.py` | 计算逻辑 | 更改DI公式、日期逻辑 |
| `get_from_itest.py` | 外部API集成 | iTest API变更 |
| `expected_di.xlsx` | 员工基线数据 | 新员工、更新基线 |
| `app.py` | Flask主应用 | 添加蓝图、CORS变更 |
| `front/src/App.js` | 主布局 | 添加导航项 |

### 配置文件

- **后端**:
  - 数据库凭据: `backend/db/connection.py:6-12`
  - CORS源: `app.py:26`
  - 服务器设置: `app.py:28-30`

- **前端**:
  - 代理: `front/package.json:45` → 指向后端
  - 依赖: `front/package.json`

---

## 常见任务

### 添加新执行人
1. 用户在TaskPanel中点击"添加执行人"
2. AddExecutorModal根据 `ALLOWED_EXECUTORS` 验证姓名
3. POST到 `/api/executors/add_executor`
4. 服务从 `BASE_DI_LIST` 计算预期DI
5. 插入到Executors表

### 刷新iTest数据
1. 用户点击"刷新全部"按钮
2. POST到 `/api/projects/refresh_all_projects`
3. 服务遍历所有 `TaskID != NULL` 的项目
4. 调用 `get_person_idms()` 获取最新数据
5. 更新或插入执行人
6. 返回每个项目状态的结果数组

### 查看统计
1. 用户在DateFilter中选择日期范围
2. ChartPanel接收 `start` 和 `end` props
3. `useEffect` 在日期变化时触发
4. GET `/api/statistics/?start=YYYY-MM-DD&end=YYYY-MM-DD`
5. 服务按范围内的 `StartDate` 筛选Projects
6. 聚合DI数据并返回图表就绪格式

---

## 安全与认证

### 当前状态
- **无认证**实现
- **无授权**检查
- 数据库凭据**硬编码**在源代码中
- iTest API凭据**硬编码**并提交到git

### 未来工作建议
1. 将凭据移至环境变量或密钥管理器
2. 实现用户认证（例如Flask-Login）
3. 添加CSRF保护
4. 生产环境使用HTTPS
5. 实现基于角色的访问控制（RBAC）
6. 添加输入验证和清理
7. 共享前从 `get_from_itest.py` 移除凭据

---

## Git与分支策略

### 当前分支
- 开发分支: `claude/claude-md-mj9u4j79pw70t4np-DqOxj`

### Git操作
- 始终在指定的Claude分支上开发
- 推送使用: `git push -u origin <branch-name>`
- 分支名必须以 `claude/` 开头并包含会话ID
- 失败的推送重试最多4次，指数退避（2s、4s、8s、16s）

### 提交指南
- 使用描述性的提交信息
- 将相关更改一起提交
- 提交前测试

---

## 遗留代码

### 静态资源与模板
- `static/` 目录包含jQuery和旧JavaScript
- `templates/` 包含备份HTML模板
- 这些**不被**当前React前端使用
- 保留用于参考或潜在未来使用

### 迁移说明
该项目似乎已从基于Flask模板的应用迁移到现代React SPA。后端API可能同时进行了重构。

---

## 故障排除

### 常见问题

**数据库连接失败**:
- 检查SQL Server是否运行
- 验证ODBC Driver 17是否已安装
- 检查 `backend/db/connection.py` 中的凭据

**CORS错误**:
- 确保使用 `app.py`（而非 `main.py`）
- 检查CORS源是否匹配前端URL
- 验证前端代理设置是否正确

**iTest API错误**:
- 检查对 `itest-api.h3c.com` 的网络访问
- 验证 `get_from_itest.py` 中的凭据
- 检查token过期

**前端构建失败**:
- 删除 `node_modules` 和 `package-lock.json`
- 重新运行 `npm install`
- 检查Node.js版本兼容性

**缺失执行人姓名**:
- 检查执行人姓名是否存在于 `expected_di.xlsx`
- 验证Excel文件是否在项目根目录
- 检查 `ALLOWED_EXECUTORS` 是否正确加载

---

## 关键设计决策

### 为什么有两个入口点（app.py vs main.py）？
- `app.py`: 类生产设置，带CORS、环境变量
- `main.py`: 更简单的设置用于快速测试
- **建议**: 统一使用 `app.py`

### 为什么在Excel中存储基线数据？
- 便于非技术用户更新
- 无需管理界面
- 在启动时通过 `common_utils.py` 加载

### 为什么有两个状态标志（IsIssuesOnTarget和IsTargetIssuesOnTarget）？
- 似乎是遗留计算方法vs新计算方法
- `IsTarget*` 标志正在使用
- 普通 `Is*` 标志始终设置为0

### 为什么以多种方式计算DI？
- `base_di`: 从问题计数的原始计算
- `final_di`: 按天数、惩罚、项目系数加权
- 允许在不同粒度级别进行灵活报告

---

## 未来增强机会

1. **用户认证**: 添加带角色管理的登录系统
2. **环境配置**: 将密钥移至 `.env` 文件
3. **测试**: 添加单元测试和集成测试
4. **日志**: 用适当的日志框架替换print语句
5. **数据验证**: 添加Pydantic模型或类似的请求验证
6. **缓存**: 为频繁访问的数据添加Redis
7. **实时更新**: WebSocket集成用于实时数据
8. **导出功能**: 添加Excel/PDF报告生成
9. **审计跟踪**: 跟踪谁在何时更改了什么
10. **API文档**: 添加Swagger/OpenAPI规范

---

## 联系与支持

有关此代码库的问题，请参考:
- iTest API文档（H3C内部）
- Flask文档: https://flask.palletsprojects.com/
- React文档: https://react.dev/
- Ant Design文档: https://ant.design/

---

## 文档版本
- **创建日期**: 2025-12-17
- **最后更新**: 2025-12-17
- **仓库状态**: 基于提交 3721294

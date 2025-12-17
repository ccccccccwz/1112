# CLAUDE.md - Project Documentation for AI Assistants

## Project Overview

This is a **Performance Management System** for tracking test project execution and team member performance metrics. The system allows users to:
- Manage test projects and executors
- Track defect indicators (DI) and issue counts
- Visualize performance statistics through charts
- Import data from iTest API (H3C internal testing platform)
- Calculate and monitor performance benchmarks

**Primary Language**: Chinese (中文)
**Tech Stack**: Python Flask (Backend) + React (Frontend)
**Database**: Microsoft SQL Server

---

## Architecture & Technology Stack

### Backend
- **Framework**: Flask
- **Database**: SQL Server (via pyodbc + ODBC Driver 17)
- **API Architecture**: RESTful with Blueprint-based routing
- **External API Integration**: iTest API (H3C testing platform)

### Frontend
- **Framework**: React 19.2.0
- **UI Libraries**: Ant Design (antd 6.1.0), Bootstrap 5.3.8
- **Charts**: Ant Design Charts, Plotly.js
- **State Management**: React hooks (useState, useEffect)
- **HTTP Client**: Axios
- **Dev Server**: react-scripts (Create React App)

### Key Dependencies
**Backend**:
- `pyodbc` - SQL Server connectivity
- `flask-cors` - Cross-origin request handling
- `pandas` - Data processing (Excel files)
- `requests` - External API calls
- `urllib3` - HTTP utilities

**Frontend**:
- `axios` - HTTP requests
- `antd` - UI components
- `@ant-design/charts` - Charting library
- `plotly.js-dist` - Additional charts
- `bootstrap` - Styling framework

---

## Directory Structure

```
/home/user/1112/
├── app.py                      # Main Flask application entry (with CORS)
├── main.py                     # Alternative entry point (no CORS config)
├── get_from_itest.py          # iTest API integration module
├── expected_di.xlsx           # Employee baseline data (DI metrics)
│
├── backend/
│   ├── __init__.py
│   ├── db/
│   │   ├── connection.py      # Database connection & table initialization
│   │   └── __init__.py
│   ├── routes/                # API route blueprints
│   │   ├── project_routes.py  # Project CRUD endpoints
│   │   ├── executor_routes.py # Executor management endpoints
│   │   └── statistics_routes.py # Statistics & chart data endpoints
│   ├── services/              # Business logic layer
│   │   ├── project_service.py
│   │   ├── executor_service.py
│   │   └── statistics_service.py
│   └── utils/
│       └── common_utils.py    # Utility functions (date, DI calculations)
│
├── front/                     # React frontend application
│   ├── public/
│   ├── src/
│   │   ├── App.js            # Main app component with layout
│   │   ├── index.js          # React entry point
│   │   ├── components/
│   │   │   ├── ChartPanel.jsx      # Performance charts
│   │   │   ├── DateFilter.jsx      # Date range selector
│   │   │   ├── HelpModal.jsx       # Help documentation modal
│   │   │   ├── Top5List.jsx        # Top performers list
│   │   │   └── TaskPanel/          # Project/executor management
│   │   │       ├── TaskPanel.jsx
│   │   │       ├── ProjectTable.jsx
│   │   │       ├── ExecutorTable.jsx
│   │   │       ├── AddProjectModal.jsx
│   │   │       ├── AddExecutorModal.jsx
│   │   │       └── SearchBar.jsx
│   │   └── styles/
│   │       └── app.css
│   ├── package.json          # npm dependencies
│   └── README.md
│
├── static/                   # Legacy static assets (jQuery, Plotly)
├── templates/                # Legacy Flask templates (HTML)
└── .git/                     # Git repository
```

---

## Database Schema

### Tables

#### 1. Projects
Stores test project information.

```sql
CREATE TABLE Projects (
    ID INT IDENTITY(1,1) PRIMARY KEY,
    TestGroup NVARCHAR(50),           -- Test team/group name
    ProjectName NVARCHAR(100),        -- Project name
    ConversionFactor FLOAT,           -- DI calculation factor
    ProjectLevel NVARCHAR(50),        -- Project complexity level
    HeadCounts INT,                   -- Number of team members
    ExpectedIssues INT,               -- Expected total issues
    ExpectedDI FLOAT,                 -- Expected total DI
    AverageIssues INT NULL,           -- Average issues per person
    AverageDI FLOAT NULL,             -- Average DI per person
    StartDate DATE,                   -- Project start date
    Status NVARCHAR(20) DEFAULT '进行中', -- Status: 进行中/已完成
    TaskID NVARCHAR(100) NULL,        -- iTest task ID (if imported)
    TestRound NVARCHAR(50) NULL       -- Test round number
)
```

#### 2. Executors
Stores individual executor performance data.

```sql
CREATE TABLE Executors (
    ID INT IDENTITY(1,1) PRIMARY KEY,
    ExecutorName NVARCHAR(100),       -- Executor name
    ExpectedIssues INT,               -- Expected issue count
    ExpectedDI FLOAT,                 -- Expected DI value
    ActualIssues INT,                 -- Actual issues found
    ActualDI FLOAT,                   -- Actual DI achieved
    Level1Issues INT,                 -- Critical issues (Level 1)
    Level2Issues INT,                 -- High severity issues
    Level3Issues INT,                 -- Medium severity issues
    Level4Issues INT,                 -- Low severity issues
    IsIssuesOnTarget BIT,             -- Legacy flag
    IsDIOnTarget BIT,                 -- Legacy flag
    IsTargetIssuesOnTarget BIT,       -- Issues target achieved?
    IsTargetDIOnTarget BIT,           -- DI target achieved?
    ProjectID INT,                    -- Foreign key to Projects
    Days INT NULL,                    -- Execution days
    IsExpectedUpdated BIT DEFAULT 0,  -- Manual expectation update flag
    FOREIGN KEY (ProjectID) REFERENCES Projects(ID)
)
```

#### 3. system_settings
System configuration table.

```sql
CREATE TABLE system_settings (
    id INT IDENTITY(1,1) PRIMARY KEY,
    auto_update_last_run_time DATETIME  -- Last auto-update timestamp
)
```

### Database Connection
- **Server**: 127.0.0.1 (localhost)
- **Database**: TC_Project_Performance_Test
- **Credentials**: Stored in `backend/db/connection.py`
- **Driver**: ODBC Driver 17 for SQL Server

---

## API Endpoints

### Base URL
- **Backend**: `http://localhost:65001/api`
- **Frontend Dev Server**: `http://localhost:3000`

### Projects API (`/api/projects`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/projects` | Get all projects |
| POST | `/add_project` | Add new project (manual or iTest import) |
| POST | `/delete_project` | Delete project and its executors |
| GET | `/search_projects` | Search projects by filters |
| POST | `/increase_head_counts` | Increment project headcount |
| POST | `/decrease_head_counts` | Decrement project headcount |
| POST | `/update_test_group` | Update project test group |
| POST | `/update_project_level` | Update project level |
| POST | `/update_project_status` | Update project status |
| POST | `/update_project_start_date` | Update start date |
| POST | `/update_project` | Generic project field update |
| POST | `/refresh_all_projects` | Refresh all iTest-imported projects |
| POST | `/update_head_counts` | Set project headcount directly |

### Executors API (`/api/executors`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/add_executor` | Add executor to project |
| GET | `/executors/<project_id>` | Get executors by project ID |
| GET | `/executor/<executor_id>` | Get single executor by ID |
| POST | `/delete_executor` | Delete executor |
| POST | `/update_executor` | Update executor details |
| POST | `/update_executor_issues` | Update executor issue counts |
| POST | `/update_executors_data` | Batch update executor data |
| POST | `/record_expected_update` | Mark expectation as manually updated |
| POST | `/reset_expected_update` | Reset manual update flag |

### Statistics API (`/api/statistics`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get DI statistics data (with date filter) |
| GET | `/task` | Get task-related statistics |
| POST | `/cal_target_di` | Calculate target DI values |
| GET | `/statistical_di` | Get statistical DI summary |

---

## Key Components & Modules

### Backend Services

#### project_service.py
- `insert_project(data)` - Creates project (manual or iTest import)
- `get_all_projects()` - Returns all projects with date formatting
- `delete_project(request)` - Deletes project and cascades to executors
- `search_projects(request)` - Filters projects by multiple criteria
- `refresh_all_projects()` - Syncs iTest-imported projects with latest data
- `update_*` functions - Various field update operations

**Important Logic**:
- When adding iTest project, automatically creates executors from `get_person_idms()`
- Calculates expected DI based on `BASE_DI_LIST` from `expected_di.xlsx`
- Uses different default days: ADCP tasks = 15 days, others = 10 days

#### executor_service.py
- Manages individual executor CRUD operations
- Handles issue level updates (Level1-4)
- Tracks manual expectation updates via `IsExpectedUpdated` flag

#### statistics_service.py
- `get_di_data(start, end)` - Aggregates DI data for charts
- Filters by date range for quarterly reports
- Calculates on-target percentages

### Frontend Components

#### App.js
- Main layout with Ant Design Layout
- Side navigation: Chart Panel, Task Panel, Daily Stats
- Date filter integration with quarter range default
- Help modal trigger

#### ChartPanel.jsx
- Displays performance charts using Ant Design Charts
- Fetches data from `/api/statistics/` with date filters
- Shows DI trends, issue distributions, top performers

#### TaskPanel/
- **TaskPanel.jsx**: Container with search and table tabs
- **ProjectTable.jsx**: Projects CRUD table with inline editing
- **ExecutorTable.jsx**: Executors management per project
- **AddProjectModal.jsx**: Form for manual/iTest project creation
- **AddExecutorModal.jsx**: Executor creation form

### Utility Modules

#### common_utils.py
- `load_person_data()` - Loads allowed executor names from Excel
- `load_di_data()` - Loads baseline DI metrics from Excel
- `get_quarter_range()` - Calculates quarter start/end dates
- `calculate_base_di()` - DI calculation formula
- `calculate_final_di()` - Final DI with weighting and penalties
- `ALLOWED_EXECUTORS` - Global list of valid executor names
- `BASE_DI_LIST` - Global list of (name, baseline_DI) tuples

**DI Calculation Formula**:
```python
base_di = (Level1 * 10 * factor + Level2 * 3 * factor +
           Level3 * factor + Level4 * 0.5 * factor)
final_di = base_di *达标系数 * (0.9 if below_target else 1.0)
```

#### get_from_itest.py
**Critical**: Contains hardcoded API credentials for iTest system.

Functions:
- `get_token()` - Authenticates with iTest API
- `get_project_info(task_code)` - Fetches task details by code
- `get_person_idms(task_id, round)` - Gets executor data for a test round
- `get_task_factor(task_id)` - Gets DI product factor and task type

**Security Warning**: Contains plaintext credentials (account: c23566, password: Cwz9601231)

---

## Development Workflows

### Starting the Application

#### Backend
```bash
# Method 1: Run with CORS enabled (recommended for development)
python app.py

# Method 2: Run without explicit CORS config
python main.py

# The server runs on: http://0.0.0.0:65001
# Environment variables:
#   FLASK_HOST (default: 0.0.0.0)
#   FLASK_PORT (default: 65001)
#   FLASK_DEBUG (default: True)
```

#### Frontend
```bash
cd front
npm install           # First time only
npm start             # Runs on http://localhost:3000

# Other commands:
npm run build         # Production build
npm test              # Run tests
```

### Database Initialization
Tables are automatically created on first run via `init_all_tables()` in `app.py:21` and `main.py:18`.

### Adding a New API Endpoint

1. **Create service function** in `backend/services/*_service.py`
2. **Add route** in corresponding `backend/routes/*_routes.py`
3. **Register blueprint** in `app.py` (if new blueprint)
4. **Frontend integration**: Add axios call in React component

Example:
```python
# backend/services/project_service.py
def my_new_function(request):
    data = request.get_json()
    # business logic
    return jsonify({"result": "success"}), 200

# backend/routes/project_routes.py
@project_bp.route('/my_endpoint', methods=['POST'])
def my_endpoint_route():
    return project_service.my_new_function(request)
```

### Working with iTest Integration

When adding projects from iTest:
1. User provides `task_code` (e.g., "T202511180041")
2. System calls `get_project_info(task_code)` to get task details
3. Calls `get_person_idms(task_id, round)` to fetch executor data
4. Calls `get_task_factor(task_id)` to get DI factor
5. Automatically creates project and all executors in one transaction

**Refresh Operation**:
- Updates all iTest-imported projects with latest data
- Preserves manually-updated expectations (`IsExpectedUpdated = 1`)
- Skips manually-created projects (`TaskID IS NULL`)

---

## Coding Conventions

### Backend (Python)

1. **Naming**:
   - Functions: `snake_case`
   - Classes: `PascalCase` (if any)
   - Constants: `UPPER_SNAKE_CASE`
   - Chinese comments are acceptable and common

2. **Database Operations**:
   - Use `fetch_all()`, `fetch_one()`, `execute()` from `connection.py`
   - Always parameterize queries: `execute(sql, (param1, param2))`
   - Return format: `list[dict]` or `dict`

3. **API Responses**:
   - Success: `jsonify({...}), 20X`
   - Error: `jsonify({"error": "message"}), 4XX`
   - Always include status codes

4. **Date Formatting**:
   - Database: `DATE` type
   - JSON response: `'YYYY-MM-DD'` string
   - Use `.strftime('%Y-%m-%d')` for conversion

### Frontend (React)

1. **Naming**:
   - Components: `PascalCase.jsx`
   - Functions: `camelCase`
   - CSS classes: `kebab-case` or Bootstrap classes

2. **State Management**:
   - Use `useState` for local state
   - Use `useEffect` for data fetching
   - Pass callbacks for child-to-parent communication

3. **API Calls**:
   - Use axios
   - Handle errors with try-catch
   - Show user feedback (Ant Design message/notification)

4. **Component Structure**:
   ```jsx
   import statements

   export default function ComponentName() {
     // State declarations
     // Effect hooks
     // Handler functions
     // Render logic
   }
   ```

### General Practices

- **Comments**: Mix of Chinese and English is acceptable
- **Error Handling**: Always wrap database operations in try-except
- **Logging**: Use `print()` statements (no formal logging framework)
- **Testing**: No test files present; manual testing assumed

---

## Important Files & Configuration

### Must-Read Files for New Features

| File | Purpose | When to Modify |
|------|---------|---------------|
| `backend/db/connection.py` | Database config & helpers | Adding new tables, changing DB |
| `backend/utils/common_utils.py` | Calculation logic | Changing DI formulas, date logic |
| `get_from_itest.py` | External API integration | iTest API changes |
| `expected_di.xlsx` | Employee baseline data | New employees, updated baselines |
| `app.py` | Main Flask app | Adding blueprints, CORS changes |
| `front/src/App.js` | Main layout | Adding navigation items |

### Configuration Files

- **Backend**:
  - Database credentials: `backend/db/connection.py:6-12`
  - CORS origins: `app.py:26`
  - Server settings: `app.py:28-30`

- **Frontend**:
  - Proxy: `front/package.json:45` → points to backend
  - Dependencies: `front/package.json`

---

## Common Tasks

### Adding a New Executor
1. User clicks "Add Executor" in TaskPanel
2. AddExecutorModal validates name against `ALLOWED_EXECUTORS`
3. POST to `/api/executors/add_executor`
4. Service calculates expected DI from `BASE_DI_LIST`
5. Inserts into Executors table

### Refreshing iTest Data
1. User clicks "Refresh All" button
2. POST to `/api/projects/refresh_all_projects`
3. Service iterates all projects with `TaskID != NULL`
4. Calls `get_person_idms()` for latest data
5. Updates or inserts executors
6. Returns results array with status per project

### Viewing Statistics
1. User selects date range in DateFilter
2. ChartPanel receives `start` and `end` props
3. `useEffect` triggers on date change
4. GET `/api/statistics/?start=YYYY-MM-DD&end=YYYY-MM-DD`
5. Service filters Projects by `StartDate` in range
6. Aggregates DI data and returns chart-ready format

---

## Security & Authentication

### Current State
- **No authentication** implemented
- **No authorization** checks
- Database credentials **hardcoded** in source
- iTest API credentials **hardcoded** and committed to git

### Recommendations for Future Work
1. Move credentials to environment variables or secrets manager
2. Implement user authentication (e.g., Flask-Login)
3. Add CSRF protection
4. Use HTTPS in production
5. Implement role-based access control (RBAC)
6. Add input validation and sanitization
7. Remove credentials from `get_from_itest.py` before sharing

---

## Git & Branching Strategy

### Current Branch
- Development branch: `claude/claude-md-mj9u4j79pw70t4np-DqOxj`

### Git Operations
- Always develop on the designated Claude branch
- Push with: `git push -u origin <branch-name>`
- Branch names must start with `claude/` and include session ID
- Retry failed pushes up to 4 times with exponential backoff (2s, 4s, 8s, 16s)

### Commit Guidelines
- Use descriptive commit messages
- Commit related changes together
- Test before committing

---

## Legacy Code

### Static Assets & Templates
- `static/` directory contains jQuery and older JavaScript
- `templates/` contains backup HTML templates
- These are **not used** by the current React frontend
- Kept for reference or potential future use

### Migration Notes
The project appears to have been migrated from a Flask template-based application to a modern React SPA. The backend API was likely refactored at the same time.

---

## Troubleshooting

### Common Issues

**Database Connection Fails**:
- Check SQL Server is running
- Verify ODBC Driver 17 is installed
- Check credentials in `backend/db/connection.py`

**CORS Errors**:
- Ensure `app.py` is used (not `main.py`)
- Check CORS origin matches frontend URL
- Verify frontend proxy is set correctly

**iTest API Errors**:
- Check network access to `itest-api.h3c.com`
- Verify credentials in `get_from_itest.py`
- Check token expiration

**Frontend Build Fails**:
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again
- Check Node.js version compatibility

**Missing Executor Names**:
- Check executor name exists in `expected_di.xlsx`
- Verify Excel file is in project root
- Check `ALLOWED_EXECUTORS` is loaded correctly

---

## Key Design Decisions

### Why Two Entry Points (app.py vs main.py)?
- `app.py`: Production-like setup with CORS, environment variables
- `main.py`: Simpler setup for quick testing
- **Recommendation**: Standardize on `app.py`

### Why Store Baseline Data in Excel?
- Easy for non-technical users to update
- No need for admin interface
- Loaded at startup via `common_utils.py`

### Why Two Status Flags (IsIssuesOnTarget and IsTargetIssuesOnTarget)?
- Appears to be legacy vs. new calculation method
- `IsTarget*` flags are actively used
- Plain `Is*` flags are always set to 0

### Why Calculate DI Multiple Ways?
- `base_di`: Raw calculation from issue counts
- `final_di`: Weighted by days, penalties, project factors
- Allows flexible reporting at different granularities

---

## Future Enhancement Opportunities

1. **User Authentication**: Add login system with role management
2. **Environment Configuration**: Move secrets to `.env` files
3. **Testing**: Add unit tests and integration tests
4. **Logging**: Replace print statements with proper logging framework
5. **Data Validation**: Add Pydantic models or similar for request validation
6. **Caching**: Add Redis for frequently accessed data
7. **Real-time Updates**: WebSocket integration for live data
8. **Export Features**: Add Excel/PDF report generation
9. **Audit Trail**: Track who changed what and when
10. **API Documentation**: Add Swagger/OpenAPI specification

---

## Contact & Support

For questions about this codebase, refer to:
- iTest API documentation (H3C internal)
- Flask documentation: https://flask.palletsprojects.com/
- React documentation: https://react.dev/
- Ant Design documentation: https://ant.design/

---

## Document Version
- **Created**: 2025-12-17
- **Last Updated**: 2025-12-17
- **Repository State**: Based on commit 3721294

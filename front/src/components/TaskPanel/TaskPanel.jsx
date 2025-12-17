// src/components/TaskPanel/TaskPanel.jsx
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import SearchBar from "./SearchBar";
import ProjectTable from "./ProjectTable";
import AddProjectModal from "./AddProjectModal";
import AddExecutorModal from "./AddExecutorModal";

const API_BASE = "http://localhost:65001/api";

export default function TaskPanel() {
  const [projects, setProjects] = useState([]);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showExecutorModal, setShowExecutorModal] = useState(false);
  const [currentProjectId, setCurrentProjectId] = useState(null);

  // 查询条件
  const [filters, setFilters] = useState({
    testGroup: undefined,
    projectLevel: undefined,
    status: undefined,
    projectName: ""
  });

  /* ========== 拉取项目列表 ========== */

  const fetchProjects = useCallback(async (params) => {
    try {
      const res = await axios.get(`${API_BASE}/projects/projects`, {
        // params, // 如果后端支持过滤，可开启
      });

      const data = res.data.map((p) => ({
        ...p,
        id: p.ID ?? p.id,
        executors: []
      }));

      const f = params || {};
      const filtered = data.filter((p) => {
        if (f.testGroup && p.TestGroup !== f.testGroup) return false;
        if (f.projectLevel && p.ProjectLevel !== f.projectLevel) return false;
        if (f.status && p.Status !== f.status) return false;
        if (
          f.projectName &&
          !String(p.ProjectName || "")
            .toLowerCase()
            .includes(f.projectName.toLowerCase())
        ) {
          return false;
        }
        return true;
      });

      setProjects(filtered);
    } catch (err) {
      console.error("获取项目列表失败:", err);
    }
  }, []);

  // 初始化时拉一次
  useEffect(() => {
    fetchProjects(filters);
  }, [fetchProjects]);

  /* ========== 执行人懒加载 ========== */

  const loadExecutorsForProject = useCallback(async (projectId) => {
    try {
      const res = await axios.get(
        `${API_BASE}/executors/executors/${projectId}`
      );
      const executors = res.data || [];
      setProjects((prevProjects) =>
        prevProjects.map((p) =>
          p.id === projectId ? { ...p, executors } : p
        )
      );
    } catch (err) {
      console.error(`加载项目 ${projectId} 的执行人失败:`, err);
    }
  }, []);

  /* ========== 新建项目 / 执行人 ========== */

  const handleAddProjectSubmit = useCallback((values) => {
    setProjects((prev) => [
      ...prev,
      {
        id: Date.now(),
        executors: [],
        Status: "进行中",
        ...values
      }
    ]);
    setShowProjectModal(false);
  }, []);

  const handleAddExecutorClick = useCallback((project) => {
    setCurrentProjectId(project.id);
    setShowExecutorModal(true);
  }, []);

  const handleAddExecutorSubmit = useCallback((executor) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === currentProjectId
          ? { ...p, executors: [...(p.executors || []), executor] }
          : p
      )
    );
    setShowExecutorModal(false);
  }, [currentProjectId]);

  /* ========== 删除项目 / 执行人 ========== */

  const handleDeleteProject = useCallback((id) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const handleDeleteExecutor = useCallback((projectId, executorId) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? {
              ...p,
              executors: (p.executors || []).filter(
                (e) => e.ID !== executorId
              )
            }
          : p
      )
    );
  }, []);

  /* ========== 更新项目字段 ========== */

  const updateProjectField = useCallback((id, patch) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              ...patch
            }
          : p
      )
    );
  }, []);

  const handleTestGroupChange = useCallback(
    (id, value) => updateProjectField(id, { TestGroup: value }),
    [updateProjectField]
  );
  const handleProjectLevelChange = useCallback(
    (id, value) => updateProjectField(id, { ProjectLevel: value }),
    [updateProjectField]
  );
  const handleStatusChange = useCallback(
    (id, value) => updateProjectField(id, { Status: value }),
    [updateProjectField]
  );
  const handleStartDateChange = useCallback(
    (id, value) => updateProjectField(id, { StartDate: value }),
    [updateProjectField]
  );
  const handleExpectedIssuesChange = useCallback(
    (id, value) => updateProjectField(id, { ExpectedIssues: value }),
    [updateProjectField]
  );
  const handleExpectedDIChange = useCallback(
    (id, value) => updateProjectField(id, { ExpectedDI: value }),
    [updateProjectField]
  );
  const handleEditProjectName = useCallback(
    (id, value) => updateProjectField(id, { ProjectName: value }),
    [updateProjectField]
  );

  /* ========== 更新执行人字段 ========== */

  const handleUpdateExecutor = useCallback(
    (projectId, executorId, field, value) => {
      setProjects((prev) =>
        prev.map((p) =>
          p.id === projectId
            ? {
                ...p,
                executors: (p.executors || []).map((e) =>
                  e.ID === executorId ? { ...e, [field]: value } : e
                )
              }
            : p
        )
      );
    },
    []
  );

  const handleResetExpectedDI = useCallback((projectId, executorId) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? {
              ...p,
              executors: (p.executors || []).map((e) =>
                e.ID === executorId ? { ...e, ExpectedDI: null } : e
              )
            }
          : p
      )
    );
  }, []);

  /* ========== 搜索 / 重置 / 刷新 ========== */

  const handleFiltersChange = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  const handleSearch = useCallback(
    (newFilters) => {
      setFilters(newFilters);
      fetchProjects(newFilters);
    },
    [fetchProjects]
  );

  const handleReset = useCallback(
    (resetFilters) => {
      setFilters(resetFilters);
      fetchProjects(resetFilters);
    },
    [fetchProjects]
  );

  const handleRefreshAll = useCallback(() => {
    fetchProjects(filters);
  }, [fetchProjects, filters]);

  /* ========== 打开 / 关闭模态框 ==========
     这两个是“轻操作”，只改一个布尔值，
     现在配合上 useCallback 的 ProjectTable props，
     点它们时 ProjectTable 不会重渲染。
  */

  const openProjectModal = useCallback(() => {
    setShowProjectModal(true);
  }, []);

  const closeProjectModal = useCallback(() => {
    setShowProjectModal(false);
  }, []);

  const closeExecutorModal = useCallback(() => {
    setShowExecutorModal(false);
  }, []);

  return (
    <div>
      <SearchBar
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onSearch={handleSearch}
        onReset={handleReset}
        onRefreshAll={handleRefreshAll}
        onAddProject={openProjectModal}
      />

      <ProjectTable
        projects={projects}
        onAddExecutor={handleAddExecutorClick}
        onDeleteProject={handleDeleteProject}
        onDeleteExecutor={handleDeleteExecutor}
        onUpdateExecutor={handleUpdateExecutor}
        onResetExpectedDI={handleResetExpectedDI}
        onRefreshProject={handleRefreshAll}
        onTestGroupChange={handleTestGroupChange}
        onProjectLevelChange={handleProjectLevelChange}
        onStatusChange={handleStatusChange}
        onStartDateChange={handleStartDateChange}
        onExpectedIssuesChange={handleExpectedIssuesChange}
        onExpectedDIChange={handleExpectedDIChange}
        onEditProjectName={handleEditProjectName}
        onLoadExecutors={loadExecutorsForProject}
      />

      <AddProjectModal
        visible={showProjectModal}
        onCancel={closeProjectModal}
        onSubmit={handleAddProjectSubmit}
      />

      <AddExecutorModal
        visible={showExecutorModal}
        onCancel={closeExecutorModal}
        onSubmit={handleAddExecutorSubmit}
      />
    </div>
  );
}
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { message } from "antd";
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
  const [filters, setFilters] = useState({
    testGroup: undefined,
    projectLevel: undefined,
    status: undefined,
    projectName: ""
  });
  const [loadingExecutors, setLoadingExecutors] = useState({});
  const executorsCacheRef = React.useRef(new Map());

  const fetchProjects = useCallback(async (params) => {
    try {
      const res = await axios.get(`${API_BASE}/projects/projects`);
      const cache = executorsCacheRef.current;

      const data = res.data.map((p) => {
        const projectId = p.ID ?? p.id;
        return {
          ...p,
          id: projectId,
          executors: cache.get(projectId) || []
        };
      });

      const f = params || {};
      const filtered = data.filter((p) => {
        if (f.testGroup && p.TestGroup !== f.testGroup) return false;
        if (f.projectLevel && p.ProjectLevel !== f.projectLevel) return false;
        if (f.status && p.Status !== f.status) return false;
        if (f.projectName && !String(p.ProjectName || "").toLowerCase().includes(f.projectName.toLowerCase())) {
          return false;
        }
        return true;
      });

      setProjects(filtered);
    } catch (err) {
      console.error("获取项目列表失败:", err);
      message.error("获取项目列表失败");
    }
  }, []);

  useEffect(() => {
    fetchProjects(filters);
  }, [fetchProjects]);

  const loadExecutorsForProject = useCallback(async (projectId) => {
    setLoadingExecutors((prev) => ({ ...prev, [projectId]: true }));
    try {
      const res = await axios.get(`${API_BASE}/executors/executors/${projectId}`);
      const executors = res.data || [];
      executorsCacheRef.current.set(projectId, executors);
      setProjects((prevProjects) =>
        prevProjects.map((p) => (p.id === projectId ? { ...p, executors } : p))
      );
    } catch (err) {
      console.error(`加载执行人失败:`, err);
      message.error("加载执行人失败");
    } finally {
      setLoadingExecutors((prev) => ({ ...prev, [projectId]: false }));
    }
  }, []);

  const handleAddProjectSubmit = useCallback(() => {
    setShowProjectModal(false);
    fetchProjects(filters);
  }, [fetchProjects, filters]);

  const handleAddExecutorClick = useCallback((project) => {
    setCurrentProjectId(project.id);
    setShowExecutorModal(true);
  }, []);

  const handleAddExecutorSubmit = useCallback(() => {
    setShowExecutorModal(false);
    if (currentProjectId) {
      loadExecutorsForProject(currentProjectId);
    }
  }, [currentProjectId, loadExecutorsForProject]);

  const handleDeleteProject = useCallback(async (id) => {
    try {
      await axios.post(`${API_BASE}/projects/delete_project`, { id });
      message.success("删除成功");
      fetchProjects(filters);
    } catch (err) {
      console.error("删除项目失败:", err);
      message.error("删除项目失败");
    }
  }, [fetchProjects, filters]);

  const handleDeleteExecutor = useCallback(async (projectId, executorId) => {
    try {
      await axios.post(`${API_BASE}/executors/delete_executor`, { id: executorId });
      message.success("删除成功");
      loadExecutorsForProject(projectId);
    } catch (err) {
      console.error("删除执行人失败:", err);
      message.error("删除执行人失败");
    }
  }, [loadExecutorsForProject]);

  const updateProjectField = useCallback(async (id, column, value) => {
    try {
      await axios.post(`${API_BASE}/projects/update_project`, { id, column, value });
      setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, [column]: value } : p)));
    } catch (err) {
      console.error("更新项目失败:", err);
      message.error("更新项目失败");
    }
  }, []);

  const handleTestGroupChange = useCallback((id, value) => updateProjectField(id, "TestGroup", value), [updateProjectField]);
  const handleProjectLevelChange = useCallback((id, value) => updateProjectField(id, "ProjectLevel", value), [updateProjectField]);
  const handleStatusChange = useCallback((id, value) => updateProjectField(id, "Status", value), [updateProjectField]);
  const handleStartDateChange = useCallback((id, value) => updateProjectField(id, "StartDate", value), [updateProjectField]);
  const handleExpectedIssuesChange = useCallback((id, value) => updateProjectField(id, "ExpectedIssues", value), [updateProjectField]);
  const handleExpectedDIChange = useCallback((id, value) => updateProjectField(id, "ExpectedDI", value), [updateProjectField]);
  const handleEditProjectName = useCallback((id, value) => updateProjectField(id, "ProjectName", value), [updateProjectField]);

  const handleUpdateExecutor = useCallback(async (projectId, executorId, field, value) => {
    try {
      await axios.post(`${API_BASE}/executors/update_executor`, {
        id: executorId,
        [field]: value
      });
      setProjects((prev) =>
        prev.map((p) =>
          p.id === projectId
            ? {
                ...p,
                executors: (p.executors || []).map((e) => (e.ID === executorId ? { ...e, [field]: value } : e))
              }
            : p
        )
      );
    } catch (err) {
      console.error("更新执行人失败:", err);
      message.error("更新执行人失败");
    }
  }, []);

  const handleResetExpectedDI = useCallback(async (projectId, executorId) => {
    try {
      await axios.post(`${API_BASE}/executors/reset_expected_update`, { id: executorId });
      message.success("同步基线数据成功");
      loadExecutorsForProject(projectId);
    } catch (err) {
      console.error("同步基线数据失败:", err);
      message.error("同步基线数据失败");
    }
  }, [loadExecutorsForProject]);

  const handleFiltersChange = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  const handleSearch = useCallback((newFilters) => {
    setFilters(newFilters);
    fetchProjects(newFilters);
  }, [fetchProjects]);

  const handleReset = useCallback((resetFilters) => {
    setFilters(resetFilters);
    fetchProjects(resetFilters);
  }, [fetchProjects]);

  const handleRefreshAll = useCallback(async () => {
    try {
      message.loading({ content: "正在刷新所有项目...", key: "refresh" });
      await axios.post(`${API_BASE}/projects/refresh_all_projects`);
      message.success({ content: "刷新完成", key: "refresh" });
      fetchProjects(filters);
    } catch (err) {
      console.error("刷新失败:", err);
      message.error({ content: "刷新失败", key: "refresh" });
    }
  }, [fetchProjects, filters]);

  const handleRefreshProject = useCallback(async (projectId) => {
    try {
      message.loading({ content: "正在刷新项目...", key: `refresh-${projectId}` });
      const res = await axios.post(`${API_BASE}/executors/update_executors_data`, { id: projectId });
      if (res.data.message === "手工创建项目，不支持刷新") {
        message.warning({ content: res.data.message, key: `refresh-${projectId}` });
      } else {
        message.success({ content: "刷新完成", key: `refresh-${projectId}` });
      }
      loadExecutorsForProject(projectId);
    } catch (err) {
      console.error("刷新失败:", err);
      message.error({ content: "刷新失败", key: `refresh-${projectId}` });
    }
  }, [loadExecutorsForProject]);

  const openProjectModal = useCallback(() => setShowProjectModal(true), []);
  const closeProjectModal = useCallback(() => setShowProjectModal(false), []);
  const closeExecutorModal = useCallback(() => setShowExecutorModal(false), []);

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
        onRefreshProject={handleRefreshProject}
        onTestGroupChange={handleTestGroupChange}
        onProjectLevelChange={handleProjectLevelChange}
        onStatusChange={handleStatusChange}
        onStartDateChange={handleStartDateChange}
        onExpectedIssuesChange={handleExpectedIssuesChange}
        onExpectedDIChange={handleExpectedDIChange}
        onEditProjectName={handleEditProjectName}
        onLoadExecutors={loadExecutorsForProject}
        loadingExecutors={loadingExecutors}
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
        projectId={currentProjectId}
      />
    </div>
  );
}

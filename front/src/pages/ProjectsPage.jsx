import React, { useState, useEffect } from "react";
import axios from "axios";
import ProjectTable from "../components/TaskPanel/ProjectTable";
import AddProjectModal from "../components/TaskPanel/AddProjectModal";
import AddExecutorModal from "../components/TaskPanel/AddExecutorModal";
import SearchBar from "../components/TaskPanel/SearchBar";

const API_BASE = "http://localhost:65001/api";

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showExecutorModal, setShowExecutorModal] = useState(false);
  const [currentProjectId, setCurrentProjectId] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await axios.get(`${API_BASE}/projects/projects`);
      const data = res.data.map(p => ({
        ...p,
        executors: p.executors || []
      }));
      setProjects(data);
    } catch (err) {
      console.error("获取项目列表失败:", err);
    }
  };

  const handleAddProjectSubmit = async (values) => {
    try {
      await axios.post(`${API_BASE}/projects`, values);
      fetchProjects();
    } catch (err) {
      console.error("新增项目失败:", err);
    }
    setShowProjectModal(false);
  };

  const handleAddExecutorClick = (project) => {
    setCurrentProjectId(project.ID);
    setShowExecutorModal(true);
  };

  const handleAddExecutorSubmit = async (executor) => {
    try {
      await axios.post(`${API_BASE}/projects/${currentProjectId}/executors`, executor);
      fetchProjects();
    } catch (err) {
      console.error("新增执行人失败:", err);
    }
    setShowExecutorModal(false);
  };

  const handleDeleteProject = async (id) => {
    try {
      await axios.delete(`${API_BASE}/projects/${id}`);
      fetchProjects();
    } catch (err) {
      console.error("删除项目失败:", err);
    }
  };

  const handleDeleteExecutor = async (projectId, executorId) => {
    try {
      await axios.delete(`${API_BASE}/projects/${projectId}/executors/${executorId}`);
      fetchProjects();
    } catch (err) {
      console.error("删除执行人失败:", err);
    }
  };

  return (
    <div>
      <SearchBar
        onSearch={() => console.log("搜索")}
        onReset={() => console.log("重置")}
        onRefreshAll={fetchProjects}
        onAddProject={() => setShowProjectModal(true)}
      />

      <ProjectTable
        projects={projects}
        onAddExecutor={handleAddExecutorClick}
        onDeleteProject={handleDeleteProject}
        onDeleteExecutor={(executorId) => handleDeleteExecutor(currentProjectId, executorId)}
        onRefreshProject={fetchProjects}
      />

      <AddProjectModal
        visible={showProjectModal}
        onCancel={() => setShowProjectModal(false)}
        onSubmit={handleAddProjectSubmit}
      />

      <AddExecutorModal
        visible={showExecutorModal}
        onCancel={() => setShowExecutorModal(false)}
        onSubmit={handleAddExecutorSubmit}
      />
    </div>
  );
}
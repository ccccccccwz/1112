import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { message, Modal, Spin } from 'antd';
import AddProjectModal from './AddProjectModal';
import AddExecutorModal from './AddExecutorModal';

const API_BASE = '/api';

const TestTaskTable = () => {
  const [projects, setProjects] = useState([]);
  const [executorsCache, setExecutorsCache] = useState({});
  const [loadingExecutors, setLoadingExecutors] = useState({});
  const [loading, setLoading] = useState(false);
  const [expandedProject, setExpandedProject] = useState(null);
  const [editingCell, setEditingCell] = useState(null);
  const [editingValue, setEditingValue] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [sortDirection, setSortDirection] = useState('desc');

  // 搜索条件
  const [searchText, setSearchText] = useState('');
  const [searchTextInput, setSearchTextInput] = useState('');
  const [filterTestGroup, setFilterTestGroup] = useState('全部');
  const [filterLevel, setFilterLevel] = useState('全部');
  const [filterStatus, setFilterStatus] = useState('全部');

  // 弹窗状态
  const [addProjectVisible, setAddProjectVisible] = useState(false);
  const [addExecutorVisible, setAddExecutorVisible] = useState(false);
  const [selectedProjectForExecutor, setSelectedProjectForExecutor] = useState(null);

  // 加载项目数据
  const loadProjects = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/projects/projects`);
      setProjects(res.data || []);
    } catch (err) {
      message.error('加载项目失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  // 加载执行人数据
  const loadExecutors = useCallback(async (projectId) => {
    if (executorsCache[projectId]) return;
    setLoadingExecutors(prev => ({ ...prev, [projectId]: true }));
    try {
      const res = await axios.get(`${API_BASE}/executors/executors/${projectId}`);
      if (res.status === 200) {
        setExecutorsCache(prev => ({ ...prev, [projectId]: res.data }));
      }
    } catch (err) {
      if (err.response?.status !== 404) {
        message.error('加载执行人失败');
      }
      setExecutorsCache(prev => ({ ...prev, [projectId]: [] }));
    } finally {
      setLoadingExecutors(prev => ({ ...prev, [projectId]: false }));
    }
  }, [executorsCache]);

  // 过滤和排序
  const filteredProjects = useMemo(() => {
    let filtered = projects.filter(p => {
      const matchesText = searchText === '' ||
        (p.ProjectName || '').toLowerCase().includes(searchText.toLowerCase()) ||
        (p.TestGroup || '').toLowerCase().includes(searchText.toLowerCase());
      const matchesTestGroup = filterTestGroup === '全部' || p.TestGroup === filterTestGroup;
      const matchesLevel = filterLevel === '全部' || p.ProjectLevel === filterLevel;
      const matchesStatus = filterStatus === '全部' || p.Status === filterStatus;
      return matchesText && matchesTestGroup && matchesLevel && matchesStatus;
    });

    filtered.sort((a, b) => {
      const dateA = new Date(a.StartDate || 0);
      const dateB = new Date(b.StartDate || 0);
      return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
    });

    return filtered;
  }, [projects, searchText, filterTestGroup, filterLevel, filterStatus, sortDirection]);

  const paginatedProjects = filteredProjects.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);

  const handleSearch = () => {
    setSearchText(searchTextInput);
    setCurrentPage(1);
  };

  const handleReset = () => {
    setSearchText('');
    setSearchTextInput('');
    setFilterTestGroup('全部');
    setFilterLevel('全部');
    setFilterStatus('全部');
    setCurrentPage(1);
  };

  const toggleSort = () => {
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  // 单元格编辑
  const handleCellEdit = (projectId, executorId, field, currentValue) => {
    const projectNonEditableFields = ['HeadCounts', 'AverageIssues', 'AverageDI', 'ConversionFactor'];
    const executorNonEditableFields = ['ActualIssues', 'ActualDI', 'IsTargetIssuesOnTarget', 'IsTargetDIOnTarget'];

    if (executorId) {
      if (executorNonEditableFields.includes(field)) return;
    } else {
      if (projectNonEditableFields.includes(field)) return;
    }

    setEditingCell({ projectId, executorId, field });
    setEditingValue(currentValue);
  };

  const handleSaveCell = async (projectId, executorId, field) => {
    try {
      if (executorId) {
        await axios.post(`${API_BASE}/executors/update_executor`, {
          id: executorId,
          column: field,
          value: editingValue
        });
        // 更新缓存
        setExecutorsCache(prev => ({
          ...prev,
          [projectId]: (prev[projectId] || []).map(e =>
            e.ID === executorId ? { ...e, [field]: editingValue } : e
          )
        }));
      } else {
        await axios.post(`${API_BASE}/projects/update_project`, {
          id: projectId,
          column: field,
          value: editingValue
        });
        setProjects(prev => prev.map(p =>
          p.ID === projectId ? { ...p, [field]: editingValue } : p
        ));
      }
      message.success('保存成功');
    } catch (err) {
      message.error('保存失败');
    }
    setEditingCell(null);
    setEditingValue('');
  };

  const handleCancelEdit = () => {
    setEditingCell(null);
    setEditingValue('');
  };

  // 删除项目
  const deleteProject = async (projectId) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除此项目吗？',
      onOk: async () => {
        try {
          await axios.post(`${API_BASE}/projects/delete_project`, { id: projectId });
          message.success('删除成功');
          loadProjects();
        } catch (err) {
          message.error('删除失败');
        }
      }
    });
  };

  // 删除执行人
  const deleteExecutor = async (projectId, executorId) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除此执行人吗？',
      onOk: async () => {
        try {
          await axios.post(`${API_BASE}/executors/delete_executor`, { id: executorId });
          message.success('删除成功');
          setExecutorsCache(prev => ({
            ...prev,
            [projectId]: (prev[projectId] || []).filter(e => e.ID !== executorId)
          }));
        } catch (err) {
          message.error('删除失败');
        }
      }
    });
  };

  // 刷新单个项目
  const refreshProject = async (projectId) => {
    try {
      message.loading({ content: '刷新中...', key: `refresh-${projectId}` });
      const res = await axios.post(`${API_BASE}/executors/update_executors_data`, { id: projectId });
      if (res.data.message === 'Project data no task ID for refresh!') {
        message.warning({ content: '手工创建项目，不支持刷新', key: `refresh-${projectId}` });
      } else {
        message.success({ content: '刷新成功', key: `refresh-${projectId}` });
        // 清除缓存重新加载
        setExecutorsCache(prev => {
          const newCache = { ...prev };
          delete newCache[projectId];
          return newCache;
        });
        if (expandedProject === projectId) {
          loadExecutors(projectId);
        }
      }
    } catch (err) {
      message.error({ content: '刷新失败', key: `refresh-${projectId}` });
    }
  };

  // 刷新所有项目
  const refreshAllProjects = async () => {
    try {
      message.loading({ content: '刷新所有项目中...', key: 'refresh-all' });
      await axios.post(`${API_BASE}/projects/refresh_all_projects`);
      message.success({ content: '刷新完成', key: 'refresh-all' });
      loadProjects();
      setExecutorsCache({});
    } catch (err) {
      message.error({ content: '刷新失败', key: 'refresh-all' });
    }
  };

  // 同步基线（重置期望值）
  const syncBaseline = async (projectId, executorId) => {
    try {
      await axios.post(`${API_BASE}/executors/reset_expected_update`, {
        projectID: projectId,
        executorID: executorId
      });
      message.success('同步成功');
      // 刷新执行人数据
      setExecutorsCache(prev => {
        const newCache = { ...prev };
        delete newCache[projectId];
        return newCache;
      });
      loadExecutors(projectId);
    } catch (err) {
      message.error('同步失败');
    }
  };

  // 添加项目成功回调
  const handleAddProjectSuccess = () => {
    setAddProjectVisible(false);
    loadProjects();
  };

  // 添加执行人
  const handleAddExecutor = (project) => {
    setSelectedProjectForExecutor(project);
    setAddExecutorVisible(true);
  };

  const handleAddExecutorSuccess = () => {
    setAddExecutorVisible(false);
    if (selectedProjectForExecutor) {
      setExecutorsCache(prev => {
        const newCache = { ...prev };
        delete newCache[selectedProjectForExecutor.ID];
        return newCache;
      });
      loadExecutors(selectedProjectForExecutor.ID);
    }
  };

  // 计算总计
  const calculateTotals = (executors, project) => {
    if (!executors || executors.length === 0) return null;

    const totalDays = executors.reduce((sum, e) => sum + Number(e.Days || 0), 0);
    const totalExpectedIssues = executors.reduce((sum, e) => sum + Number(e.ExpectedIssues || 0), 0);
    const totalExpectedDI = executors.reduce((sum, e) => sum + parseFloat(e.ExpectedDI || 0), 0);
    const totalActualIssues = executors.reduce((sum, e) => sum + Number(e.ActualIssues || 0), 0);
    const totalLevel1 = executors.reduce((sum, e) => sum + Number(e.Level1Issues || 0), 0);
    const totalLevel2 = executors.reduce((sum, e) => sum + Number(e.Level2Issues || 0), 0);
    const totalLevel3 = executors.reduce((sum, e) => sum + Number(e.Level3Issues || 0), 0);
    const totalLevel4 = executors.reduce((sum, e) => sum + Number(e.Level4Issues || 0), 0);
    const totalActualDI = executors.reduce((sum, e) => sum + parseFloat(e.ActualDI || 0), 0);

    const issuesMet = totalActualIssues >= (project.ExpectedIssues || 0);
    const diMet = totalActualDI >= parseFloat(project.ExpectedDI || 0);

    return {
      days: totalDays,
      expectedIssues: totalExpectedIssues,
      expectedDI: totalExpectedDI.toFixed(2),
      actualIssues: totalActualIssues,
      level1: totalLevel1,
      level2: totalLevel2,
      level3: totalLevel3,
      level4: totalLevel4,
      actualDI: totalActualDI.toFixed(2),
      issuesMet,
      diMet
    };
  };

  // 可编辑单元格组件
  const EditableCell = ({ projectId, executorId, field, value, isEditable = true, type = 'text', options = [], align = 'center' }) => {
    const isEditing = editingCell?.projectId === projectId &&
                      editingCell?.executorId === executorId &&
                      editingCell?.field === field;

    if (!isEditable) {
      return (
        <div style={{
          fontSize: '0.85rem',
          color: '#94A3B8',
          fontWeight: '600',
          textAlign: align
        }}>
          {value}
        </div>
      );
    }

    if (isEditing) {
      if (type === 'select') {
        return (
          <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center', justifyContent: align }}>
            <select
              value={editingValue}
              onChange={(e) => setEditingValue(e.target.value)}
              style={{
                padding: '0.35rem',
                border: '2px solid #3B82F6',
                borderRadius: '4px',
                fontSize: '0.8rem',
                outline: 'none'
              }}
              autoFocus
            >
              {options.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            <button onClick={() => handleSaveCell(projectId, executorId, field)} style={{
              padding: '0.35rem',
              background: '#10B981',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              color: 'white',
              fontSize: '12px'
            }}>✓</button>
            <button onClick={handleCancelEdit} style={{
              padding: '0.35rem',
              background: '#EF4444',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              color: 'white',
              fontSize: '12px'
            }}>✕</button>
          </div>
        );
      }

      return (
        <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center', justifyContent: align }}>
          <input
            type={type === 'number' ? 'number' : type === 'date' ? 'date' : 'text'}
            value={editingValue}
            onChange={(e) => setEditingValue(e.target.value)}
            step={type === 'number' && (field.includes('DI') || field === 'ConversionFactor') ? '0.01' : '1'}
            style={{
              padding: '0.35rem',
              border: '2px solid #3B82F6',
              borderRadius: '4px',
              fontSize: '0.8rem',
              width: field === 'ProjectName' ? '200px' : field === 'ExecutorName' ? '80px' : '60px',
              outline: 'none'
            }}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveCell(projectId, executorId, field);
              if (e.key === 'Escape') handleCancelEdit();
            }}
          />
          <button onClick={() => handleSaveCell(projectId, executorId, field)} style={{
            padding: '0.35rem',
            background: '#10B981',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            color: 'white',
            fontSize: '12px'
          }}>✓</button>
          <button onClick={handleCancelEdit} style={{
            padding: '0.35rem',
            background: '#EF4444',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            color: 'white',
            fontSize: '12px'
          }}>✕</button>
        </div>
      );
    }

    return (
      <div
        onClick={() => handleCellEdit(projectId, executorId, field, value)}
        style={{
          fontSize: '0.85rem',
          color: '#0F172A',
          fontWeight: field === 'ProjectName' || field === 'ExecutorName' ? '700' : '600',
          cursor: 'pointer',
          padding: '0.25rem',
          borderRadius: '4px',
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
          justifyContent: align
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = '#F1F5F9'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
      >
        {value}
        <span style={{ opacity: 0.5, fontSize: '10px' }}>✎</span>
      </div>
    );
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F8FAFC',
      padding: '1.5rem'
    }}>
      {/* Header */}
      <div style={{
        background: 'white',
        padding: '1.5rem',
        borderRadius: '12px',
        marginBottom: '1.5rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        border: '1px solid #E2E8F0'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem'
        }}>
          <div>
            <h1 style={{
              fontSize: '1.5rem',
              fontWeight: '800',
              color: '#0F172A',
              marginBottom: '0.5rem'
            }}>
              测试项目管理
            </h1>
            <p style={{
              fontSize: '0.9rem',
              color: '#64748B',
              fontWeight: '500'
            }}>
              共 {filteredProjects.length} 个项目
            </p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={refreshAllProjects}
              style={{
                padding: '0.75rem 1.25rem',
                background: '#F1F5F9',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                fontSize: '0.9rem',
                fontWeight: '600',
                color: '#475569',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              🔄 刷新全部
            </button>
            <button
              onClick={() => setAddProjectVisible(true)}
              style={{
                padding: '0.75rem 1.25rem',
                background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.9rem',
                fontWeight: '700',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
              }}
            >
              ➕ 新建项目
            </button>
          </div>
        </div>

        {/* Search Filters */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr 1fr auto',
          gap: '1rem',
          alignItems: 'center'
        }}>
          <div style={{ position: 'relative' }}>
            <span style={{
              position: 'absolute',
              left: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#94A3B8'
            }}>🔍</span>
            <input
              type="text"
              placeholder="搜索项目名称..."
              value={searchTextInput}
              onChange={(e) => setSearchTextInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
              style={{
                width: '100%',
                padding: '0.75rem 1rem 0.75rem 2.5rem',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            />
          </div>

          <select
            value={filterTestGroup}
            onChange={(e) => { setFilterTestGroup(e.target.value); setCurrentPage(1); }}
            style={{
              padding: '0.75rem 1rem',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              fontSize: '0.9rem',
              fontWeight: '600',
              color: '#475569',
              outline: 'none',
              cursor: 'pointer',
              background: 'white'
            }}
          >
            <option value="全部">全部测试组</option>
            <option value="交换">交换</option>
            <option value="路由">路由</option>
            <option value="安全">安全</option>
          </select>

          <select
            value={filterLevel}
            onChange={(e) => { setFilterLevel(e.target.value); setCurrentPage(1); }}
            style={{
              padding: '0.75rem 1rem',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              fontSize: '0.9rem',
              fontWeight: '600',
              color: '#475569',
              outline: 'none',
              cursor: 'pointer',
              background: 'white'
            }}
          >
            <option value="全部">全部级别</option>
            <option value="普通">普通</option>
            <option value="重要">重要</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
            style={{
              padding: '0.75rem 1rem',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              fontSize: '0.9rem',
              fontWeight: '600',
              color: '#475569',
              outline: 'none',
              cursor: 'pointer',
              background: 'white'
            }}
          >
            <option value="全部">全部状态</option>
            <option value="进行中">进行中</option>
            <option value="已完成">已完成</option>
          </select>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={handleSearch}
              style={{
                padding: '0.75rem 1.25rem',
                background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.9rem',
                fontWeight: '700',
                color: 'white',
                cursor: 'pointer'
              }}
            >
              搜索
            </button>
            <button
              onClick={handleReset}
              style={{
                padding: '0.75rem 1.25rem',
                background: '#F1F5F9',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                fontSize: '0.9rem',
                fontWeight: '700',
                color: '#475569',
                cursor: 'pointer'
              }}
            >
              重置
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        border: '1px solid #E2E8F0'
      }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <Spin tip="加载中..." />
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '40px 80px 2fr 70px 60px 90px 80px 80px 70px 100px 70px 100px',
              gap: '0.5rem',
              padding: '0.75rem 1rem',
              background: '#F8FAFC',
              borderBottom: '2px solid #E2E8F0',
              alignItems: 'center'
            }}>
              <div style={{ fontSize: '0.7rem', fontWeight: '800', color: '#475569', textAlign: 'center' }}></div>
              <div style={{ fontSize: '0.7rem', fontWeight: '800', color: '#475569', textAlign: 'center' }}>测试组</div>
              <div style={{ fontSize: '0.7rem', fontWeight: '800', color: '#475569', textAlign: 'center' }}>项目名称</div>
              <div style={{ fontSize: '0.7rem', fontWeight: '800', color: '#475569', textAlign: 'center' }}>系数</div>
              <div style={{ fontSize: '0.7rem', fontWeight: '800', color: '#475569', textAlign: 'center' }}>级别</div>
              <div style={{ fontSize: '0.7rem', fontWeight: '800', color: '#EF4444', textAlign: 'center' }}>预期问题</div>
              <div style={{ fontSize: '0.7rem', fontWeight: '800', color: '#10B981', textAlign: 'center' }}>预期DI</div>
              <div style={{ fontSize: '0.7rem', fontWeight: '800', color: '#475569', textAlign: 'center' }}>问题均数</div>
              <div style={{ fontSize: '0.7rem', fontWeight: '800', color: '#475569', textAlign: 'center' }}>DI均值</div>
              <div
                onClick={toggleSort}
                style={{
                  fontSize: '0.7rem',
                  fontWeight: '800',
                  color: '#475569',
                  textAlign: 'center',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.25rem'
                }}
              >
                开始日期 {sortDirection === 'asc' ? '↑' : '↓'}
              </div>
              <div style={{ fontSize: '0.7rem', fontWeight: '800', color: '#475569', textAlign: 'center' }}>状态</div>
              <div style={{ fontSize: '0.7rem', fontWeight: '800', color: '#475569', textAlign: 'center' }}>操作</div>
            </div>

            {/* Table Body */}
            {paginatedProjects.map((project) => {
              const isExpanded = expandedProject === project.ID;
              const executors = executorsCache[project.ID] || [];
              const isLoadingExec = loadingExecutors[project.ID];

              return (
                <div key={project.ID}>
                  {/* Project Row */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '40px 80px 2fr 70px 60px 90px 80px 80px 70px 100px 70px 100px',
                    gap: '0.5rem',
                    padding: '0.75rem 1rem',
                    borderBottom: '1px solid #F1F5F9',
                    background: isExpanded ? '#F8FAFC' : 'white',
                    alignItems: 'center'
                  }}>
                    <button
                      onClick={() => {
                        if (isExpanded) {
                          setExpandedProject(null);
                        } else {
                          setExpandedProject(project.ID);
                          loadExecutors(project.ID);
                        }
                      }}
                      style={{
                        background: isExpanded ? '#3B82F6' : '#F1F5F9',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '0.4rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: isExpanded ? 'white' : '#475569'
                      }}
                    >
                      {isExpanded ? '▲' : '▼'}
                    </button>

                    <EditableCell
                      projectId={project.ID}
                      field="TestGroup"
                      value={project.TestGroup}
                      type="select"
                      options={['交换', '路由', '安全']}
                      align="center"
                    />

                    <EditableCell
                      projectId={project.ID}
                      field="ProjectName"
                      value={project.ProjectName}
                      align="flex-start"
                    />

                    <div style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: '600', textAlign: 'center' }}>
                      {project.ConversionFactor}
                    </div>

                    <EditableCell
                      projectId={project.ID}
                      field="ProjectLevel"
                      value={project.ProjectLevel}
                      type="select"
                      options={['普通', '重要']}
                      align="center"
                    />

                    <div style={{
                      background: 'linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%)',
                      padding: '0.4rem',
                      borderRadius: '6px',
                      border: '1px solid #FECACA',
                      textAlign: 'center'
                    }}>
                      <EditableCell
                        projectId={project.ID}
                        field="ExpectedIssues"
                        value={project.ExpectedIssues}
                        type="number"
                        align="center"
                      />
                    </div>

                    <div style={{
                      background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
                      padding: '0.4rem',
                      borderRadius: '6px',
                      border: '1px solid #A7F3D0',
                      textAlign: 'center'
                    }}>
                      <EditableCell
                        projectId={project.ID}
                        field="ExpectedDI"
                        value={project.ExpectedDI}
                        type="number"
                        align="center"
                      />
                    </div>

                    <div style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: '600', textAlign: 'center' }}>
                      {project.AverageIssues}
                    </div>

                    <div style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: '600', textAlign: 'center' }}>
                      {project.AverageDI}
                    </div>

                    <EditableCell
                      projectId={project.ID}
                      field="StartDate"
                      value={project.StartDate}
                      type="date"
                      align="center"
                    />

                    <EditableCell
                      projectId={project.ID}
                      field="Status"
                      value={project.Status}
                      type="select"
                      options={['进行中', '已完成']}
                      align="center"
                    />

                    <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'center' }}>
                      <button
                        onClick={() => handleAddExecutor(project)}
                        style={{
                          padding: '0.3rem 0.5rem',
                          background: '#DBEAFE',
                          border: '1px solid #93C5FD',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.7rem',
                          color: '#1E40AF'
                        }}
                        title="新增执行人"
                      >
                        +人
                      </button>
                      <button
                        onClick={() => refreshProject(project.ID)}
                        style={{
                          padding: '0.3rem 0.5rem',
                          background: '#DBEAFE',
                          border: '1px solid #93C5FD',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.7rem',
                          color: '#1E40AF'
                        }}
                        title="刷新"
                      >
                        🔄
                      </button>
                      <button
                        onClick={() => deleteProject(project.ID)}
                        style={{
                          padding: '0.3rem 0.5rem',
                          background: '#FEE2E2',
                          border: '1px solid #FECACA',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.7rem',
                          color: '#DC2626'
                        }}
                        title="删除"
                      >
                        🗑
                      </button>
                    </div>
                  </div>

                  {/* Expanded Executors Section */}
                  {isExpanded && (
                    <div style={{
                      padding: '1rem',
                      background: '#F8FAFC',
                      borderBottom: '2px solid #E2E8F0'
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '0.75rem'
                      }}>
                        <h3 style={{
                          fontSize: '0.85rem',
                          fontWeight: '800',
                          color: '#475569'
                        }}>
                          执行人员列表
                        </h3>
                      </div>

                      {isLoadingExec ? (
                        <div style={{ padding: '2rem', textAlign: 'center' }}>
                          <Spin tip="加载执行人数据..." />
                        </div>
                      ) : executors.length === 0 ? (
                        <div style={{ padding: '1rem', textAlign: 'center', color: '#94A3B8' }}>
                          暂无执行人数据
                        </div>
                      ) : (
                        <div>
                          {/* Executors Header */}
                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: '80px 50px 70px 70px 50px 40px 40px 40px 40px 50px 70px 70px 60px',
                            gap: '0.4rem',
                            padding: '0.5rem',
                            background: 'white',
                            borderRadius: '8px 8px 0 0',
                            border: '1px solid #E2E8F0',
                            borderBottom: 'none',
                            fontSize: '0.65rem',
                            fontWeight: '800',
                            color: '#64748B',
                            textAlign: 'center'
                          }}>
                            <div style={{ textAlign: 'left' }}>执行人</div>
                            <div>天数</div>
                            <div style={{ color: '#DC2626' }}>预期问题</div>
                            <div style={{ color: '#059669' }}>预期DI</div>
                            <div>问题数</div>
                            <div>一级</div>
                            <div>二级</div>
                            <div>三级</div>
                            <div>四级</div>
                            <div>DI值</div>
                            <div style={{ color: '#DC2626' }}>问题达标</div>
                            <div style={{ color: '#059669' }}>DI达标</div>
                            <div>操作</div>
                          </div>

                          {/* Executor Rows */}
                          {executors.map((executor) => (
                            <div
                              key={executor.ID}
                              style={{
                                display: 'grid',
                                gridTemplateColumns: '80px 50px 70px 70px 50px 40px 40px 40px 40px 50px 70px 70px 60px',
                                gap: '0.4rem',
                                padding: '0.5rem',
                                background: 'white',
                                border: '1px solid #E2E8F0',
                                borderTop: 'none',
                                alignItems: 'center',
                                fontSize: '0.8rem'
                              }}
                            >
                              <EditableCell projectId={project.ID} executorId={executor.ID} field="ExecutorName" value={executor.ExecutorName} align="flex-start" />
                              <EditableCell projectId={project.ID} executorId={executor.ID} field="Days" value={executor.Days} type="number" />

                              <div style={{
                                background: '#FEE2E2',
                                padding: '0.3rem',
                                borderRadius: '4px',
                                border: '1px solid #FCA5A5',
                                textAlign: 'center'
                              }}>
                                <EditableCell projectId={project.ID} executorId={executor.ID} field="ExpectedIssues" value={executor.ExpectedIssues} type="number" />
                              </div>

                              <div style={{
                                background: '#D1FAE5',
                                padding: '0.3rem',
                                borderRadius: '4px',
                                border: '1px solid #6EE7B7',
                                textAlign: 'center'
                              }}>
                                <EditableCell projectId={project.ID} executorId={executor.ID} field="ExpectedDI" value={executor.ExpectedDI} type="number" />
                              </div>

                              <div style={{ fontSize: '0.8rem', color: '#64748B', textAlign: 'center' }}>{executor.ActualIssues}</div>
                              <EditableCell projectId={project.ID} executorId={executor.ID} field="Level1Issues" value={executor.Level1Issues} type="number" />
                              <EditableCell projectId={project.ID} executorId={executor.ID} field="Level2Issues" value={executor.Level2Issues} type="number" />
                              <EditableCell projectId={project.ID} executorId={executor.ID} field="Level3Issues" value={executor.Level3Issues} type="number" />
                              <EditableCell projectId={project.ID} executorId={executor.ID} field="Level4Issues" value={executor.Level4Issues} type="number" />
                              <div style={{ fontSize: '0.8rem', color: '#64748B', textAlign: 'center' }}>{executor.ActualDI}</div>

                              <div style={{
                                padding: '0.25rem',
                                background: executor.IsTargetIssuesOnTarget ? '#D1FAE5' : '#FEE2E2',
                                borderRadius: '4px',
                                border: `1px solid ${executor.IsTargetIssuesOnTarget ? '#6EE7B7' : '#FCA5A5'}`,
                                textAlign: 'center',
                                fontSize: '0.65rem',
                                fontWeight: '700',
                                color: executor.IsTargetIssuesOnTarget ? '#065F46' : '#991B1B'
                              }}>
                                {executor.IsTargetIssuesOnTarget ? '达标' : '未达标'}
                              </div>

                              <div style={{
                                padding: '0.25rem',
                                background: executor.IsTargetDIOnTarget ? '#D1FAE5' : '#FEE2E2',
                                borderRadius: '4px',
                                border: `1px solid ${executor.IsTargetDIOnTarget ? '#6EE7B7' : '#FCA5A5'}`,
                                textAlign: 'center',
                                fontSize: '0.65rem',
                                fontWeight: '700',
                                color: executor.IsTargetDIOnTarget ? '#065F46' : '#991B1B'
                              }}>
                                {executor.IsTargetDIOnTarget ? '达标' : '未达标'}
                              </div>

                              <div style={{ display: 'flex', gap: '0.2rem', justifyContent: 'center' }}>
                                <button
                                  onClick={() => syncBaseline(project.ID, executor.ID)}
                                  style={{
                                    padding: '0.25rem 0.4rem',
                                    background: '#DBEAFE',
                                    border: '1px solid #93C5FD',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '0.6rem',
                                    fontWeight: '700',
                                    color: '#1E40AF'
                                  }}
                                  title="同步基线"
                                >
                                  同步
                                </button>
                                <button
                                  onClick={() => deleteExecutor(project.ID, executor.ID)}
                                  style={{
                                    padding: '0.25rem',
                                    background: '#FEE2E2',
                                    border: '1px solid #FECACA',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '0.6rem',
                                    color: '#DC2626'
                                  }}
                                  title="删除"
                                >
                                  🗑
                                </button>
                              </div>
                            </div>
                          ))}

                          {/* Total Row */}
                          {executors.length > 0 && (() => {
                            const totals = calculateTotals(executors, project);
                            if (!totals) return null;
                            return (
                              <div style={{
                                display: 'grid',
                                gridTemplateColumns: '80px 50px 70px 70px 50px 40px 40px 40px 40px 50px 70px 70px 60px',
                                gap: '0.4rem',
                                padding: '0.5rem',
                                background: 'linear-gradient(135deg, #F1F5F9 0%, #E2E8F0 100%)',
                                border: '2px solid #CBD5E1',
                                borderRadius: '0 0 8px 8px',
                                alignItems: 'center',
                                fontSize: '0.8rem',
                                fontWeight: '800',
                                textAlign: 'center'
                              }}>
                                <div style={{ color: '#0F172A', textAlign: 'left' }}>总计</div>
                                <div style={{ color: '#475569' }}>{totals.days}</div>
                                <div style={{ color: '#DC2626' }}>{totals.expectedIssues}</div>
                                <div style={{ color: '#059669' }}>{totals.expectedDI}</div>
                                <div style={{ color: '#475569' }}>{totals.actualIssues}</div>
                                <div style={{ color: '#475569' }}>{totals.level1}</div>
                                <div style={{ color: '#475569' }}>{totals.level2}</div>
                                <div style={{ color: '#475569' }}>{totals.level3}</div>
                                <div style={{ color: '#475569' }}>{totals.level4}</div>
                                <div style={{ color: '#475569' }}>{totals.actualDI}</div>
                                <div style={{
                                  padding: '0.25rem',
                                  background: totals.issuesMet ? '#D1FAE5' : '#FEE2E2',
                                  borderRadius: '4px',
                                  border: `1px solid ${totals.issuesMet ? '#6EE7B7' : '#FCA5A5'}`,
                                  fontSize: '0.65rem',
                                  fontWeight: '700',
                                  color: totals.issuesMet ? '#065F46' : '#991B1B'
                                }}>
                                  {totals.issuesMet ? '达标' : '未达标'}
                                </div>
                                <div style={{
                                  padding: '0.25rem',
                                  background: totals.diMet ? '#D1FAE5' : '#FEE2E2',
                                  borderRadius: '4px',
                                  border: `1px solid ${totals.diMet ? '#6EE7B7' : '#FCA5A5'}`,
                                  fontSize: '0.65rem',
                                  fontWeight: '700',
                                  color: totals.diMet ? '#065F46' : '#991B1B'
                                }}>
                                  {totals.diMet ? '达标' : '未达标'}
                                </div>
                                <div></div>
                              </div>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* Pagination */}
      <div style={{
        marginTop: '1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'white',
        padding: '1rem',
        borderRadius: '8px',
        border: '1px solid #E2E8F0'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ fontSize: '0.9rem', color: '#64748B', fontWeight: '600' }}>
            显示 {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredProjects.length)} / 共 {filteredProjects.length} 个项目
          </div>
          <select
            value={itemsPerPage}
            onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
            style={{
              padding: '0.5rem 1rem',
              border: '1px solid #E2E8F0',
              borderRadius: '6px',
              fontSize: '0.85rem',
              fontWeight: '600',
              color: '#475569',
              cursor: 'pointer'
            }}
          >
            <option value={15}>15条/页</option>
            <option value={25}>25条/页</option>
            <option value={50}>50条/页</option>
            <option value={100}>100条/页</option>
          </select>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            style={{
              padding: '0.5rem 1rem',
              background: currentPage === 1 ? '#F1F5F9' : 'white',
              border: '1px solid #E2E8F0',
              borderRadius: '6px',
              fontSize: '0.85rem',
              fontWeight: '600',
              color: currentPage === 1 ? '#CBD5E1' : '#475569',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
            }}
          >
            上一页
          </button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }

            return (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                style={{
                  padding: '0.5rem 0.75rem',
                  background: currentPage === pageNum ? '#0F172A' : 'white',
                  border: '1px solid #E2E8F0',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  color: currentPage === pageNum ? 'white' : '#475569',
                  cursor: 'pointer',
                  minWidth: '36px'
                }}
              >
                {pageNum}
              </button>
            );
          })}
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages || totalPages === 0}
            style={{
              padding: '0.5rem 1rem',
              background: currentPage === totalPages ? '#F1F5F9' : 'white',
              border: '1px solid #E2E8F0',
              borderRadius: '6px',
              fontSize: '0.85rem',
              fontWeight: '600',
              color: currentPage === totalPages ? '#CBD5E1' : '#475569',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
            }}
          >
            下一页
          </button>
        </div>
      </div>

      {/* Modals */}
      <AddProjectModal
        visible={addProjectVisible}
        onCancel={() => setAddProjectVisible(false)}
        onSuccess={handleAddProjectSuccess}
      />

      {selectedProjectForExecutor && (
        <AddExecutorModal
          visible={addExecutorVisible}
          onCancel={() => setAddExecutorVisible(false)}
          onSuccess={handleAddExecutorSuccess}
          project={selectedProjectForExecutor}
        />
      )}
    </div>
  );
};

export default TestTaskTable;

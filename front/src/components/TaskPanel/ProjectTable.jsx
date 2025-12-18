// src/components/TaskPanel/ProjectTable.jsx
import React, { useMemo, useCallback, useState, useEffect } from "react";
import { Table, Button, Select, DatePicker, Input, InputNumber, Spin, Modal } from "antd";
import dayjs from "dayjs";
import ExecutorTable from "./ExecutorTable";

/* ========== 下拉选项常量 ========== */
const TEST_GROUP_OPTIONS = [
  { label: "路由", value: "路由" },
  { label: "交换", value: "交换" },
  { label: "安全", value: "安全" }
];

const PROJECT_LEVEL_OPTIONS = [
  { label: "重要", value: "重要" },
  { label: "普通", value: "普通" }
];

const STATUS_OPTIONS = [
  { label: "进行中", value: "进行中" },
  { label: "已完成", value: "已完成" }
];

function ProjectTable({
  projects,
  onDeleteProject,
  onAddExecutor,
  onRefreshProject,
  onTestGroupChange,
  onProjectLevelChange,
  onStatusChange,
  onStartDateChange,
  onExpectedIssuesChange,
  onExpectedDIChange,
  onEditProjectName,
  onDeleteExecutor,
  onUpdateExecutor,
  onResetExpectedDI,
  onLoadExecutors,
  loadingExecutors = {}
}) {
  // 编辑模式状态
  const [editingRowId, setEditingRowId] = useState(null);
  // 编辑中的临时数据
  const [editingData, setEditingData] = useState({});
  // 执行人弹窗状态
  const [executorModalVisible, setExecutorModalVisible] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  // 子表相关回调
  const handleDeleteExecutor = useCallback(
    (projectId, executorId) => onDeleteExecutor(projectId, executorId),
    [onDeleteExecutor]
  );

  const handleUpdateExecutor = useCallback(
    (projectId, executorId, field, value) =>
      onUpdateExecutor(projectId, executorId, field, value),
    [onUpdateExecutor]
  );

  const handleResetExpectedDI = useCallback(
    (projectId, executorId) => onResetExpectedDI(projectId, executorId),
    [onResetExpectedDI]
  );

  // 行点击处理 - 打开执行人弹窗
  const handleRowClick = useCallback((record) => {
    setSelectedProject(record);
    setExecutorModalVisible(true);
    // 加载执行人数据
    if (!record.executors || record.executors.length === 0) {
      if (typeof onLoadExecutors === "function") {
        onLoadExecutors(record.id);
      }
    }
  }, [onLoadExecutors]);

  // 开始编辑
  const handleStartEdit = useCallback((record, e) => {
    e.stopPropagation();
    setEditingRowId(record.id);
    setEditingData({
      TestGroup: record.TestGroup,
      ProjectName: record.ProjectName,
      ProjectLevel: record.ProjectLevel,
      ExpectedIssues: record.ExpectedIssues,
      ExpectedDI: record.ExpectedDI,
      StartDate: record.StartDate,
      Status: record.Status
    });
  }, []);

  // 确认编辑
  const handleConfirmEdit = useCallback((record, e) => {
    e.stopPropagation();
    const original = record;
    // 依次保存变更的字段
    if (editingData.TestGroup !== original.TestGroup) {
      onTestGroupChange(record.id, editingData.TestGroup);
    }
    if (editingData.ProjectName !== original.ProjectName) {
      onEditProjectName(record.id, editingData.ProjectName);
    }
    if (editingData.ProjectLevel !== original.ProjectLevel) {
      onProjectLevelChange(record.id, editingData.ProjectLevel);
    }
    if (editingData.ExpectedIssues !== original.ExpectedIssues) {
      onExpectedIssuesChange(record.id, editingData.ExpectedIssues);
    }
    if (editingData.ExpectedDI !== original.ExpectedDI) {
      onExpectedDIChange(record.id, editingData.ExpectedDI);
    }
    if (editingData.StartDate !== original.StartDate) {
      onStartDateChange(record.id, editingData.StartDate);
    }
    if (editingData.Status !== original.Status) {
      onStatusChange(record.id, editingData.Status);
    }
    setEditingRowId(null);
    setEditingData({});
  }, [editingData, onTestGroupChange, onEditProjectName, onProjectLevelChange, onExpectedIssuesChange, onExpectedDIChange, onStartDateChange, onStatusChange]);

  // 取消编辑
  const handleCancelEdit = useCallback((e) => {
    e.stopPropagation();
    setEditingRowId(null);
    setEditingData({});
  }, []);

  // 更新编辑中的数据
  const updateEditingField = useCallback((field, value) => {
    setEditingData(prev => ({ ...prev, [field]: value }));
  }, []);

  // 同步 selectedProject 的 executors 数据
  useEffect(() => {
    if (selectedProject) {
      const updated = projects.find(p => p.id === selectedProject.id);
      if (updated) {
        setSelectedProject(updated);
      }
    }
  }, [projects, selectedProject]);

  const columns = useMemo(
    () => [
      {
        title: <span title="交换/路由/安全">测试组</span>,
        dataIndex: "TestGroup",
        key: "TestGroup",
        width: 90,
        align: "center",
        onHeaderCell: () => ({
          style: { whiteSpace: "nowrap", padding: "4px 6px" }
        }),
        onCell: () => ({ style: { padding: "4px 6px" } }),
        render: (text, record) => {
          const isEditing = editingRowId === record.id;
          if (isEditing) {
            return (
              <Select
                size="small"
                value={editingData.TestGroup}
                options={TEST_GROUP_OPTIONS}
                style={{ width: "100%" }}
                onClick={(e) => e.stopPropagation()}
                onChange={(val) => updateEditingField("TestGroup", val)}
              />
            );
          }
          const label = TEST_GROUP_OPTIONS.find((o) => o.value === text)?.label || text;
          return <span>{label}</span>;
        }
      },
      {
        title: <span title="项目名称">项目名</span>,
        dataIndex: "ProjectName",
        key: "ProjectName",
        align: "left",
        onHeaderCell: () => ({
          style: { whiteSpace: "nowrap", padding: "4px 6px" }
        }),
        onCell: () => ({ style: { padding: "4px 6px" } }),
        render: (text, record) => {
          const isEditing = editingRowId === record.id;
          if (isEditing) {
            return (
              <Input
                size="small"
                value={editingData.ProjectName}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => updateEditingField("ProjectName", e.target.value)}
              />
            );
          }
          return <span>{text}</span>;
        }
      },
      {
        title: <span title="产品折算系数">项目系数</span>,
        dataIndex: "ConversionFactor",
        key: "ConversionFactor",
        width: 80,
        align: "center",
        onHeaderCell: () => ({
          style: { whiteSpace: "nowrap", padding: "4px 6px" }
        }),
        onCell: () => ({ style: { padding: "4px 6px" } })
      },
      {
        title: <span title="普通/重要">级别</span>,
        dataIndex: "ProjectLevel",
        key: "ProjectLevel",
        width: 80,
        align: "center",
        onHeaderCell: () => ({
          style: { whiteSpace: "nowrap", padding: "4px 6px" }
        }),
        onCell: () => ({ style: { padding: "4px 6px" } }),
        render: (text, record) => {
          const isEditing = editingRowId === record.id;
          if (isEditing) {
            return (
              <Select
                size="small"
                value={editingData.ProjectLevel}
                options={PROJECT_LEVEL_OPTIONS}
                style={{ width: "100%" }}
                onClick={(e) => e.stopPropagation()}
                onChange={(val) => updateEditingField("ProjectLevel", val)}
              />
            );
          }
          const label = PROJECT_LEVEL_OPTIONS.find((o) => o.value === text)?.label || text;
          return <span>{label}</span>;
        }
      },
      {
        title: <span title="项目参与测试人数">人数</span>,
        dataIndex: "HeadCounts",
        key: "HeadCounts",
        width: 70,
        align: "center",
        onHeaderCell: () => ({
          style: { whiteSpace: "nowrap", padding: "4px 6px" }
        }),
        onCell: () => ({ style: { padding: "4px 6px" } })
      },
      {
        title: "预期问题数",
        dataIndex: "ExpectedIssues",
        key: "ExpectedIssues",
        width: 110,
        align: "center",
        onHeaderCell: () => ({
          style: {
            color: "red",
            whiteSpace: "nowrap",
            padding: "4px 6px"
          },
          title: "项目预期问题数(接口人手工填写)"
        }),
        onCell: () => ({ style: { padding: "4px 6px" } }),
        render: (text, record) => {
          const isEditing = editingRowId === record.id;
          if (isEditing) {
            return (
              <InputNumber
                size="small"
                style={{ width: "100%", color: "red" }}
                value={editingData.ExpectedIssues}
                min={0}
                onClick={(e) => e.stopPropagation()}
                onChange={(val) => updateEditingField("ExpectedIssues", val)}
              />
            );
          }
          return <span style={{ color: "red" }}>{text}</span>;
        }
      },
      {
        title: "预期DI",
        dataIndex: "ExpectedDI",
        key: "ExpectedDI",
        width: 90,
        align: "center",
        onHeaderCell: () => ({
          style: {
            color: "red",
            whiteSpace: "nowrap",
            padding: "4px 6px"
          },
          title: "项目预期DI(接口人手工填写)"
        }),
        onCell: () => ({ style: { padding: "4px 6px" } }),
        render: (text, record) => {
          const isEditing = editingRowId === record.id;
          if (isEditing) {
            return (
              <InputNumber
                size="small"
                style={{ width: "100%", color: "red" }}
                value={editingData.ExpectedDI}
                min={0}
                step={0.01}
                onClick={(e) => e.stopPropagation()}
                onChange={(val) => updateEditingField("ExpectedDI", val)}
              />
            );
          }
          return <span style={{ color: "red" }}>{text}</span>;
        }
      },
      {
        title: <span title="预期问题均数">问题均数</span>,
        dataIndex: "AverageIssues",
        key: "AverageIssues",
        width: 110,
        align: "center",
        onHeaderCell: () => ({
          style: { whiteSpace: "nowrap", padding: "4px 6px" }
        }),
        onCell: () => ({ style: { padding: "4px 6px" } })
      },
      {
        title: <span title="预期DI均值">DI均值</span>,
        dataIndex: "AverageDI",
        key: "AverageDI",
        width: 110,
        align: "center",
        onHeaderCell: () => ({
          style: { whiteSpace: "nowrap", padding: "4px 6px" }
        }),
        onCell: () => ({ style: { padding: "4px 6px" } })
      },
      {
        title: <span title="项目开始日期">开始日期</span>,
        dataIndex: "StartDate",
        key: "StartDate",
        width: 130,
        align: "center",
        onHeaderCell: () => ({
          style: { whiteSpace: "nowrap", padding: "4px 6px" }
        }),
        onCell: () => ({ style: { padding: "4px 6px" } }),
        render: (text, record) => {
          const isEditing = editingRowId === record.id;
          if (isEditing) {
            const parsed = editingData.StartDate ? dayjs(editingData.StartDate) : null;
            return (
              <DatePicker
                size="small"
                value={parsed}
                style={{ width: "100%" }}
                format="YYYY-MM-DD"
                onClick={(e) => e.stopPropagation()}
                onChange={(date) => {
                  const formatted = date ? date.format("YYYY-MM-DD") : null;
                  updateEditingField("StartDate", formatted);
                }}
              />
            );
          }
          return <span>{text}</span>;
        }
      },
      {
        title: <span title="项目当前状态">状态</span>,
        dataIndex: "Status",
        key: "Status",
        width: 90,
        align: "center",
        onHeaderCell: () => ({
          style: { whiteSpace: "nowrap", padding: "4px 6px" }
        }),
        onCell: () => ({ style: { padding: "4px 6px" } }),
        render: (text, record) => {
          const isEditing = editingRowId === record.id;
          if (isEditing) {
            return (
              <Select
                size="small"
                value={editingData.Status}
                options={STATUS_OPTIONS}
                style={{ width: "100%" }}
                onClick={(e) => e.stopPropagation()}
                onChange={(val) => updateEditingField("Status", val)}
              />
            );
          }
          const label = STATUS_OPTIONS.find((o) => o.value === text)?.label || text;
          return <span>{label}</span>;
        }
      },
      {
        title: "操作",
        key: "action",
        width: 280,
        align: "center",
        onHeaderCell: () => ({
          style: { whiteSpace: "nowrap", padding: "4px 6px" }
        }),
        onCell: () => ({ style: { padding: "4px 6px" } }),
        render: (_, record) => {
          const isEditing = editingRowId === record.id;
          if (isEditing) {
            return (
              <>
                <Button
                  size="small"
                  type="primary"
                  onClick={(e) => handleConfirmEdit(record, e)}
                  style={{ marginRight: 4 }}
                >
                  确认
                </Button>
                <Button
                  size="small"
                  onClick={handleCancelEdit}
                >
                  取消
                </Button>
              </>
            );
          }
          return (
            <>
              <Button
                size="small"
                onClick={(e) => handleStartEdit(record, e)}
                style={{ marginRight: 4 }}
              >
                编辑
              </Button>
              <Button
                size="small"
                onClick={(e) => { e.stopPropagation(); onAddExecutor(record); }}
                style={{ marginRight: 4 }}
              >
                新增执行人
              </Button>
              <Button
                size="small"
                onClick={(e) => { e.stopPropagation(); onRefreshProject(record.id); }}
                style={{ marginRight: 4 }}
              >
                刷新
              </Button>
              <Button
                size="small"
                danger
                onClick={(e) => { e.stopPropagation(); onDeleteProject(record.id); }}
              >
                删除
              </Button>
            </>
          );
        }
      }
    ],
    [
      editingRowId,
      editingData,
      updateEditingField,
      handleStartEdit,
      handleConfirmEdit,
      handleCancelEdit,
      onAddExecutor,
      onRefreshProject,
      onDeleteProject
    ]
  );

  // 渲染执行人弹窗内容
  const renderExecutorModalContent = () => {
    if (!selectedProject) return null;
    const isLoading = loadingExecutors[selectedProject.id];

    if (isLoading) {
      return (
        <div style={{ padding: 20, textAlign: "center" }}>
          <Spin tip="加载执行人数据中..." />
        </div>
      );
    }

    return selectedProject.executors?.length > 0 ? (
      <ExecutorTable
        executors={selectedProject.executors}
        onDeleteExecutor={(executorId) =>
          handleDeleteExecutor(selectedProject.id, executorId)
        }
        onUpdateExecutor={(executorId, field, value) =>
          handleUpdateExecutor(selectedProject.id, executorId, field, value)
        }
        onResetExpectedDI={(executorId) =>
          handleResetExpectedDI(selectedProject.id, executorId)
        }
      />
    ) : (
      <div style={{ color: "#999", padding: 10 }}>当前项目暂无执行人</div>
    );
  };

  return (
    <>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={projects}
        size="small"
        onRow={(record) => ({
          onClick: () => {
            if (editingRowId) return; // 编辑状态下不响应行点击
            handleRowClick(record);
          },
          style: { cursor: editingRowId ? "default" : "pointer" }
        })}
        pagination={{
          pageSize: 15,
          pageSizeOptions: ["15", "25", "50", "100"],
          showSizeChanger: true
        }}
        scroll={{ y: "calc(100vh - 300px)" }}
      />
      <Modal
        title={selectedProject ? `执行人列表 - ${selectedProject.ProjectName}` : "执行人列表"}
        open={executorModalVisible}
        onCancel={() => setExecutorModalVisible(false)}
        footer={null}
        width={1200}
        destroyOnClose
      >
        {renderExecutorModalContent()}
      </Modal>
    </>
  );
}

export default React.memo(ProjectTable);
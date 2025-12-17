// src/components/TaskPanel/ProjectTable.jsx
import React, { useMemo, useCallback, useState, useEffect } from "react";
import { Table, Button, Select, DatePicker, Input, InputNumber } from "antd";
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

/* ========== 文本单元格编辑 ========== */
const InlineEditableTextCell = React.memo(function InlineEditableTextCell({
  value,
  onSave
}) {
  const [editing, setEditing] = useState(false);
  const [innerValue, setInnerValue] = useState(value);

  useEffect(() => {
    if (!editing) {
      setInnerValue(value);
    }
  }, [value, editing]);

  if (!editing) {
    return (
      <div
        style={{ cursor: "pointer" }} // 不再强制 minHeight
        onClick={() => setEditing(true)}
      >
        {value || <span style={{ color: "#999" }}>点击编辑</span>}
      </div>
    );
  }

  const handleExit = () => {
    setEditing(false);
    if (innerValue !== value) onSave(innerValue);
  };

  return (
    <Input
      size="small"
      autoFocus
      value={innerValue}
      onChange={(e) => setInnerValue(e.target.value)}
      onPressEnter={handleExit}
      onBlur={handleExit}
    />
  );
});

/* ========== 数字单元格编辑 ========== */
const InlineEditableNumberCell = React.memo(function InlineEditableNumberCell({
  value,
  onSave,
  style,
  min,
  step
}) {
  const [editing, setEditing] = useState(false);
  const [innerValue, setInnerValue] = useState(value);

  useEffect(() => {
    if (!editing) {
      setInnerValue(value);
    }
  }, [value, editing]);

  if (!editing) {
    return (
      <div
        style={{ cursor: "pointer", ...style }}
        onClick={() => setEditing(true)}
      >
        {value !== undefined && value !== null ? (
          value
        ) : (
          <span style={{ color: "#999" }}>点击编辑</span>
        )}
      </div>
    );
  }

  const handleExit = () => {
    setEditing(false);
    if (innerValue !== value) onSave(innerValue);
  };

  return (
    <InputNumber
      size="small"
      autoFocus
      style={{ width: "100%", ...style }}
      value={innerValue}
      min={min}
      step={step}
      onChange={(val) => setInnerValue(val)}
      onPressEnter={handleExit}
      onBlur={handleExit}
    />
  );
});

/* ========== 下拉单元格编辑 ========== */
const InlineEditableSelectCell = React.memo(function InlineEditableSelectCell({
  value,
  options,
  onSave
}) {
  const [editing, setEditing] = useState(false);
  const [innerValue, setInnerValue] = useState(value);

  useEffect(() => {
    if (!editing) {
      setInnerValue(value);
    }
  }, [value, editing]);

  if (!editing) {
    const label =
      options.find((o) => o.value === value)?.label || value || "点击选择";
    return (
      <div style={{ cursor: "pointer" }} onClick={() => setEditing(true)}>
        {label}
      </div>
    );
  }

  return (
    <Select
      size="small"
      autoFocus
      value={innerValue}
      options={options}
      style={{ width: "100%" }}
      onChange={(val) => {
        setInnerValue(val);
        setEditing(false);
        if (val !== value) onSave(val);
      }}
      onBlur={() => {
        setEditing(false);
      }}
    />
  );
});

/* ========== 日期单元格编辑 ========== */
const InlineEditableDateCell = React.memo(function InlineEditableDateCell({
  value,
  onSave
}) {
  const [editing, setEditing] = useState(false);
  const parsed = value ? dayjs(value) : null;

  if (!editing) {
    return (
      <div style={{ cursor: "pointer" }} onClick={() => setEditing(true)}>
        {value || <span style={{ color: "#999" }}>点击选择</span>}
      </div>
    );
  }

  return (
    <DatePicker
      size="small"
      autoFocus
      value={parsed}
      style={{ width: "100%" }}
      format="YYYY-MM-DD"
      onChange={(date) => {
        const formatted = date ? date.format("YYYY-MM-DD") : null;
        setEditing(false);
        if (formatted !== value) onSave(formatted);
      }}
      onBlur={() => {
        setEditing(false);
      }}
    />
  );
});

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
  onLoadExecutors
}) {
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

  // expandedRowRender 与 onExpand 用 useCallback 包一下，避免每次创建新函数
  const expandedRowRender = useCallback(
    (record) =>
      record.executors?.length > 0 ? (
        <div style={{ padding: 10 }}>
          <ExecutorTable
            executors={record.executors}
            onDeleteExecutor={(executorId) =>
              handleDeleteExecutor(record.id, executorId)
            }
            onUpdateExecutor={(executorId, field, value) =>
              handleUpdateExecutor(record.id, executorId, field, value)
            }
            onResetExpectedDI={(executorId) =>
              handleResetExpectedDI(record.id, executorId)
            }
          />
        </div>
      ) : (
        <div style={{ color: "#999" }}>当前项目暂无执行人</div>
      ),
    [handleDeleteExecutor, handleUpdateExecutor, handleResetExpectedDI]
  );

  const handleExpand = useCallback(
    (expanded, record) => {
      if (
        expanded &&
        (!record.executors || record.executors.length === 0)
      ) {
        if (typeof onLoadExecutors === "function") {
          onLoadExecutors(record.id);
        }
      }
    },
    [onLoadExecutors]
  );

  const columns = useMemo(
    () => [
      {
        title: (
          <div>
            <div id="addBtn"> </div>
          </div>
        ),
        dataIndex: "expand",
        key: "expand",
        width: 5,
        align: "center",
        onHeaderCell: () => ({
          style: { whiteSpace: "nowrap", padding: "4px 6px" }
        }),
        onCell: () => ({ style: { padding: "4px 6px" } })
      },
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
        render: (text, record) => (
          <InlineEditableSelectCell
            value={text}
            options={TEST_GROUP_OPTIONS}
            onSave={(val) => onTestGroupChange(record.id, val)}
          />
        )
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
        render: (text, record) => (
          <InlineEditableTextCell
            value={text}
            onSave={(val) => onEditProjectName(record.id, val)}
          />
        )
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
        render: (text, record) => (
          <InlineEditableSelectCell
            value={text}
            options={PROJECT_LEVEL_OPTIONS}
            onSave={(val) => onProjectLevelChange(record.id, val)}
          />
        )
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
        render: (text, record) => (
          <InlineEditableNumberCell
            value={text}
            style={{ color: "red" }}
            min={0}
            onSave={(val) => onExpectedIssuesChange(record.id, val)}
          />
        )
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
        render: (text, record) => (
          <InlineEditableNumberCell
            value={text}
            style={{ color: "red" }}
            min={0}
            step={0.01}
            onSave={(val) => onExpectedDIChange(record.id, val)}
          />
        )
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
        render: (text, record) => (
          <InlineEditableDateCell
            value={text}
            onSave={(val) => onStartDateChange(record.id, val)}
          />
        )
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
        render: (text, record) => (
          <InlineEditableSelectCell
            value={text}
            options={STATUS_OPTIONS}
            onSave={(val) => onStatusChange(record.id, val)}
          />
        )
      },
      {
        title: "操作",
        key: "action",
        width: 220,
        align: "center",
        onHeaderCell: () => ({
          style: { whiteSpace: "nowrap", padding: "4px 6px" }
        }),
        onCell: () => ({ style: { padding: "4px 6px" } }),
        render: (_, record) => (
          <>
            <Button
              size="small"
              onClick={() => onAddExecutor(record)}
              style={{ marginRight: 4 }}
            >
              新增执行人
            </Button>
            <Button
              size="small"
              onClick={() => onRefreshProject(record.id)}
              style={{ marginRight: 4 }}
            >
              刷新
            </Button>
            <Button
              size="small"
              danger
              onClick={() => onDeleteProject(record.id)}
            >
              删除
            </Button>
          </>
        )
      }
    ],
    [
      onTestGroupChange,
      onProjectLevelChange,
      onStatusChange,
      onStartDateChange,
      onExpectedIssuesChange,
      onExpectedDIChange,
      onEditProjectName,
      onAddExecutor,
      onRefreshProject,
      onDeleteProject
    ]
  );

  return (
    <Table
      rowKey="id"
      columns={columns}
      dataSource={projects}
      size="small" // 使用 antd 原生 small 模式，紧凑
      expandable={{
        rowExpandable: () => true,
        expandedRowRender: expandedRowRender,
        onExpand: handleExpand
      }}
      pagination={{
        pageSize: 15,
        pageSizeOptions: ["15", "25", "50", "100"],
        showSizeChanger: true
      }}
      scroll={{ y: "calc(100vh - 300px)" }}
    />
  );
}

export default React.memo(ProjectTable);
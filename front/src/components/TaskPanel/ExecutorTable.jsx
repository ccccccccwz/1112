// src/components/TaskPanel/ExecutorTable.jsx
import React, { useMemo, useState, useCallback } from "react";
import { Table, Input, InputNumber, Button, Tooltip } from "antd";

function ExecutorTableInner({
  executors,
  onDeleteExecutor,
  onUpdateExecutor,
  onResetExpectedDI
}) {
  // 编辑模式状态
  const [editingRowId, setEditingRowId] = useState(null);
  // 编辑中的临时数据
  const [editingData, setEditingData] = useState({});

  // 开始编辑
  const handleStartEdit = useCallback((record) => {
    setEditingRowId(record.ID);
    setEditingData({
      Days: record.Days,
      ExpectedIssues: record.ExpectedIssues,
      ExpectedDI: record.ExpectedDI,
      Level1Issues: record.Level1Issues,
      Level2Issues: record.Level2Issues,
      Level3Issues: record.Level3Issues,
      Level4Issues: record.Level4Issues
    });
  }, []);

  // 确认编辑
  const handleConfirmEdit = useCallback((record) => {
    const original = record;
    // 依次保存变更的字段
    if (editingData.Days !== original.Days) {
      onUpdateExecutor(record.ID, "Days", editingData.Days);
    }
    if (editingData.ExpectedIssues !== original.ExpectedIssues) {
      onUpdateExecutor(record.ID, "ExpectedIssues", editingData.ExpectedIssues);
    }
    if (editingData.ExpectedDI !== original.ExpectedDI) {
      onUpdateExecutor(record.ID, "ExpectedDI", editingData.ExpectedDI);
    }
    if (editingData.Level1Issues !== original.Level1Issues) {
      onUpdateExecutor(record.ID, "Level1Issues", editingData.Level1Issues);
    }
    if (editingData.Level2Issues !== original.Level2Issues) {
      onUpdateExecutor(record.ID, "Level2Issues", editingData.Level2Issues);
    }
    if (editingData.Level3Issues !== original.Level3Issues) {
      onUpdateExecutor(record.ID, "Level3Issues", editingData.Level3Issues);
    }
    if (editingData.Level4Issues !== original.Level4Issues) {
      onUpdateExecutor(record.ID, "Level4Issues", editingData.Level4Issues);
    }
    setEditingRowId(null);
    setEditingData({});
  }, [editingData, onUpdateExecutor]);

  // 取消编辑
  const handleCancelEdit = useCallback(() => {
    setEditingRowId(null);
    setEditingData({});
  }, []);

  // 更新编辑中的数据
  const updateEditingField = useCallback((field, value) => {
    setEditingData(prev => ({ ...prev, [field]: value }));
  }, []);

  const columns = useMemo(
    () => [
      {
        title: <Tooltip title="执行人">执行人</Tooltip>,
        dataIndex: "ExecutorName",
        key: "ExecutorName",
        width: 100,
        align: "center",
        onHeaderCell: () => ({ style: { whiteSpace: "nowrap", padding: "4px 6px" } }),
        onCell: () => ({ style: { padding: "4px 6px" } })
      },
      {
        title: <Tooltip title="ADCP15天 其余10天">投入天数</Tooltip>,
        dataIndex: "Days",
        key: "Days",
        width: 80,
        align: "center",
        onHeaderCell: () => ({ style: { whiteSpace: "nowrap", padding: "4px 6px" } }),
        onCell: () => ({ style: { padding: "4px 6px" } }),
        render: (text, record) => {
          const isEditing = editingRowId === record.ID;
          if (isEditing) {
            return (
              <InputNumber
                size="small"
                style={{ width: "100%" }}
                value={editingData.Days}
                min={0}
                onChange={(val) => updateEditingField("Days", val)}
              />
            );
          }
          return <span>{text}</span>;
        }
      },
      {
        title: <Tooltip title="上一季度日均问题单数 × 投入天数 ...">挑战问题数</Tooltip>,
        dataIndex: "ExpectedIssues",
        key: "ExpectedIssues",
        width: 100,
        align: "center",
        onHeaderCell: () => ({ style: { color: "red", whiteSpace: "nowrap", padding: "4px 6px" } }),
        onCell: () => ({ style: { padding: "4px 6px" } }),
        render: (text, record) => {
          const isEditing = editingRowId === record.ID;
          if (isEditing) {
            return (
              <InputNumber
                size="small"
                style={{ width: "100%", color: "red" }}
                value={editingData.ExpectedIssues}
                min={0}
                onChange={(val) => updateEditingField("ExpectedIssues", val)}
              />
            );
          }
          return <span style={{ color: "red" }}>{text}</span>;
        }
      },
      {
        title: <Tooltip title="上一季度日均DI × 投入天数 ...">挑战DI</Tooltip>,
        dataIndex: "ExpectedDI",
        key: "ExpectedDI",
        width: 100,
        align: "center",
        onHeaderCell: () => ({ style: { color: "red", whiteSpace: "nowrap", padding: "4px 6px" } }),
        onCell: () => ({ style: { padding: "4px 6px" } }),
        render: (text, record) => {
          const isEditing = editingRowId === record.ID;
          if (isEditing) {
            return (
              <InputNumber
                size="small"
                style={{ width: "100%", color: "red" }}
                value={editingData.ExpectedDI}
                min={0}
                step={0.01}
                onChange={(val) => updateEditingField("ExpectedDI", val)}
              />
            );
          }
          return <span style={{ color: "red" }}>{text}</span>;
        }
      },
      {
        title: <Tooltip title="问题数">问题数</Tooltip>,
        dataIndex: "ActualIssues",
        key: "ActualIssues",
        width: 80,
        align: "center",
        onHeaderCell: () => ({ style: { whiteSpace: "nowrap", padding: "4px 6px" } }),
        onCell: () => ({ style: { padding: "4px 6px" } })
      },
      {
        title: <Tooltip title="一级问题">一级问题</Tooltip>,
        dataIndex: "Level1Issues",
        key: "Level1Issues",
        width: 80,
        align: "center",
        onHeaderCell: () => ({ style: { whiteSpace: "nowrap", padding: "4px 6px" } }),
        onCell: () => ({ style: { padding: "4px 6px" } }),
        render: (text, record) => {
          const isEditing = editingRowId === record.ID;
          if (isEditing) {
            return (
              <InputNumber
                size="small"
                style={{ width: "100%" }}
                value={editingData.Level1Issues}
                min={0}
                onChange={(val) => updateEditingField("Level1Issues", val)}
              />
            );
          }
          return <span>{text}</span>;
        }
      },
      {
        title: <Tooltip title="二级问题">二级问题</Tooltip>,
        dataIndex: "Level2Issues",
        key: "Level2Issues",
        width: 80,
        align: "center",
        onHeaderCell: () => ({ style: { whiteSpace: "nowrap", padding: "4px 6px" } }),
        onCell: () => ({ style: { padding: "4px 6px" } }),
        render: (text, record) => {
          const isEditing = editingRowId === record.ID;
          if (isEditing) {
            return (
              <InputNumber
                size="small"
                style={{ width: "100%" }}
                value={editingData.Level2Issues}
                min={0}
                onChange={(val) => updateEditingField("Level2Issues", val)}
              />
            );
          }
          return <span>{text}</span>;
        }
      },
      {
        title: <Tooltip title="三级问题">三级问题</Tooltip>,
        dataIndex: "Level3Issues",
        key: "Level3Issues",
        width: 80,
        align: "center",
        onHeaderCell: () => ({ style: { whiteSpace: "nowrap", padding: "4px 6px" } }),
        onCell: () => ({ style: { padding: "4px 6px" } }),
        render: (text, record) => {
          const isEditing = editingRowId === record.ID;
          if (isEditing) {
            return (
              <InputNumber
                size="small"
                style={{ width: "100%" }}
                value={editingData.Level3Issues}
                min={0}
                onChange={(val) => updateEditingField("Level3Issues", val)}
              />
            );
          }
          return <span>{text}</span>;
        }
      },
      {
        title: <Tooltip title="四级问题">四级问题</Tooltip>,
        dataIndex: "Level4Issues",
        key: "Level4Issues",
        width: 80,
        align: "center",
        onHeaderCell: () => ({ style: { whiteSpace: "nowrap", padding: "4px 6px" } }),
        onCell: () => ({ style: { padding: "4px 6px" } }),
        render: (text, record) => {
          const isEditing = editingRowId === record.ID;
          if (isEditing) {
            return (
              <InputNumber
                size="small"
                style={{ width: "100%" }}
                value={editingData.Level4Issues}
                min={0}
                onChange={(val) => updateEditingField("Level4Issues", val)}
              />
            );
          }
          return <span>{text}</span>;
        }
      },
      {
        title: (
          <Tooltip title="计算公式：(一级问题数*10+二级问题数*3+三级问题数*1+四级问题数*0.5)*项目系数">
            DI值
          </Tooltip>
        ),
        dataIndex: "ActualDI",
        key: "ActualDI",
        width: 80,
        align: "center",
        onHeaderCell: () => ({ style: { whiteSpace: "nowrap", padding: "4px 6px" } }),
        onCell: () => ({ style: { padding: "4px 6px" } })
      },
      {
        title: <Tooltip title="根据人均预期问题数判断">问题达标</Tooltip>,
        dataIndex: "IsIssuesOnTarget",
        key: "IsIssuesOnTarget",
        width: 80,
        align: "center",
        onHeaderCell: () => ({ style: { whiteSpace: "nowrap", padding: "4px 6px" } }),
        onCell: () => ({ style: { padding: "4px 6px" } }),
        render: (text) => (
          <span style={{ color: text ? "green" : "red" }}>{text ? "是" : "否"}</span>
        )
      },
      {
        title: <Tooltip title="根据人均预期DI判断">DI值达标</Tooltip>,
        dataIndex: "IsDIOnTarget",
        key: "IsDIOnTarget",
        width: 80,
        align: "center",
        onHeaderCell: () => ({ style: { whiteSpace: "nowrap", padding: "4px 6px" } }),
        onCell: () => ({ style: { padding: "4px 6px" } }),
        render: (text) => (
          <span style={{ color: text ? "green" : "red" }}>{text ? "是" : "否"}</span>
        )
      },
      {
        title: <Tooltip title="项目问题总数 ≥ 挑战问题数即达标">挑战问题达标</Tooltip>,
        dataIndex: "IsTargetIssuesOnTarget",
        key: "IsTargetIssuesOnTarget",
        width: 100,
        align: "center",
        onHeaderCell: () => ({ style: { whiteSpace: "nowrap", padding: "4px 6px" } }),
        onCell: () => ({ style: { padding: "4px 6px" } }),
        render: (text) => (
          <span style={{ color: text ? "green" : "red" }}>{text ? "是" : "否"}</span>
        )
      },
      {
        title: <Tooltip title="项目DI ≥ 挑战DI即达标">挑战DI值达标</Tooltip>,
        dataIndex: "IsTargetDIOnTarget",
        key: "IsTargetDIOnTarget",
        width: 100,
        align: "center",
        onHeaderCell: () => ({ style: { whiteSpace: "nowrap", padding: "4px 6px" } }),
        onCell: () => ({ style: { padding: "4px 6px" } }),
        render: (text) => (
          <span style={{ color: text ? "green" : "red" }}>{text ? "是" : "否"}</span>
        )
      },
      {
        title: "操作",
        key: "action",
        width: 240,
        align: "center",
        onHeaderCell: () => ({ style: { whiteSpace: "nowrap", padding: "4px 6px" } }),
        onCell: () => ({ style: { padding: "4px 6px" } }),
        render: (_, record) => {
          const isEditing = editingRowId === record.ID;
          if (isEditing) {
            return (
              <>
                <Button
                  size="small"
                  type="primary"
                  onClick={() => handleConfirmEdit(record)}
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
                onClick={() => handleStartEdit(record)}
                style={{ marginRight: 4 }}
              >
                编辑
              </Button>
              <Button
                size="small"
                onClick={() => onResetExpectedDI(record.ID)}
                style={{ marginRight: 4 }}
              >
                同步基线
              </Button>
              <Button
                size="small"
                danger
                onClick={() => onDeleteExecutor(record.ID)}
              >
                删除
              </Button>
            </>
          );
        }
      }
    ],
    [editingRowId, editingData, updateEditingField, handleStartEdit, handleConfirmEdit, handleCancelEdit, onDeleteExecutor, onResetExpectedDI]
  );

  return (
    <Table
      rowKey="ID"
      columns={columns}
      dataSource={executors}
      pagination={false}
      size="small"
      bordered
    />
  );
}

const ExecutorTable = React.memo(ExecutorTableInner);

export default ExecutorTable;

// src/components/TaskPanel/ExecutorTable.jsx
import React, { useMemo } from "react";
import { Table, Input, Button, Tooltip } from "antd";

// 精简后的输入框，不再强行设置高度/行高，只控制全宽和无边框
const StyledInput = (props) => (
  <Input
    {...props}
    size="small"
    style={{
      width: "100%",
      border: "none",
      outline: "none",
      boxShadow: "none",
      textAlign: "center",
      borderRadius: 0,
      padding: 0,
      ...props.style
    }}
  />
);

function ExecutorTableInner({
  executors,
  onDeleteExecutor,
  onUpdateExecutor,
  onResetExpectedDI
}) {
  const columns = useMemo(
    () => [
      {
        title: <Tooltip title="执行人">执行人</Tooltip>,
        dataIndex: "ExecutorName",
        key: "ExecutorName",
        width: 100,
        align: "center",
        onHeaderCell: () => ({ style: { whiteSpace: "nowrap" } }),
        render: (text) => (
          <StyledInput value={text} readOnly />
        )
      },
      {
        title: <Tooltip title="ADCP15天 其余10天">投入天数</Tooltip>,
        dataIndex: "Days",
        key: "Days",
        width: 60,
        align: "center",
        onHeaderCell: () => ({ style: { whiteSpace: "nowrap" } }),
        render: (text, record) => (
          <StyledInput
            min={0}
            value={text}
            onChange={(e) =>
              onUpdateExecutor(record.ID, "Days", e.target.value)
            }
          />
        )
      },
      {
        title: <Tooltip title="上一季度日均问题单数 × 投入天数 ...">挑战问题数</Tooltip>,
        dataIndex: "ExpectedIssues",
        key: "ExpectedIssues",
        width: 80,
        align: "center",
        onHeaderCell: () => ({
          style: { color: "red", whiteSpace: "nowrap" }
        }),
        render: (text, record) => (
          <StyledInput
            min={0}
            style={{ color: "red" }}
            value={text}
            onChange={(e) =>
              onUpdateExecutor(record.ID, "ExpectedIssues", e.target.value)
            }
          />
        )
      },
      {
        title: <Tooltip title="上一季度日均DI × 投入天数 ...">挑战DI</Tooltip>,
        dataIndex: "ExpectedDI",
        key: "ExpectedDI",
        width: 80,
        align: "center",
        onHeaderCell: () => ({
          style: { color: "red", whiteSpace: "nowrap" }
        }),
        render: (text, record) => (
          <StyledInput
            step="0.01"
            min={0}
            style={{ color: "red" }}
            value={text}
            onChange={(e) =>
              onUpdateExecutor(record.ID, "ExpectedDI", e.target.value)
            }
          />
        )
      },
      {
        title: <Tooltip title="问题数">问题数</Tooltip>,
        dataIndex: "ActualIssues",
        key: "ActualIssues",
        width: 90,
        align: "center",
        render: (text) => (
          <StyledInput  value={text} readOnly />
        )
      },
      {
        title: <Tooltip title="一级问题">一级问题</Tooltip>,
        dataIndex: "Level1Issues",
        key: "Level1Issues",
        width: 90,
        align: "center",
        render: (text, record) => (
          <StyledInput
            min={0}
            value={text}
            onChange={(e) =>
              onUpdateExecutor(record.ID, "Level1Issues", e.target.value)
            }
          />
        )
      },
      {
        title: <Tooltip title="二级问题">二级问题</Tooltip>,
        dataIndex: "Level2Issues",
        key: "Level2Issues",
        width: 90,
        align: "center",
        render: (text, record) => (
          <StyledInput
            min={0}
            value={text}
            onChange={(e) =>
              onUpdateExecutor(record.ID, "Level2Issues", e.target.value)
            }
          />
        )
      },
      {
        title: <Tooltip title="三级问题">三级问题</Tooltip>,
        dataIndex: "Level3Issues",
        key: "Level3Issues",
        width: 90,
        align: "center",
        render: (text, record) => (
          <StyledInput
            min={0}
            value={text}
            onChange={(e) =>
              onUpdateExecutor(record.ID, "Level3Issues", e.target.value)
            }
          />
        )
      },
      {
        title: <Tooltip title="四级问题">四级问题</Tooltip>,
        dataIndex: "Level4Issues",
        key: "Level4Issues",
        width: 90,
        align: "center",
        render: (text, record) => (
          <StyledInput
            min={0}
            value={text}
            onChange={(e) =>
              onUpdateExecutor(record.ID, "Level4Issues", e.target.value)
            }
          />
        )
      },
      {
        title: (
          <Tooltip title="计算公式：(一级问题数*10+二级问题数*3+三级问题数*1+四级问题数*0.5)*项目系数">
            DI值
          </Tooltip>
        ),
        dataIndex: "ActualDI",
        key: "ActualDI",
        width: 100,
        align: "center",
        render: (text) => (
          <StyledInput value={text} readOnly />
        )
      },
      {
        title: <Tooltip title="根据人均预期问题数判断">问题达标</Tooltip>,
        dataIndex: "IsIssuesOnTarget",
        key: "IsIssuesOnTarget",
        width: 100,
        align: "center",
        render: (text) => (
          <StyledInput
            value={text ? "是" : "否"}
            readOnly
            style={{ color: text ? "green" : "red" }}
          />
        )
      },
      {
        title: <Tooltip title="根据人均预期DI判断">DI值达标</Tooltip>,
        dataIndex: "IsDIOnTarget",
        key: "IsDIOnTarget",
        width: 100,
        align: "center",
        render: (text) => (
          <StyledInput
            value={text ? "是" : "否"}
            readOnly
            style={{ color: text ? "green" : "red" }}
          />
        )
      },
      {
        title: <Tooltip title="项目问题总数 ≥ 挑战问题数即达标">挑战问题达标</Tooltip>,
        dataIndex: "IsTargetIssuesOnTarget",
        key: "IsTargetIssuesOnTarget",
        width: 110,
        align: "center",
        render: (text) => (
          <StyledInput
            value={text ? "是" : "否"}
            readOnly
            style={{ color: text ? "green" : "red" }}
          />
        )
      },
      {
        title: <Tooltip title="项目DI ≥ 挑战DI即达标">挑战DI值达标</Tooltip>,
        dataIndex: "IsTargetDIOnTarget",
        key: "IsTargetDIOnTarget",
        width: 110,
        align: "center",
        render: (text) => (
          <StyledInput
            value={text ? "是" : "否"}
            readOnly
            style={{ color: text ? "green" : "red" }}
          />
        )
      },
      {
        title: "操作",
        key: "action",
        width: 200,
        align: "center",
        render: (_, record) => (
          <>
            <Button
              size="small"
              onClick={() => onResetExpectedDI(record.ID)}
              style={{ margin: "0 4px 0 0" }}
            >
              同步基线挑战数据
            </Button>
            <Button
              size="small"
              danger
              onClick={() => onDeleteExecutor(record.ID)}
              style={{ margin: 0 }}
            >
              删除
            </Button>
          </>
        )
      }
    ],
    [onDeleteExecutor, onUpdateExecutor, onResetExpectedDI]
  );

  // 使用 antd 的 components 来统一缩小行高、单元格 padding
  const components = {
    body: {
      row: (props) => (
        <tr
          {...props}
          style={{
            ...props.style,
            height: 28 // 行高整体变紧凑
          }}
        />
      ),
      cell: (props) => (
        <td
          {...props}
          style={{
            ...props.style,
            padding: "4px 6px" // 缩小单元格上下左右间距
          }}
        />
      )
    }
  };

  return (
    <Table
      rowKey="ID"
      columns={columns}
      dataSource={executors}
      pagination={false}
      bordered
//       size="small"
//       scroll={{ x: 'max-content' }}
//       components={components}
//       style={{ width: '100%' }}
    />
  );
}

const ExecutorTable = React.memo(ExecutorTableInner);

export default ExecutorTable;
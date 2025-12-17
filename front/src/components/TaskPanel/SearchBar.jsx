// src/components/TaskPanel/SearchBar.jsx
import React, { useEffect, useState } from "react";
import { Select, Input, Button, Space } from "antd";

// 下拉选项配置
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

// 筛选默认值，可以和父组件共享
export const DEFAULT_FILTERS = {
  testGroup: undefined,
  projectLevel: undefined,
  status: undefined,
  projectName: ""
};

export default function SearchBar({
  filters,
  onFiltersChange,
  onSearch,
  onReset,
  onRefreshAll,
  onAddProject
}) {
  // 本地编辑中的筛选条件
  const [localFilters, setLocalFilters] = useState({
    ...DEFAULT_FILTERS,
    ...filters
  });

  // 当父组件 filters 变化（比如外部重置）时，同步到本地
  useEffect(() => {
    setLocalFilters((prev) => ({
      ...prev,
      ...filters
    }));
  }, [filters]);

  const { testGroup, projectLevel, status, projectName } = localFilters;

  // 输入/选择时，只更新本地，不触发父组件重渲染
  const handleLocalChange = (field, value) => {
    setLocalFilters((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  // 点击“搜索”：才同步给父组件并触发搜索
  const handleSearch = () => {
    onFiltersChange(localFilters);
    onSearch(localFilters);
  };

  // 点击“重置”：重置本地 + 父组件 + 重新搜索
  const handleReset = () => {
    setLocalFilters(DEFAULT_FILTERS);
    onFiltersChange(DEFAULT_FILTERS);
    if (onReset) {
      onReset(DEFAULT_FILTERS);
    }
  };

  return (
    <Space wrap style={{ marginBottom: 20 }}>
      <Button type="primary" onClick={onAddProject}>
        新建项目
      </Button>

      <Select
        placeholder="选择测试组"
        allowClear
        style={{ width: 150 }}
        value={testGroup}
        onChange={(val) => handleLocalChange("testGroup", val)}
      >
        {TEST_GROUP_OPTIONS.map((opt) => (
          <Select.Option key={opt.value} value={opt.value}>
            {opt.label}
          </Select.Option>
        ))}
      </Select>

      <Select
        placeholder="选择项目级别"
        allowClear
        style={{ width: 150 }}
        value={projectLevel}
        onChange={(val) => handleLocalChange("projectLevel", val)}
      >
        {PROJECT_LEVEL_OPTIONS.map((opt) => (
          <Select.Option key={opt.value} value={opt.value}>
            {opt.label}
          </Select.Option>
        ))}
      </Select>

      <Select
        placeholder="选择项目状态"
        allowClear
        style={{ width: 150 }}
        value={status}
        onChange={(val) => handleLocalChange("status", val)}
      >
        {STATUS_OPTIONS.map((opt) => (
          <Select.Option key={opt.value} value={opt.value}>
            {opt.label}
          </Select.Option>
        ))}
      </Select>

      <Input
        placeholder="请输入项目名"
        style={{ width: 200 }}
        value={projectName}
        onChange={(e) => handleLocalChange("projectName", e.target.value)}
      />

      <Button type="primary" onClick={handleSearch}>
        搜索
      </Button>
      <Button onClick={handleReset}>重置</Button>
      <Button onClick={onRefreshAll}>刷新所有项目</Button>
    </Space>
  );
}
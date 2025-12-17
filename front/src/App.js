// src/App.jsx
import React, { useState } from 'react';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  BarChartOutlined,
  LineChartOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import { Button, Layout, Menu, theme, ConfigProvider } from 'antd';
import zhCN from 'antd/es/locale/zh_CN';

import TaskPanel from "./components/TaskPanel/TaskPanel";
import ChartPanel from './components/ChartPanel';

import HelpModal from './components/HelpModal';
import DateFilter from './components/DateFilter';
import './styles/app.css';

const { Header, Sider, Content } = Layout;

// ✅ 获取本季度开始/结束日期（yyyy-MM-dd）
const getQuarterRange = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth(); // 0-11

  let startMonth;
  if (month <= 2) startMonth = 0;      // Q1
  else if (month <= 5) startMonth = 3; // Q2
  else if (month <= 8) startMonth = 6; // Q3
  else startMonth = 9;                 // Q4

  const startDate = new Date(year, startMonth, 1);
  const endDate = new Date(year, startMonth + 3, 0);

  const fmt = (d) => d.toISOString().slice(0, 10); // yyyy-MM-dd
  return { start: fmt(startDate), end: fmt(endDate) };
};

export default function App() {
  const [collapsed, setCollapsed] = useState(false);
  const [activeFeature, setActiveFeature] = useState('chart');

  // ✅ 日期状态：默认使用本季度起止
  const { start: defaultStart, end: defaultEnd } = getQuarterRange();
  const [start, setStart] = useState(defaultStart);
  const [end,   setEnd]   = useState(defaultEnd);

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // 菜单点击切换功能
  const handleMenuClick = ({ key }) => {
    setActiveFeature(key);
  };

  // ✅ 渲染内容：在图表面板模式下，顶部是 DateFilter，下面是 ChartPanel
  const renderContent = () => {
    switch (activeFeature) {
      case 'chart':
        return (
          <div className="d-flex flex-column h-100">
            {/* 日期筛选区域 */}
            <div className="mb-3 d-flex justify-content-start">
              <DateFilter
                defaultStart={defaultStart}
                defaultEnd={defaultEnd}
                onFilter={(s, e) => {
                  // 点击“筛选”时更新图表查询区间
                  setStart(s);
                  setEnd(e);
                }}
                onClear={() => {
                  // 点击“重置”时恢复成本季度默认区间
                  setStart(defaultStart);
                  setEnd(defaultEnd);
                }}
              />
            </div>

            {/* 图表面板：接受 start/end，内部 useEffect 里会用它们请求接口 */}
            <div className="flex-grow-1">
              <ChartPanel start={start} end={end} />
            </div>
          </div>
        );

      case 'task':
        return <TaskPanel />;

      case 'daily':
        return <div style={{ padding: 16 }}>日均统计功能开发中...</div>;

      default:
        return null;
    }
  };

  return (
    <ConfigProvider
      locale={{
        ...zhCN,
        Pagination: {
          ...zhCN.Pagination,
          items_per_page: '条/页' // 中文分页显示
        }
      }}
    >
      <Layout style={{ minHeight: '100vh' }}>

        {/* 侧边栏菜单 */}
        <Sider trigger={null} collapsible collapsed={collapsed}>
          <div
            style={{
              height: 64,
              margin: 16,
              color: '#fff',
              fontSize: 18,
              textAlign: 'center'
            }}
          >
            {collapsed ? '绩效' : '绩效管理'}
          </div>
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[activeFeature]}
            onClick={handleMenuClick}
            items={[
              { key: 'chart', icon: <BarChartOutlined />, label: '图表面板' },
              { key: 'task', icon: <UserOutlined />, label: '任务面板' },
              { key: 'daily', icon: <LineChartOutlined />, label: '日均统计' }
            ]}
          />
        </Sider>

        {/* 主布局 */}
        <Layout>

          {/* 顶部栏 */}
          <Header
            style={{
              padding: 0,
              background: colorBgContainer,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{
                fontSize: '16px',
                width: 64,
                height: 64
              }}
            />
            {/* 右侧帮助按钮 */}
            <Button
              type="text"
              icon={<QuestionCircleOutlined />}
              onClick={() => {
                // 打开帮助弹窗
                const modal = document.querySelector('#global-help');
                if (modal) modal.click();
              }}
            >
              帮助
            </Button>
          </Header>

          {/* 内容部分 */}
          <Content
            style={{
              margin: '24px 16px',
              padding: 24,
              minHeight: 280,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            {renderContent()}
          </Content>

          {/* 全局帮助弹窗 */}
          <HelpModal />
        </Layout>

      </Layout>
    </ConfigProvider>
  );
}
// src/components/CalcRulePage.jsx
import React from 'react';
import { Card, Typography, Divider, Space } from 'antd';
import { CalculatorOutlined, TrophyOutlined, RiseOutlined, StarOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

export default function CalcRulePage() {
  return (
    <div style={{
      padding: '24px',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      {/* 页面标题 */}
      <Card
        bordered={false}
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          marginBottom: '24px',
          borderRadius: '12px'
        }}
      >
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <CalculatorOutlined style={{ fontSize: 48, color: '#fff', marginBottom: 16 }} />
          <Title level={2} style={{ color: '#fff', margin: 0 }}>
            个人DI值计算说明
          </Title>
        </div>
      </Card>

      {/* 核心公式卡片 */}
      <Card
        bordered={false}
        style={{
          marginBottom: '24px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
        }}
      >
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Title level={4} style={{ marginBottom: 16 }}>
            <StarOutlined style={{ color: '#faad14', marginRight: 8 }} />
            核心计算公式
          </Title>
          <div style={{
            background: '#fff',
            padding: '20px',
            borderRadius: '8px',
            fontSize: '18px',
            fontWeight: 600,
            color: '#1890ff',
            border: '2px dashed #1890ff'
          }}>
            基础DI × 达标系数 × 奖励系数 × 项目因子
          </div>
        </div>
      </Card>

      {/* 详细说明卡片组 */}
      <Space direction="vertical" size="large" style={{ width: '100%' }}>

        {/* 1. 基础DI值计算 */}
        <Card
          title={
            <span>
              <CalculatorOutlined style={{ marginRight: 8, color: '#1890ff' }} />
              <Text strong>1. 基础DI值计算</Text>
            </span>
          }
          bordered={false}
          style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
        >
          <div style={{
            background: '#f0f5ff',
            padding: '16px',
            borderRadius: '8px',
            border: '1px solid #adc6ff'
          }}>
            <Text code style={{ fontSize: '16px' }}>
              (一级问题数×10 + 二级问题数×3 + 三级问题数×1 + 四级问题数×0.5) × 项目系数
            </Text>
          </div>
        </Card>

        {/* 2. 达标系数 */}
        <Card
          title={
            <span>
              <TrophyOutlined style={{ marginRight: 8, color: '#52c41a' }} />
              <Text strong>2. 达标系数</Text>
            </span>
          }
          bordered={false}
          style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
        >
          <Paragraph style={{ marginBottom: 8 }}>
            如果个人实际DI值 &lt; (项目预期DI均值 × 投入天数 / 项目总天数)，则不达标
          </Paragraph>
          <div style={{
            background: '#fff1f0',
            padding: '12px',
            borderRadius: '6px',
            border: '1px solid #ffccc7'
          }}>
            <Text strong style={{ color: '#cf1322' }}>
              不达标时：个人实际DI值 × 0.9
            </Text>
          </div>
        </Card>

        {/* 3. 奖励系数 */}
        <Card
          title={
            <span>
              <RiseOutlined style={{ marginRight: 8, color: '#faad14' }} />
              <Text strong>3. 奖励系数（上限1.2）</Text>
            </span>
          }
          bordered={false}
          style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
        >
          <Paragraph style={{ marginBottom: 8 }}>
            奖励系数 = 个人实际DI / 挑战DI
          </Paragraph>
          <div style={{
            background: '#fffbe6',
            padding: '12px',
            borderRadius: '6px',
            border: '1px solid #ffe58f'
          }}>
            <Text strong style={{ color: '#d46b08' }}>
              如果个人实际DI值 &gt; 挑战DI，个人DI × 奖励系数
            </Text>
          </div>
        </Card>

        {/* 4. 项目因子 */}
        <Card
          title={
            <span>
              <StarOutlined style={{ marginRight: 8, color: '#722ed1' }} />
              <Text strong>4. 项目因子</Text>
            </span>
          }
          bordered={false}
          style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
        >
          <div style={{ marginBottom: 16 }}>
            <Text strong>计算公式：</Text>
            <div style={{
              background: '#f9f0ff',
              padding: '12px',
              borderRadius: '6px',
              border: '1px solid #d3adf7',
              marginTop: 8
            }}>
              <Text code style={{ fontSize: '16px' }}>DI总和 / 项目预期DI</Text>
            </div>
          </div>

          <Divider style={{ margin: '16px 0' }} />

          <div>
            <Text strong style={{ marginBottom: 12, display: 'block' }}>
              区分重点项目与普通项目：
            </Text>

            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <div style={{
                background: '#e6f7ff',
                padding: '12px',
                borderRadius: '6px',
                border: '1px solid #91d5ff'
              }}>
                <Text strong style={{ color: '#0050b3' }}>• 重点项目</Text>
                <Paragraph style={{ marginBottom: 0, marginTop: 8, paddingLeft: 16 }}>
                  固定乘项目因子，即项目总DI达标获得加成，总DI不达标需要减益
                </Paragraph>
              </div>

              <div style={{
                background: '#f6ffed',
                padding: '12px',
                borderRadius: '6px',
                border: '1px solid #b7eb8f'
              }}>
                <Text strong style={{ color: '#389e0d' }}>• 普通项目</Text>
                <Paragraph style={{ marginBottom: 0, marginTop: 8, paddingLeft: 16 }}>
                  不达标时才乘项目因子，只有不达标会获得减益，达标该值固定为1，不会获得加成
                </Paragraph>
              </div>
            </Space>
          </div>
        </Card>

        {/* 补充说明 */}
        <Card
          bordered={false}
          style={{
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'
          }}
        >
          <div style={{ padding: '12px' }}>
            <Title level={5} style={{ marginBottom: 12 }}>
              <StarOutlined style={{ marginRight: 8 }} />
              另注：
            </Title>
            <Text strong style={{ fontSize: '16px' }}>
              挑战DI = 上一年度员工基线日均DI × 投入天数
            </Text>
          </div>
        </Card>

      </Space>
    </div>
  );
}

// src/components/Top5List.jsx
import React from 'react';

export default function Top5List({ labels = [], values = [] }) {
  const length = Math.min(labels.length, values.length);

  const data = [];
  for (let i = 0; i < length; i++) {
    const numValue = Number(values[i]);
    if (Number.isNaN(numValue)) continue;
    data.push({
      label: labels[i],
      value: numValue,
    });
  }

  if (data.length === 0) return null;

  // 从大到小排序，取前 5
  data.sort((a, b) => b.value - a.value);
  const top5 = data.slice(0, 5);

  const containerStyle = {
    position: 'absolute',
    marginTop: '180px',
    top: '-50px',
    right: '30px',
    width: '200px',
    padding: '15px',
    backgroundColor: '#ffffff',
    borderRadius: '10px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    zIndex: 10,
  };

  const titleStyle = {
    fontSize: '18px',
    margin: '0 0 10px 0',
    color: '#000',
  };

  const listStyle = {
    listStyleType: 'none',
    padding: 0,
    margin: 0,
  };

  const itemStyle = {
    margin: '5px 0',
    padding: '6px 8px',
    fontSize: '14px',
    backgroundColor: '#f9f9f9',
    borderRadius: '5px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  };

  // 左侧：序号 + 名字
  const leftPartStyle = {
    display: 'flex',
    alignItems: 'center',
    maxWidth: '130px', // 足够放 6 个字
  };

  // 圆形数字序号 1–5（这里是数字，不是星星）
  const rankBadgeStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    backgroundColor: '#ffa600',
    color: '#fff',
    fontSize: '12px',
    marginRight: '6px',
    flexShrink: 0,
  };

  const labelTextStyle = {
    whiteSpace: 'nowrap', // 6 个字全部展示
  };

  const valueStyle = {
    fontWeight: 'bold',
    marginLeft: '8px',
    flexShrink: 0,
  };

  return (
    <div id="top5" style={containerStyle}>
      <h2 style={titleStyle}>Top 5</h2>
      <ul style={listStyle}>
        {top5.map((item, idx) => (
          <li key={item.label + idx} style={itemStyle}>
            <div style={leftPartStyle}>
              {/* 只显示数字 1–5 */}
              <span style={rankBadgeStyle}>{idx + 1}</span>
              <span style={labelTextStyle}>{item.label}</span>
            </div>
            <span style={valueStyle}>{item.value.toFixed(2)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
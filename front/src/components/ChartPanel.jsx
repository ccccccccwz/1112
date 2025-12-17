// src/components/ChartPanel.jsx
import React, { useEffect, useState, useRef } from 'react';
import Plotly from 'plotly.js-dist';
import Top5List from './Top5List';

// 模块级别缓存对象（跨渲染保存）
const statisticsCache = {}; // key: `${start}_${end}` => { labels, values }

export default function ChartPanel({ start, end }) {
  const [labels, setLabels] = useState([]);
  const [values, setValues] = useState([]); // 存储为 number[]
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  // 区分是网络请求还是缓存命中导致的 loading
  const [isCacheRefresh, setIsCacheRefresh] = useState(false);

  const pieRef = useRef(null);
  const barRef = useRef(null);

  // 清理 Plotly 资源
  useEffect(() => {
    return () => {
      if (pieRef.current) {
        Plotly.purge(pieRef.current);
      }
      if (barRef.current) {
        Plotly.purge(barRef.current);
      }
    };
  }, []);

  // 1）数据请求 & 缓存逻辑
  useEffect(() => {
    const queryStart = start ?? '';
    const queryEnd = end ?? '';
    const cacheKey = `${queryStart}_${queryEnd}`;

    // 每次新查询前，重置错误和数据，显示 loading
    setError('');
    setLabels([]);
    setValues([]);

    const cached = statisticsCache[cacheKey];

    if (cached) {
      // 命中缓存：用短暂的“刷新”动画
      setIsCacheRefresh(true);
      setLoading(true);

      // 先立即更新数据
      setLabels(cached.labels);
      setValues(cached.values);

      // 300ms 后结束 loading（可以按需要调整时间）
      const timer = setTimeout(() => {
        setLoading(false);
        setIsCacheRefresh(false);
      }, 300);

      return () => clearTimeout(timer);
    }

    // 未命中缓存：走真实接口请求
    setIsCacheRefresh(false);
    setLoading(true);

    fetch(
      `/api/statistics?start=${encodeURIComponent(
        queryStart,
      )}&end=${encodeURIComponent(queryEnd)}`,
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
          setLabels([]);
          setValues([]);
          return;
        }
        if (!data.labels || data.labels.length === 0) {
          setError('没有符合条件的数据');
          setLabels([]);
          setValues([]);
          return;
        }

        const numericValues = data.values.map((v) => Number(v));

        // 存入缓存
        statisticsCache[cacheKey] = {
          labels: data.labels,
          values: numericValues,
        };

        setLabels(data.labels);
        setValues(numericValues);
        setError('');
      })
      .catch((err) => {
        setError('获取数据失败: ' + err.message);
        setLabels([]);
        setValues([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [start, end]);

  // 2）绘图逻辑：只依赖 labels / values
  useEffect(() => {
    if (!labels.length || !values.length) {
      if (pieRef.current) Plotly.purge(pieRef.current);
      if (barRef.current) Plotly.purge(barRef.current);
      return;
    }

    const config = { responsive: true, displayModeBar: false };

    const pieData = [
      {
        values: values,
        labels: labels,
        type: 'pie',
        textinfo: 'label+percent',
        textposition: 'inside',
        textfont: { color: '#000', size: 14 },
        marker: {
          colors: ['#ff6361', '#bc5090', '#ffa600', '#58508d', '#003f5c'],
          line: { color: '#fff', width: 2 },
        },
        hole: 0.4,
      },
    ];

    const pieLayout = {
      title: { text: '绩效比例', font: { size: 20, color: '#000' } },
      paper_bgcolor: '#fff',
      plot_bgcolor: '#fff',
      font: { color: '#000' },
      showlegend: false,
      margin: { l: 50, r: 50, b: 50, t: 50 },
    };

    const barData = [
      {
        x: labels,
        y: values,
        type: 'bar',
        marker: { color: '#ffa600' },
        text: values.map((v) => v.toFixed(2)),
        textposition: 'auto',
        hovertext: labels.map(
          (name, idx) => `${name}: ${values[idx].toFixed(2)} 分`,
        ),
        hoverinfo: 'text',
      },
    ];

    const barLayout = {
      title: { text: '绩效排名', font: { size: 20, color: '#000' } },
      paper_bgcolor: '#fff',
      plot_bgcolor: '#fff',
      font: { color: '#000' },
      xaxis: { tickangle: -45, automargin: true },
      yaxis: { title: { text: '绩效', font: { color: '#000' } } },
      margin: { l: 50, r: 50, b: 100, t: 50 },
    };

    if (pieRef.current) {
      Plotly.react(pieRef.current, pieData, pieLayout, config);
    }
    if (barRef.current) {
      Plotly.react(barRef.current, barData, barLayout, config);
    }
  }, [labels, values]);

  return (
    <div className="d-flex flex-column flex-grow-1 h-100 p-3">
      {/* 顶部错误提示 */}
      {error && (
        <div className="alert alert-warning text-center mb-2">
          {error}
        </div>
      )}

      <div className="d-flex flex-grow-1 h-100 position-relative">
        {/* loading 遮罩（网络请求 + 缓存刷新都用，但文案不同） */}
        {loading && (
          <div
            className="position-absolute w-100 h-100 d-flex align-items-center justify-content-center"
            style={{
              backdropFilter: 'blur(3px)',
              WebkitBackdropFilter: 'blur(3px)',
              background: 'rgba(0,0,0,0.15)',
              zIndex: 1,
              transition: 'opacity 0.25s ease',
            }}
          >
            <div
              style={{
                padding: '20px 32px',
                borderRadius: 16,
                background: 'rgba(255,255,255,0.9)',
                boxShadow: '0 12px 30px rgba(0,0,0,0.1)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                minWidth: 220,
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  border: '4px solid #e5e7eb',
                  borderTopColor: '#1890ff',
                  animation: 'h3c-spin 0.9s linear infinite',
                  marginBottom: 12,
                }}
              />
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 500,
                  color: '#111827',
                  marginBottom: 4,
                }}
              >
                {isCacheRefresh ? '正在刷新视图…' : '正在加载统计数据…'}
              </div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>
                {isCacheRefresh
                  ? '已命中缓存，快速为您更新展示'
                  : '请稍候，正在计算绩效统计结果'}
              </div>
            </div>

            <style>
              {`
                @keyframes h3c-spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}
            </style>
          </div>
        )}

        {/* 图表区 */}
        <div ref={pieRef} className="flex-fill h-100" />
        <div ref={barRef} className="flex-fill h-100" />
      </div>

      {/* Top5 列表 */}
      {labels.length > 0 && values.length > 0 && (
        <div className="mt-3">
          <Top5List labels={labels} values={values} />
        </div>
      )}
    </div>
  );
}
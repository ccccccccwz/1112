// src/pages/StatisticsPage.jsx
import React, { useState } from 'react';
import DateFilter from '../components/DateFilter';
import ChartPanel from '../components/ChartPanel';

export default function StatisticsPage() {
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');

  const handleFilter = (s, e) => {
    setStart(s);
    setEnd(e);
  };

  const handleClear = () => {
    setStart('');
    setEnd('');
  };

  return (
    <div className="container-fluid vh-100 d-flex flex-column">
      <h2 className="text-center mt-3">绩效管理</h2>
      <DateFilter onFilter={handleFilter} onClear={handleClear} />
      <div className="flex-grow-1">
        <ChartPanel start={start} end={end} />
      </div>
    </div>
  );
}
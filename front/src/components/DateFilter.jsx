import React, { useEffect, useState } from 'react';

export default function DateFilter({
  onFilter = () => {},
  onClear = () => {},
  defaultStart = '',
  defaultEnd = ''
}) {
  const [startTime, setStartTime] = useState(defaultStart);
  const [endTime, setEndTime] = useState(defaultEnd);
  const [errorMsg, setErrorMsg] = useState('');

  // ✅ 当父组件传入的默认值改变时，同步到内部输入框
  useEffect(() => {
    setStartTime(defaultStart);
    setEndTime(defaultEnd);
  }, [defaultStart, defaultEnd]);

  const validateDateRange = () => {
    setErrorMsg('');
    if (!startTime || !endTime) {
      setErrorMsg('❌ 开始时间和结束时间不能为空！');
      return false;
    }
    const startDate = new Date(startTime);
    const endDate = new Date(endTime);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    if (startDate > today) {
      setErrorMsg('❌ 开始时间不能选择未来日期！');
      return false;
    }
    if (startDate > endDate) {
      setErrorMsg('❌ 开始时间不能晚于结束时间！');
      return false;
    }
    return true;
  };

  const handleFilter = (e) => {
    e.preventDefault();
    if (validateDateRange()) {
      // ✅ 把当前输入的值回调给父组件，父组件更新 start/end
      onFilter(startTime, endTime);
    }
  };

  const clearFilters = () => {
    // ✅ 恢复为父组件当前给的默认值
    setStartTime(defaultStart);
    setEndTime(defaultEnd);
    setErrorMsg('');
    onClear();  // 通知父组件使用默认区间
  };

  return (
    <form
      className="d-flex flex-nowrap align-items-center gap-2 ms-2"
      onSubmit={handleFilter}
    >
      <label className="me-1">开始时间</label>
      <input
        type="date"
        className="form-control me-2"
        style={{ width: '160px' }}
        value={startTime}
        onChange={(e) => setStartTime(e.target.value)}
      />
      <label className="ms-2 me-1">结束时间</label>
      <input
        type="date"
        className="form-control me-2"
        style={{ width: '160px' }}
        value={endTime}
        onChange={(e) => setEndTime(e.target.value)}
      />
      <button className="btn btn-success ms-2" type="submit">
        筛选
      </button>
      <button
        className="btn btn-secondary ms-2"
        type="button"
        onClick={clearFilters}
      >
        <i className="bi bi-arrow-repeat"></i> 重置
      </button>
      {errorMsg && (
        <div className="text-danger ms-2">
          {errorMsg}
        </div>
      )}
    </form>
  );
}
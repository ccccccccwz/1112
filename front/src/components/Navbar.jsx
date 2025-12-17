import React from 'react';
import DateFilter from './DateFilter';

export default function Navbar({
  activeFeature,
  setActiveFeature,
  onFilter,
  onClear,
  defaultStart,
  defaultEnd
}) {
  const handleFeatureChange = (feature) => {
    setActiveFeature(feature);
  };

  return (
    <div className="d-flex justify-content-between align-items-center border-bottom p-2">
      <div className="d-flex align-items-center gap-2">
        <button
          className="btn btn-primary"
          onClick={() => handleFeatureChange('feature1')}
        >
          项目绩效管理
        </button>

        {activeFeature === 'feature2' && (
          <>
            <DateFilter
              onFilter={onFilter}
              onClear={onClear}
              defaultStart={defaultStart}
              defaultEnd={defaultEnd}
            />
            <button
              className="btn btn-info"
              data-bs-toggle="modal"
              data-bs-target="#helpModal"
            >
              <i className="bi bi-question-circle"></i> DI计算规则
            </button>
          </>
        )}

        {activeFeature !== 'feature2' && (
          <button
            className="btn btn-primary"
            onClick={() => handleFeatureChange('feature2')}
          >
            返回首页
          </button>
        )}
      </div>

      {activeFeature !== 'feature3' && (
        <button
          className="btn btn-primary"
          onClick={() => handleFeatureChange('feature3')}
        >
          日均统计
        </button>
      )}
    </div>
  );
}
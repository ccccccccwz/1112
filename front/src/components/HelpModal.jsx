// src/components/HelpModal.jsx
import React from 'react';

export default function HelpModal() {
  return (
    <div
      className="modal fade"
      id="helpModal"
      tabIndex="-1"
      aria-labelledby="helpModalLabel"
      aria-hidden="true"
      data-bs-backdrop="static"
    >
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          {/* 模态框头部 */}
          <div className="modal-header">
            <h5 className="modal-title" id="helpModalLabel">个人DI值计算说明</h5>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>

          {/* 模态框主体 */}
          <div className="modal-body">
            <h6>计算公式：基础DI × 达标系数 × 奖励系数 × 项目因子</h6>

            <ol className="mt-3">
              <li className="mb-2">
                <strong>基础DI值计算</strong><br />
                (一级问题数×10 + 二级问题数×3 + 三级问题数×1 + 四级问题数×0.5) × 项目系数
              </li>
              <li className="mb-2">
                <strong>达标系数</strong><br />
                如果个人实际DI值 &lt; (项目预期DI均值 × 投入天数 / 项目总天数），则不达标，个人实际DI值 × 0.9
              </li>
              <li className="mb-2">
                <strong>奖励系数（上限1.2）</strong><br />
                个人实际DI / 挑战DI，如果个人实际DI值 &gt; 挑战DI，个人DI × 奖励系数
              </li>
              <li>
                <strong>项目因子</strong><br />
                计算公式：DI总和 / 项目预期DI<br />
                区分重点项目与普通项目：
                <ul>
                  <li>重点项目固定乘项目因子，即项目总DI达标获得加成，总DI不达标需要减益</li>
                  <li>普通项目不达标时才乘项目因子，只有不达标会获得减益，达标该值固定为1，不会获得加成</li>
                </ul>
              </li>
            </ol>

            <div className="mt-4">
              <strong>另注：</strong>
              <p>挑战DI：上一年度员工基线日均DI × 投入天数</p>
            </div>
          </div>

          {/* 模态框底部 */}
          <div className="modal-footer">
            <button type="button" className="btn btn-primary" data-bs-dismiss="modal">
              关闭
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
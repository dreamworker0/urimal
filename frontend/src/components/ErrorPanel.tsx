import { useEffect, useRef } from 'react';
import type { ErrorItem } from '../types';
import './ErrorPanel.css';

interface Props {
  errors: ErrorItem[];
  rewritten: string;
  activeId: number | null;
  onSelect: (id: number) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  'SW-01': '#e74c3c', 'SW-02': '#e67e22', 'SW-03': '#d4ac0d',
  'SW-04': '#27ae60', 'SW-05': '#16a085', 'SW-06': '#2980b9',
  'SW-07': '#8e44ad', 'SW-08': '#c0392b', 'SW-09': '#d35400',
  'SW-10': '#6d4c41', 'SW-11': '#546e7a', 'SW-12': '#388e3c',
  'SW-13': '#455a64', 'SW-14': '#d81b60',
};

const SEVERITY_LABEL: Record<string, string> = { S1: '심각', S2: '보통', S3: '경미' };

export default function ErrorPanel({ errors, rewritten, activeId, onSelect }: Props) {
  const activeRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [activeId]);

  if (errors.length === 0) {
    return (
      <div className="error-panel">
        <div className="panel-header">
          <span>✅ 오류 없음</span>
        </div>
        <div className="panel-empty">
          <p>탐지된 오류 패턴이 없습니다.</p>
          <p className="rewritten-label">윤문 결과</p>
          <pre className="rewritten-text">{rewritten}</pre>
        </div>
      </div>
    );
  }

  return (
    <div className="error-panel">
      <div className="panel-header">
        <span>🔍 맞춤법/문법 오류</span>
        <span className="panel-count">{errors.length}개</span>
      </div>
      <ul className="panel-list">
        {errors.map((err) => {
          // 'SW-10-D' 같은 세부 분류가 들어올 경우 앞 5자리('SW-10')만 잘라서 대분류 색상과 매칭
          const baseCategory = err.category.substring(0, 5);
          const color = CATEGORY_COLORS[baseCategory] ?? CATEGORY_COLORS[err.category] ?? '#888';
          const isActive = err.id === activeId;
          return (
            <li
              key={err.id}
              ref={isActive ? activeRef : null}
              className={`panel-item ${isActive ? 'active' : ''}`}
              style={{ '--item-color': color } as React.CSSProperties}
              onClick={() => onSelect(err.id)}
            >
              {/* 헤더 */}
              <div className="item-header">
                <span className="item-badge" style={{ background: color }}>{err.category}</span>
                <span className="item-name">{err.categoryName}</span>
                <span className={`item-sev sev-${err.severity.toLowerCase()}`}>
                  {SEVERITY_LABEL[err.severity]}
                </span>
              </div>

              {/* 입력 내용 */}
              <div className="item-row">
                <span className="item-label">입력 내용</span>
                <span className="item-original">
                  <span className="underline-text" style={{ borderColor: color }}>
                    {err.original}
                  </span>
                </span>
              </div>

              {/* 대치 */}
              <div className="item-row">
                <span className="item-label">대치</span>
                <span className="item-suggestion">{err.suggestion}</span>
              </div>

              {/* 도움말 */}
              <div className="item-help">💡 {err.reason}</div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

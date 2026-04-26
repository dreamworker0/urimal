import type { ErrorItem } from '../types';
import './ErrorList.css';

interface Props {
  errors: ErrorItem[];
}

const SEVERITY_LABEL: Record<string, string> = {
  S1: '심각',
  S2: '보통',
  S3: '경미',
};

const CATEGORY_COLORS: Record<string, string> = {
  'SW-01': '#e74c3c', 'SW-02': '#e67e22', 'SW-03': '#f1c40f',
  'SW-04': '#2ecc71', 'SW-05': '#1abc9c', 'SW-06': '#3498db',
  'SW-07': '#9b59b6', 'SW-08': '#e91e63', 'SW-09': '#ff5722',
  'SW-10': '#795548', 'SW-11': '#607d8b', 'SW-12': '#4caf50',
};

export default function ErrorList({ errors }: Props) {
  if (errors.length === 0) {
    return (
      <div className="error-empty">
        <span>✅</span>
        <p>탐지된 오류 패턴이 없습니다.</p>
      </div>
    );
  }

  return (
    <ul className="error-list">
      {errors.map((err) => (
        <li key={err.id} className="error-card">
          <div className="error-card-header">
            <span
              className="category-badge"
              style={{ background: CATEGORY_COLORS[err.category] ?? '#888' }}
            >
              {err.category}
            </span>
            <span className="category-name">{err.categoryName}</span>
            <span className={`severity-badge sev-${err.severity.toLowerCase()}`}>
              {SEVERITY_LABEL[err.severity] ?? err.severity}
            </span>
          </div>
          <div className="error-card-body">
            <div className="error-row">
              <span className="error-label">원문</span>
              <span className="error-original">"{err.original}"</span>
            </div>
            <div className="error-row">
              <span className="error-label">수정</span>
              <span className="error-suggestion">"{err.suggestion}"</span>
            </div>
            <div className="error-reason">💡 {err.reason}</div>
          </div>
        </li>
      ))}
    </ul>
  );
}

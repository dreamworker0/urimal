import './LoadingPage.css';

const STEPS = [
  { icon: '📂', label: '문서 파싱 중...' },
  { icon: '🔍', label: '우리말 오류 탐지 중...' },
  { icon: '✏️', label: 'AI 윤문 중...' },
  { icon: '✅', label: '검증 중...' },
];

export default function LoadingPage() {
  return (
    <div className="loading-page">
      <div className="loading-card">
        <div className="spinner" />
        <h2>윤문 분석 중입니다</h2>
        <p className="loading-sub">문서 길이에 따라 1~2분 소요될 수 있습니다</p>
        <ul className="step-list">
          {STEPS.map((s) => (
            <li key={s.label} className="step-item">
              <span>{s.icon}</span>
              <span>{s.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

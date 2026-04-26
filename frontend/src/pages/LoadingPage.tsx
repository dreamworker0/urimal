import './LoadingPage.css';
import type { ProgressInfo } from '../types';

const STEPS = [
  { id: 'parsing', icon: '📂', label: '문서 파싱 중...' },
  { id: 'analyzing', icon: '✏️', label: 'AI 윤문 중...' },
  { id: 'done', icon: '✅', label: '완료' },
];

interface Props {
  progress?: ProgressInfo | null;
}

export default function LoadingPage({ progress }: Props) {
  let progressText = '문서 길이에 따라 1~2분 소요될 수 있습니다';
  let activeStep = 'parsing';

  if (progress) {
    activeStep = progress.step;
    if (progress.step === 'analyzing' && progress.totalChunks) {
      const pct = Math.round(((progress.completedChunks || 0) / progress.totalChunks) * 100);
      progressText = `AI 윤문 진행 중: ${progress.completedChunks} / ${progress.totalChunks} 조각 (${pct}%)`;
    } else if (progress.step === 'done') {
      progressText = '분석 완료! 결과를 준비 중입니다...';
    }
  }

  const activeIndex = STEPS.findIndex(s => s.id === activeStep);
  const activeIndexSafe = activeIndex === -1 ? 0 : activeIndex;

  const pct = progress?.step === 'analyzing' && progress.totalChunks
    ? Math.round(((progress.completedChunks || 0) / progress.totalChunks) * 100)
    : (progress?.step === 'done' ? 100 : 0);

  return (
    <div className="loading-page">
      <div className="loading-card">
        <div className="spinner" />
        <h2>윤문 분석 중입니다</h2>
        <p className="loading-sub">{progressText}</p>

        {progress?.step === 'analyzing' && (
          <div className="progress-bar-container" style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', margin: '16px 0', overflow: 'hidden' }}>
            <div 
              className="progress-bar-fill" 
              style={{ width: `${pct}%`, height: '100%', background: 'var(--primary)', transition: 'width 0.3s ease' }} 
            />
          </div>
        )}

        <ul className="step-list">
          {STEPS.map((s, idx) => {
            const isCompleted = idx < activeIndexSafe;
            const isCurrent = idx === activeIndexSafe;
            return (
              <li key={s.label} className={`step-item ${isCompleted ? 'completed' : ''} ${isCurrent ? 'active' : ''}`} style={{ opacity: idx > activeIndexSafe ? 0.4 : 1 }}>
                <span>{s.icon}</span>
                <span style={{ fontWeight: isCurrent ? 'bold' : 'normal' }}>{s.label}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

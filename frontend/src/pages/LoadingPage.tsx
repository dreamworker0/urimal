import { useEffect, useState } from 'react';
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

function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

// parsing 0~20%, analyzing 20~95%, done 100% 로 통합 매핑.
// parsing 은 실제 진행률을 받지 못해 단일 값으로 고정 — 단계가 바뀔 때 점프한다.
function computePercent(progress: ProgressInfo | null | undefined): number {
  if (!progress) return 5;
  if (progress.step === 'parsing') return 12;
  if (progress.step === 'analyzing') {
    const total = progress.totalChunks ?? 0;
    const done = progress.completedChunks ?? 0;
    if (total > 0) {
      return Math.round(20 + (done / total) * 75);
    }
    return 20;
  }
  if (progress.step === 'done') return 100;
  return 5;
}

function buildSubText(progress: ProgressInfo | null | undefined): string {
  if (!progress) return '문서 길이에 따라 1~2분 소요될 수 있습니다';
  if (progress.step === 'parsing') return '문서를 읽고 있어요';
  if (progress.step === 'analyzing' && progress.totalChunks) {
    return `AI 윤문 진행 중 · ${progress.completedChunks ?? 0} / ${progress.totalChunks} 조각`;
  }
  if (progress.step === 'analyzing') return 'AI 윤문 진행 중';
  if (progress.step === 'done') return '결과를 준비 중입니다...';
  return '';
}

export default function LoadingPage({ progress }: Props) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - start) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const pct = computePercent(progress);
  const activeStep = progress?.step ?? 'parsing';
  const activeIndex = STEPS.findIndex(s => s.id === activeStep);
  const activeIndexSafe = activeIndex === -1 ? 0 : activeIndex;

  return (
    <div className="loading-page">
      <div className="loading-card">
        <div className="spinner" />
        <h2>윤문 분석 중입니다</h2>

        <div className="progress-percent">{pct}%</div>
        <div className="progress-bar-container">
          <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
        </div>
        <div className="progress-meta">
          <span className="progress-elapsed">{formatElapsed(elapsed)} 경과</span>
          <span className="progress-meta-sub">{buildSubText(progress)}</span>
        </div>

        <ul className="step-list">
          {STEPS.map((s, idx) => {
            const isCompleted = idx < activeIndexSafe;
            const isCurrent = idx === activeIndexSafe;
            return (
              <li
                key={s.label}
                className={`step-item ${isCompleted ? 'completed' : ''} ${isCurrent ? 'active' : ''}`}
                style={{ opacity: idx > activeIndexSafe ? 0.4 : 1 }}
              >
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

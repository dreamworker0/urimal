import { useRef, useState } from 'react';
import { analyzeFile } from '../api/analyze';
import type { AnalyzeResult, ProgressInfo } from '../types';
import './UploadPage.css';

const MODELS = [
  { value: 'gemini-3-flash-preview', label: 'Gemini 3 Flash Preview' },
];

interface Props {
  onLoading: () => void;
  onProgress: (info: ProgressInfo) => void;
  onResult: (data: AnalyzeResult, file: File) => void;
  onError: (msg: string) => void;
  errorMsg: string | null;
}

const ALLOWED_EXT = ['.hwp', '.hwpx', '.docx', '.pdf'];
const MAX_FILE_BYTES = 3 * 1024 * 1024; // 백엔드 multer 한도와 동기화

export default function UploadPage({ onLoading, onProgress, onResult, onError, errorMsg }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const model = MODELS[0].value;

  async function handleFile(file: File) {
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!ALLOWED_EXT.includes(ext)) {
      onError(`지원하지 않는 파일 형식입니다. (HWP, HWPX, DOCX, PDF만 가능)`);
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      const mb = (file.size / 1024 / 1024).toFixed(1);
      onError(`파일이 너무 큽니다 (${mb}MB). 3MB 이하로 업로드해 주세요.`);
      return;
    }
    onLoading();
    try {
      const result = await analyzeFile(file, model, onProgress);
      onResult(result, file);
    } catch (e: unknown) {
      onError(e instanceof Error ? e.message : '알 수 없는 오류');
    }
  }

  return (
    <div className="upload-page">
      <header className="upload-header">
        <div className="logo">
          <span className="logo-text">사회복지정보원 우리말 공부 <span style={{ fontSize: '0.5em', color: 'var(--primary)', background: 'rgba(59, 130, 246, 0.1)', padding: '4px 8px', borderRadius: '12px', verticalAlign: 'middle', marginLeft: '6px' }}>인공지능 버전</span></span>
        </div>
        <p className="tagline">사회복지 문서 우리말 답게 쓰기 위한 윤문 도구</p>
        
        <div className="principles-box">
          <p className="principles-title">이 프로그램의 목표</p>
          <p><strong>1.</strong> 문장 성분들이, 특히 주어와 술어가, 호응하게 합니다.</p>
          <p><strong>2.</strong> 논리가 통하게 합니다.</p>
          <p><strong>3.</strong> 문장은 물론이고 낱말도 토씨도 실질 실용이 있게 합니다.</p>
        </div>
      </header>

      <main className="upload-main">
        <div
          className={`drop-zone ${dragging ? 'dragging' : ''}`}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            const file = e.dataTransfer.files[0];
            if (file) handleFile(file);
          }}
        >
          <div className="drop-icon">📄</div>
          <p className="drop-title">파일을 여기에 끌어다 놓거나 클릭하세요</p>
          <p className="drop-hint">HWP · HWPX · DOCX · PDF · 최대 30페이지 / 3MB</p>
          <div className="upload-btn">컴퓨터에서 찾아보기</div>
        </div>

          <input
            ref={inputRef}
            type="file"
            accept=".hwp,.hwpx,.docx,.pdf"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />

        {errorMsg && <p className="error-msg">⚠️ {errorMsg}</p>}

        <div className="info-cards">
          <div className="info-card">
            <span className="info-icon">🔒</span>
            <h3>파일 무보관</h3>
            <p>업로드된 파일은 분석 후 즉시 삭제됩니다. 서버에 저장되지 않습니다.</p>
          </div>
          <div className="info-card">
            <span className="info-icon">📚</span>
            <h3>사회복지정보원 우리말 기준</h3>
            <p>사회복지 실무 현장 오류 36항목 기반으로 정밀 분석합니다.</p>
          </div>
          <div className="info-card">
            <span className="info-icon">✏️</span>
            <h3>내용 불변 원칙</h3>
            <p>사실·수치·고유명사는 단 한 글자도 변경하지 않습니다.</p>
          </div>
        </div>
      </main>

      <footer className="upload-footer">
        <p>본 서비스는 다음 자료 및 오픈소스 프로젝트를 활용하여 제작되었습니다:</p>
        <div className="footer-links">
          <a href="https://github.com/epoko77-ai/im-not-ai/" target="_blank" rel="noreferrer">im-not-ai ( 한글 AI 티 제거기)</a>
          <span className="footer-divider">|</span>
          <a href="https://github.com/edwardkim/rhwp" target="_blank" rel="noreferrer">rhwp (HWP 뷰어 엔진)</a>
          <span className="footer-divider">|</span>
          <a href="https://github.com/chrisryugj/kordoc" target="_blank" rel="noreferrer">kordoc (모든 문서 파싱)</a>
          <span className="footer-divider">|</span>
          <a href="http://welfare.or.kr/urimal.pdf" target="_blank" rel="noreferrer">사회복지정보원 우리말 공부</a>
        </div>
      </footer>
    </div>
  );
}

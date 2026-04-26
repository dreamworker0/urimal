// API 응답 타입 정의

export interface ErrorItem {
  id: number;
  category: string;        // SW-01 ~ SW-12
  categoryName: string;    // 예: "해 주다 과잉"
  original: string;        // 원문 표현
  suggestion: string;      // 수정 제안
  reason: string;          // 한덕연 근거
  severity: 'S1' | 'S2' | 'S3';
}

export interface AnalyzeResult {
  filename: string;
  original: string;        // 파싱된 원문 (Markdown)
  rewritten: string;       // 윤문 결과 (Markdown) — errors 를 순서대로 적용한 본문
  errors: ErrorItem[];     // 오류 목록
  stats: {
    totalErrors: number;
    appliedErrors: number; // 본문에 실제 반영된 건수
    skippedErrors: number; // 원문 미일치로 건너뛴 건수
    charDelta: number;     // 길이 변화 합계 (글자 단위)
    changeRate: string;    // charDelta / 원문 길이 (% 표기)
  };
}

export type AppStep = 'upload' | 'loading' | 'result';

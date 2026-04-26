import type { AnalyzeResult } from '../types';

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:4000');

export async function analyzeFile(file: File, model: string): Promise<AnalyzeResult> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('model', model);

  let response: Response;
  try {
    response = await fetch(`${API_URL}/api/analyze`, {
      method: 'POST',
      body: formData,
    });
  } catch (e) {
    // 네트워크 단절(서버 다운, 타임아웃, ERR_CONNECTION_RESET 등)은
    // fetch 가 TypeError 로 던진다 — 사용자에게 원인을 짐작할 수 있도록 안내.
    const detail = e instanceof Error ? e.message : String(e);
    throw new Error(
      `백엔드 서버에 연결하지 못했습니다 (${detail}). ` +
        `대용량 문서는 분석에 수 분이 걸릴 수 있습니다 — 서버가 실행 중인지, ` +
        `또는 콘솔에 분석 오류가 있는지 확인해 주세요.`,
    );
  }

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `서버 오류: ${response.status}`);
  }

  return response.json();
}

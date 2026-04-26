import type { AnalyzeResult, ProgressInfo } from '../types';

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:4000');

export async function analyzeFile(
  file: File, 
  model: string,
  onProgress?: (info: ProgressInfo) => void
): Promise<AnalyzeResult> {
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

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('스트림을 읽을 수 없습니다.');
  }

  const decoder = new TextDecoder('utf-8');
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    
    // SSE 이벤트는 \n\n 으로 구분됨
    const parts = buffer.split('\n\n');
    buffer = parts.pop() || ''; // 불완전한 마지막 조각은 버퍼에 남김

    for (const part of parts) {
      const line = part.trim();
      if (!line.startsWith('data: ')) continue;
      
      const jsonStr = line.replace(/^data:\s*/, '');
      try {
        const payload = JSON.parse(jsonStr);
        if (payload.type === 'progress') {
          if (onProgress) {
            onProgress({
              step: payload.step,
              completedChunks: payload.completedChunks,
              totalChunks: payload.totalChunks,
            });
          }
        } else if (payload.type === 'result') {
          if (onProgress) onProgress({ step: 'done' });
          return payload.data;
        } else if (payload.type === 'error') {
          throw new Error(payload.error || '서버 분석 중 오류가 발생했습니다.');
        }
      } catch (e) {
        // 서버의 명시적인 에러(type: error)인 경우 즉시 throw
        if (e instanceof Error && !e.message.includes('JSON')) {
          throw e;
        }
        // 단순 파싱 에러(잘린 조각 등)면 무시하고 다음 진행
      }
    }
  }

  throw new Error('스트림이 결과를 반환하기 전에 종료되었습니다.');
}

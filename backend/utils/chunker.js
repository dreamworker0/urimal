/**
 * 문단(빈 줄) 경계로 우선 분할, 그래도 너무 길면 줄 단위, 최후 수단으로 하드 분할.
 * 청크 간 문맥 단절을 방지하기 위해 overlap을 적용한다.
 * 
 * @param {string} text - 분석할 전체 텍스트
 * @param {number} target - 청크 1개의 목표 글자 수
 * @param {number} singlePassThreshold - 이 길이 이하일 경우 자르지 않고 단일 통과
 * @param {number} overlap - 청크 경계에 겹쳐서 전달할 이전 청크의 뒷부분 글자 수
 */
export function chunkMarkdown(text, target = 10000, singlePassThreshold = 12000, overlap = 200) {
  if (text.length <= singlePassThreshold) return [text];

  const chunks = [];
  let current = '';

  const flush = () => {
    if (current.trim().length > 0) chunks.push(current);
    // 다음 청크의 시작으로 이전 청크의 끝부분(overlap)을 가져온다.
    // 이전 청크의 길이가 overlap보다 길면 마지막 overlap글자만 취한다.
    if (current.length > overlap) {
      current = current.slice(-overlap);
    }
  };

  const append = (piece, sep) => {
    // current 길이에 sep, piece를 더했을 때 목표를 초과하는지 검사
    // current가 overlap만 가진 상태(즉, 이전 flush 직후)라면 조건을 조금 완화해 무조건 하나는 넣게 할 수 있으나
    // 로직 단순화를 위해 current.length === overlap 일때도 빈상태처럼 취급
    if (current.length + sep.length + piece.length <= target || current.length <= overlap) {
      // current가 overlap 문맥만 있는 상태(처음이 아니면서 겹친 부분만 존재)일 때 sep 붙이는 처리 주의
      // 첫 시작(current === '')이면 sep 안붙임
      current = (current && current.length > overlap) ? current + sep + piece : current + piece;
    } else {
      flush();
      current = current ? current + piece : piece; // overlap 위에 붙임
    }
  };

  const paragraphs = text.split(/\n\n+/);
  for (const p of paragraphs) {
    if (p.length <= target) {
      append(p, '\n\n');
      continue;
    }
    // 문단 자체가 청크보다 큰 경우 → 줄 단위 재분할
    flush();
    const lines = p.split('\n');
    for (const line of lines) {
      if (line.length <= target) {
        append(line, '\n');
        continue;
      }
      // 한 줄이 청크보다 큰 극단 케이스 → 하드 분할
      flush();
      for (let i = 0; i < line.length; i += target) {
        chunks.push(line.slice(i, i + target));
      }
    }
    flush();
  }
  flush(); // 마지막 남은 내용 처리
  
  // 마지막 overlap만 남은 찌꺼기 방지
  if (chunks.length > 0) {
    const lastChunk = chunks[chunks.length - 1];
    if (lastChunk.length <= overlap) {
      chunks.pop(); // 너무 짧은 마지막 찌꺼기 버림
    }
  }

  return chunks;
}

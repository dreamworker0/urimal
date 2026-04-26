/**
 * 잘린 JSON 에서 errors 배열을 부분 복구한다 (마지막 닫히지 않은 객체는 폐기).
 */
export function recoverPartialErrors(text) {
  const arrStart = text.indexOf('"errors"');
  if (arrStart === -1) return [];
  const bracket = text.indexOf('[', arrStart);
  if (bracket === -1) return [];

  const items = [];
  let depth = 0;
  let inStr = false;
  let escape = false;
  let objStart = -1;

  for (let i = bracket + 1; i < text.length; i++) {
    const ch = text[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (ch === '\\') {
      escape = true;
      continue;
    }
    if (ch === '"') {
      inStr = !inStr;
      continue;
    }
    if (inStr) continue;

    if (ch === '{') {
      if (depth === 0) objStart = i;
      depth++;
    } else if (ch === '}') {
      depth--;
      if (depth === 0 && objStart !== -1) {
        const slice = text.slice(objStart, i + 1);
        try {
          items.push(JSON.parse(slice));
        } catch {
          // 손상된 객체는 건너뜀
        }
        objStart = -1;
      }
    } else if (ch === ']' && depth === 0) {
      break;
    }
  }
  return items;
}

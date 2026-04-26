import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { recoverPartialErrors } from '../utils/jsonRecover.js';
import { chunkMarkdown } from '../utils/chunker.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REFS_DIR = path.join(
  __dirname,
  '../../.agents/skills/im-not-ai-for-socialworker/resources/references'
);

let genAI;
let taxonomyCache = null;
let playbookCache = null;

// 청크 분할 파라미터
const CHUNK_TARGET_CHARS = 10000;       // 청크 1개의 목표 길이 (Markdown 기준)
const SINGLE_PASS_THRESHOLD = 12000;    // 이 이하 길이는 청크 없이 단일 호출
const CHUNK_CONCURRENCY = 5;            // 동시 분석 청크 수 (rate limit 고려)
const CHUNK_MAX_OUTPUT_TOKENS = 32768;  // 청크당 출력 토큰 한도 (thinking 토큰 소비 감안)

const errorItemSchema = {
  type: SchemaType.OBJECT,
  properties: {
    category: {
      type: SchemaType.STRING,
      description: "반드시 'SW-01-A'와 같이 하위 패턴 ID까지 정확하게 기입할 것",
    },
    categoryName: { type: SchemaType.STRING },
    original: { type: SchemaType.STRING, description: '원본 표현' },
    suggestion: { type: SchemaType.STRING, description: '수정 제안' },
    reason: { type: SchemaType.STRING, description: '분류 근거 및 요약' },
    severity: { type: SchemaType.STRING, description: 'S1, S2, S3 중 하나' },
  },
  required: ['category', 'categoryName', 'original', 'suggestion', 'reason', 'severity'],
};

// 청크 응답 스키마: rewritten/stats/id 제거 — 병합 단계에서 부여
const chunkSchema = {
  type: SchemaType.OBJECT,
  properties: {
    errors: {
      type: SchemaType.ARRAY,
      description:
        "이 청크에서 발견된 모든 문체·말투·맞춤법 오류. 빠짐없이 전수 점검할 것.",
      items: errorItemSchema,
    },
  },
  required: ['errors'],
};

function getClient() {
  if (!genAI) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY 환경변수가 설정되지 않았습니다.');
    }
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return genAI;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function isTransient(err) {
  if (!err) return false;
  const status = err.status ?? err.statusCode;
  if (status === 429 || (status >= 500 && status < 600)) return true;
  const msg = String(err.message || '').toLowerCase();
  return (
    msg.includes('rate') ||
    msg.includes('timeout') ||
    msg.includes('econnreset') ||
    msg.includes('etimedout') ||
    msg.includes('fetch failed') ||
    msg.includes('overloaded')
  );
}

async function generateWithRetry(modelInstance, request, maxAttempts = 3) {
  let lastErr;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await modelInstance.generateContent(request);
    } catch (err) {
      lastErr = err;
      if (attempt === maxAttempts || !isTransient(err)) throw err;
      const backoff = 500 * 2 ** (attempt - 1) + Math.floor(Math.random() * 250);
      console.warn(
        `[Gemini 재시도 ${attempt}/${maxAttempts - 1}] ${err.message || err} — ${backoff}ms 후 재시도`
      );
      await sleep(backoff);
    }
  }
  throw lastErr;
}


async function loadRefs() {
  if (!taxonomyCache) {
    taxonomyCache = await fs.readFile(path.join(REFS_DIR, 'sw-tell-taxonomy.md'), 'utf-8');
  }
  if (!playbookCache) {
    playbookCache = await fs.readFile(path.join(REFS_DIR, 'sw-rewriting-playbook.md'), 'utf-8');
  }
  return { taxonomy: taxonomyCache, playbook: playbookCache };
}


// 동시 실행 N개 제한 풀
async function runWithConcurrency(items, limit, fn) {
  const results = new Array(items.length);
  let next = 0;
  async function worker() {
    while (true) {
      const i = next++;
      if (i >= items.length) return;
      results[i] = await fn(items[i], i);
    }
  }
  const workers = Array.from({ length: Math.min(limit, items.length) }, worker);
  await Promise.all(workers);
  return results;
}

function buildSystemPrompt(taxonomy, playbook) {
  return `당신은 10년 차 수석 사회복지사 수준의 전문 윤문 AI입니다.
아래 두 레퍼런스를 바탕으로 후배 사회복지사가 작성한 문서를 매우 꼼꼼하게 검토합니다.

## 분류 체계 (sw-tell-taxonomy)
${taxonomy}

## 윤문 처방 (sw-rewriting-playbook)
${playbook}

## 절대 원칙
1. 사실·수치·고유명사·인용문은 단 한 글자도 변경 금지합니다.
2. 입력으로 받은 텍스트(부분 문서일 수 있음)에 존재하는 **모든 문체·말투·맞춤법 오류를 빠짐없이 전수 검사**하십시오. '해 주다' 과잉, 피동형, 사업화 문체, 관용구 오남용 등 사소한 표현 하나도 놓치지 마십시오.
3. 모든 수정 제안에는 분류 체계의 세부 카테고리 ID(반드시 'SW-01-A'와 같은 하위 ID 형식)와 근거를 명시합니다.
4. **절대 중단 금지**: "이하 생략", "..." 등으로 출력을 중단하지 말고 'errors' 목록을 끝까지 채우십시오. 발견되는 오류가 많으면 많을수록 좋습니다.
5. 같은 표현이 여러 번 나타나면 각 출현마다 별도의 errors 항목으로 기록하지 말고, 가장 대표적인 1건만 기록하십시오 (전체 문서 단위로 중복 제거됩니다).`;
}

async function analyzeChunk(modelInstance, systemPrompt, chunkText, chunkIdx, totalChunks) {
  const userPrompt =
    totalChunks > 1
      ? `다음은 사회복지 문서의 일부입니다 (전체 ${totalChunks}개 부분 중 ${chunkIdx + 1}번째 부분).
이 부분에서 분류 체계에 해당하는 **모든** 문체·말투·맞춤법 오류를 빠짐없이 찾아내세요.

## 분석 대상 (부분 문서)
\`\`\`
${chunkText}
\`\`\`
`
      : `다음 사회복지 문서를 철저히 분석하여, 분류 체계에 해당하는 **모든** 문체·말투·맞춤법 오류를 빠짐없이 찾아내세요.

## 분석 대상 문서
\`\`\`
${chunkText}
\`\`\`
`;

  try {
    const result = await generateWithRetry(modelInstance, {
      systemInstruction: systemPrompt,
      contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: chunkSchema,
        temperature: 0,
        seed: 42,
        maxOutputTokens: CHUNK_MAX_OUTPUT_TOKENS,
      },
    });

    const raw = result.response.text();
    const cleaned = raw
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    try {
      const parsed = JSON.parse(cleaned);
      return { errors: parsed.errors ?? [], truncated: false, failed: false };
    } catch {
      const recovered = recoverPartialErrors(cleaned);
      console.warn(
        `[청크 ${chunkIdx + 1}/${totalChunks}] JSON 절단 — ${recovered.length}건 부분 복구`
      );
      return { errors: recovered, truncated: true, failed: false };
    }
  } catch (err) {
    console.error(
      `[청크 ${chunkIdx + 1}/${totalChunks}] 분석 실패:`,
      err.message || err
    );
    return { errors: [], truncated: false, failed: true };
  }
}

// 공백·구두점 차이를 흡수해 청크 경계의 동일 패턴을 더 잘 잡아낸다.
function normalizeForDedup(s) {
  return String(s ?? '')
    .replace(/\s+/g, '')
    .replace(/[.,;:!?·…“”"'()\[\]{}<>~\-—]/g, '');
}

// 청크별 결과 병합 + 중복 제거 + ID 재부여
function mergeChunkResults(chunkResults) {
  const seen = new Set();
  const errors = [];
  let id = 1;
  let truncatedCount = 0;
  let failedCount = 0;

  for (const cr of chunkResults) {
    if (cr.truncated) truncatedCount++;
    if (cr.failed) failedCount++;
    for (const e of cr.errors ?? []) {
      // 청크 경계에서 같은 패턴이 양쪽에 잡히는 경우 흡수.
      // 공백/구두점만 다른 동일 표현은 한 건으로 본다.
      const key = `${e.category}|${normalizeForDedup(e.original)}|${normalizeForDedup(e.suggestion)}`;
      if (seen.has(key)) continue;
      seen.add(key);
      errors.push({ id: id++, ...e });
    }
  }

  return { errors, truncatedCount, failedCount };
}

// errors 를 원문에 순서대로 적용해 윤문 본문을 만든다.
// - 각 error 의 첫 번째 출현만 치환 (같은 표현이 여러 번 등장해도 errors 배열 순서대로 한 번씩 소비됨)
// - original 이 본문에 없으면 건너뛴다 (모델이 표현을 살짝 다듬어 적은 경우)
function applyErrors(originalText, errors) {
  let text = originalText;
  let cursor = 0; // 이미 적용한 위치 이후부터 탐색해 같은 자리 재치환을 피함
  const appliedIds = [];
  const skippedIds = [];
  let charDelta = 0;

  for (const err of errors) {
    const original = err?.original;
    const suggestion = err?.suggestion;
    if (!original || suggestion == null || original === suggestion) {
      skippedIds.push(err.id);
      continue;
    }
    // 우선 cursor 이후에서 찾되, 없으면 처음부터 다시 시도 (errors 가 정확한 문서 순서가 아닐 수 있음)
    let idx = text.indexOf(original, cursor);
    if (idx === -1) idx = text.indexOf(original);
    if (idx === -1) {
      skippedIds.push(err.id);
      continue;
    }
    text = text.slice(0, idx) + suggestion + text.slice(idx + original.length);
    cursor = idx + suggestion.length;
    charDelta += Math.abs(suggestion.length - original.length);
    appliedIds.push(err.id);
  }
  return { text, appliedIds, skippedIds, charDelta };
}

/**
 * 문서 텍스트를 윤문하고 오류 목록을 반환
 * 큰 문서는 청크로 분할해 병렬 분석 후 병합한다.
 * @param {string} documentText - kordoc으로 파싱된 Markdown 텍스트
 * @param {string} model - Gemini 모델명
 * @returns {Promise<{original: string, rewritten: string, errors: Array, stats: object}>}
 */
export async function analyzeDocument(documentText, model = 'gemini-3-flash-preview') {
  const { taxonomy, playbook } = await loadRefs();
  const modelInstance = getClient().getGenerativeModel({ model });
  const systemPrompt = buildSystemPrompt(taxonomy, playbook);

  const chunks = chunkMarkdown(documentText, CHUNK_TARGET_CHARS, SINGLE_PASS_THRESHOLD, 200);
  console.log(
    `[청크] 문서 ${documentText.length}자 → ${chunks.length}개 청크 (목표 ${CHUNK_TARGET_CHARS}자/청크, 동시 ${CHUNK_CONCURRENCY})`
  );

  const t0 = Date.now();
  const chunkResults = await runWithConcurrency(
    chunks,
    CHUNK_CONCURRENCY,
    (chunk, idx) => analyzeChunk(modelInstance, systemPrompt, chunk, idx, chunks.length)
  );
  const elapsedSec = Math.round((Date.now() - t0) / 1000);

  const { errors, truncatedCount, failedCount } = mergeChunkResults(chunkResults);

  console.log(
    `[청크 완료] ${chunks.length}개 청크 처리 (${elapsedSec}s) — 병합 후 오류 ${errors.length}건` +
      (truncatedCount ? `, 절단 ${truncatedCount}건` : '') +
      (failedCount ? `, 실패 ${failedCount}건` : '')
  );

  // 탐지 결과를 원문에 적용해 윤문 본문을 만든다.
  const { text: rewritten, appliedIds, skippedIds, charDelta } = applyErrors(
    documentText,
    errors
  );
  const baseLen = documentText.length || 1;
  const changeRatePct = ((charDelta / baseLen) * 100).toFixed(1);

  console.log(
    `[윤문 적용] ${appliedIds.length}/${errors.length}건 반영` +
      (skippedIds.length ? `, ${skippedIds.length}건 원문 미일치로 건너뜀` : '') +
      ` — 글자 변화 ${charDelta}자 (≈${changeRatePct}%)`
  );

  const stats = {
    totalErrors: errors.length,
    appliedErrors: appliedIds.length,
    skippedErrors: skippedIds.length,
    charDelta,
    changeRate: `${changeRatePct}%`,
  };

  return {
    original: documentText,
    rewritten,
    errors,
    stats,
    ...(truncatedCount || failedCount
      ? { partial: { truncatedCount, failedCount, totalChunks: chunks.length } }
      : {}),
  };
}

import crypto from 'crypto';

/**
 * Supabase 사용 기록 저장/조회.
 *
 * supabase-js SDK 대신 PostgREST HTTP API 를 직접 호출한다.
 * 하는 일이 "한 행 넣기 / 기간별로 읽기" 두 가지뿐이라 의존성을 늘릴 이유가 없고,
 * 서버리스 콜드스타트도 그만큼 가벼워진다.
 *
 * 필요한 환경변수 (Vercel → Settings → Environment Variables)
 *   SUPABASE_URL               예) https://xxxxxxxx.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY  Supabase → Settings → API → service_role (secret)
 *
 * 둘 중 하나라도 없으면 기록은 조용히 꺼진다. 통계가 안 쌓일 뿐,
 * 윤문 기능 자체는 지금과 똑같이 동작한다.
 */

const TABLE = 'usage_logs';
const PAGE_SIZE = 1000;      // PostgREST 한 번에 가져오는 행 수
const MAX_ROWS = 100000;     // 조회 상한 (메모리 보호)

function config() {
  const url = (process.env.SUPABASE_URL || '').replace(/\/+$/, '');
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!url || !key) return null;
  return { url, key };
}

export function isUsageLogEnabled() {
  return config() !== null;
}

function headers(cfg, extra = {}) {
  return {
    apikey: cfg.key,
    Authorization: `Bearer ${cfg.key}`,
    'Content-Type': 'application/json',
    ...extra,
  };
}

/**
 * 접속자를 대략 구분하기 위한 해시.
 * IP + User-Agent 를 "날짜 + 서버 비밀값"과 함께 해시하므로
 * 저장된 값에서 IP 를 역산할 수 없고, 날짜가 바뀌면 값도 바뀐다.
 */
export function visitorHash(req) {
  const fwd = req.headers['x-forwarded-for'];
  const ip = (typeof fwd === 'string' ? fwd.split(',')[0].trim() : '') || req.ip || '';
  const ua = req.headers['user-agent'] || '';
  const day = new Date().toISOString().slice(0, 10);
  const salt = process.env.VISITOR_HASH_SALT || process.env.SUPABASE_SERVICE_ROLE_KEY || 'urimal';
  return crypto.createHash('sha256').update(`${day}|${salt}|${ip}|${ua}`).digest('hex').slice(0, 16);
}

/**
 * 사용 기록 1건 저장.
 * 기록 실패가 사용자 요청을 망치면 안 되므로 절대 throw 하지 않는다.
 */
export async function recordUsage(row) {
  const cfg = config();
  if (!cfg) return;

  try {
    const res = await fetch(`${cfg.url}/rest/v1/${TABLE}`, {
      method: 'POST',
      headers: headers(cfg, { Prefer: 'return=minimal' }),
      body: JSON.stringify(row),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      console.warn(`[사용기록] 저장 실패 ${res.status}: ${body.slice(0, 300)}`);
    }
  } catch (err) {
    console.warn('[사용기록] 저장 실패:', err?.message || err);
  }
}

/**
 * 기간 내 기록 전체 조회 (페이지네이션으로 나눠 받음).
 * @param {Date} since - 이 시각 이후의 기록만
 */
export async function fetchUsageLogs(since) {
  const cfg = config();
  if (!cfg) throw new Error('Supabase 환경변수(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)가 설정되지 않았습니다.');

  const columns = [
    'created_at', 'input_type', 'file_ext', 'file_bytes', 'char_count', 'est_pages',
    'model', 'chunk_count', 'prompt_tokens', 'output_tokens', 'thoughts_tokens',
    'total_tokens', 'error_count', 'applied_count', 'duration_ms', 'status',
    'fail_reason', 'category_counts', 'visitor_hash',
  ].join(',');

  const base =
    `${cfg.url}/rest/v1/${TABLE}` +
    `?select=${columns}` +
    `&created_at=gte.${encodeURIComponent(since.toISOString())}` +
    `&order=created_at.asc`;

  const rows = [];
  for (let offset = 0; offset < MAX_ROWS; offset += PAGE_SIZE) {
    const res = await fetch(base, {
      headers: headers(cfg, { Range: `${offset}-${offset + PAGE_SIZE - 1}` }),
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`Supabase 조회 실패 (${res.status}): ${body.slice(0, 300)}`);
    }
    const page = await res.json();
    rows.push(...page);
    if (page.length < PAGE_SIZE) break;
  }
  return rows;
}

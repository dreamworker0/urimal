-- ============================================================================
-- urimal 사용 통계 테이블
--
-- Supabase 대시보드 → SQL Editor 에 이 파일 전체를 붙여넣고 한 번 실행하세요.
-- (여러 번 실행해도 안전합니다 — 이미 있으면 건너뜁니다.)
--
-- ★ 개인정보 원칙
--   문서 본문·파일명은 저장하지 않습니다. 화면에 안내한 "파일 무보관" 약속을
--   그대로 지키기 위해, 아래 컬럼은 모두 "몇 글자짜리 무슨 형식 문서였는가"
--   수준의 메타데이터뿐입니다.
-- ============================================================================

create table if not exists public.usage_logs (
  id              bigserial primary key,
  created_at      timestamptz not null default now(),

  -- 입력 방식
  input_type      text        not null,              -- 'file' | 'text'
  file_ext        text,                              -- '.hwp' | '.hwpx' | '.docx' | '.pdf' (텍스트 입력이면 null)
  file_bytes      integer,                           -- 업로드 파일 크기 (텍스트 입력이면 붙여넣은 바이트 수)

  -- 분량
  char_count      integer     not null default 0,    -- 파싱된 본문 글자 수
  est_pages       numeric(7,1) not null default 0,   -- 추정 페이지 수 (글자수 / 2000)

  -- 모델 / 토큰
  model           text,
  chunk_count     integer,                           -- 몇 조각으로 나눠 분석했는지
  prompt_tokens   integer     not null default 0,
  output_tokens   integer     not null default 0,
  thoughts_tokens integer     not null default 0,    -- 사고(thinking) 토큰
  total_tokens    integer     not null default 0,

  -- 결과
  error_count     integer,                           -- 탐지된 윤문 오류 건수
  applied_count   integer,                           -- 본문에 실제 반영된 건수
  duration_ms     integer,                           -- 요청 시작 ~ 응답까지 소요 시간
  status          text        not null,              -- 'success' | 'cached' | 'failed'
  fail_reason     text,                              -- 실패 사유 (성공이면 null)

  -- 오류 유형 분포 { "SW-01-A": 3, "SW-02-B": 1 }
  category_counts jsonb,

  -- 대략적인 순방문자 추정용. IP+UA 를 날짜별 소금과 함께 해시한 값이라
  -- 되돌려 IP 를 알아낼 수 없고, 날짜가 바뀌면 값도 바뀝니다.
  visitor_hash    text
);

create index if not exists usage_logs_created_at_idx
  on public.usage_logs (created_at desc);

-- RLS 를 켜되 정책을 하나도 만들지 않습니다.
-- → anon/authenticated 키로는 아무것도 읽거나 쓸 수 없고,
--   서버가 쓰는 service_role 키만 RLS 를 우회해 접근합니다.
alter table public.usage_logs enable row level security;

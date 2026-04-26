import express from 'express';
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import rateLimit from 'express-rate-limit';
import NodeCache from 'node-cache';
import { parseDocument } from '../services/parser.js';
import { analyzeDocument } from '../services/gemini.js';

const router = express.Router();

// 1시간 캐싱
const resultCache = new NodeCache({ stdTTL: 3600, checkperiod: 600 });

// Rate Limiter
const analyzeLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1분
  max: 10, // IP당 10번
  message: { error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const ALLOWED_EXTENSIONS = new Set(['.hwp', '.hwpx', '.docx', '.pdf']);

// 무료 서비스 비용/지연 통제 — 프론트와 동일 기준
const MAX_FILE_BYTES = 3 * 1024 * 1024;  // 3MB
const MAX_PAGES = 30;
// kordoc 마크다운에서 페이지 1쪽당 평균 분량(여유 포함). 수치보고서·표 위주 문서를 고려해
// 1쪽 ≈ 2000자로 어림잡고 30쪽 = 60,000자 한계로 본다.
const CHARS_PER_PAGE = 2000;
const MAX_MARKDOWN_CHARS = MAX_PAGES * CHARS_PER_PAGE;

// 프론트엔드 UploadPage 의 MODELS 와 동기 유지.
// 추가/변경 시 환경변수 ALLOWED_MODELS (콤마 구분) 로 덮어쓸 수 있다.
const DEFAULT_ALLOWED_MODELS = ['gemini-3-flash-preview'];
const ALLOWED_MODELS = new Set(
  (process.env.ALLOWED_MODELS
    ? process.env.ALLOWED_MODELS.split(',').map((s) => s.trim()).filter(Boolean)
    : DEFAULT_ALLOWED_MODELS)
);
const DEFAULT_MODEL = 'gemini-3-flash-preview';

// 메모리 저장 (파일 무보관 원칙 — 디스크 저장 안 함)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_BYTES },
  fileFilter(_req, file, cb) {
    // multer 가 latin-1 로 디코딩한 파일명을 UTF-8 로 복원
    const filename = Buffer.from(file.originalname, 'latin1').toString('utf8');
    const ext = path.extname(filename).toLowerCase();
    if (ALLOWED_EXTENSIONS.has(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`지원하지 않는 파일 형식: ${ext || '(확장자 없음)'}. 허용: HWP, HWPX, DOCX, PDF`));
    }
  },
});

// multer 의 fileFilter / limits 위반은 4xx 로 응답하도록 래핑한다.
function handleUpload(req, res, next) {
  upload.single('file')(req, res, (err) => {
    if (!err) return next();
    if (err instanceof multer.MulterError) {
      const error = new Error(
        err.code === 'LIMIT_FILE_SIZE'
          ? `파일이 너무 큽니다. ${MAX_FILE_BYTES / 1024 / 1024}MB 이하로 업로드해 주세요.`
          : err.message
      );
      error.status = 413;
      return next(error);
    }
    err.status = 400;
    return next(err);
  });
}

/**
 * POST /api/analyze
 * 파일 업로드 → 파싱 → Gemini 윤문 → 결과 반환 (SSE 스트리밍)
 */
router.post('/', analyzeLimiter, handleUpload, async (req, res, next) => {
  if (!req.file) {
    const err = new Error('파일이 없습니다.');
    err.status = 400;
    return next(err);
  }

  // SSE 스트리밍 헤더 설정
  res.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });
  res.flushHeaders();

  try {
    const filename = Buffer.from(req.file.originalname, 'latin1').toString('utf8');

    // 2단계: 캐시 키 생성 (파일 내용 해시 + 요청 모델명)
    const fileHash = crypto.createHash('md5').update(req.file.buffer).digest('hex');
    const requestedModel = (req.body?.model || '').trim();
    const selectedModel = ALLOWED_MODELS.has(requestedModel) ? requestedModel : DEFAULT_MODEL;
    const cacheKey = `${fileHash}_${selectedModel}`;

    const cachedResult = resultCache.get(cacheKey);
    if (cachedResult) {
      console.log(`[캐시 적중] ${filename} (${req.file.size} bytes)`);
      res.write(`data: ${JSON.stringify({ type: 'result', data: cachedResult })}\n\n`);
      return res.end();
    }

    console.log(`[분석 시작] ${filename} (${req.file.size} bytes)`);

    // 진행 상태 알림: 문서 파싱 시작
    res.write(`data: ${JSON.stringify({ type: 'progress', step: 'parsing' })}\n\n`);

    // 문서 파싱 (kordoc)
    const markdownText = await parseDocument(req.file.buffer, req.file.originalname);

    if (!markdownText || markdownText.trim().length < 10) {
      const err = new Error('문서에서 텍스트를 추출할 수 없습니다.');
      err.status = 422;
      throw err;
    }

    // 분량 제한 — 무료 서비스 비용/대기시간 통제
    if (markdownText.length > MAX_MARKDOWN_CHARS) {
      const estimatedPages = Math.ceil(markdownText.length / CHARS_PER_PAGE);
      const err = new Error(`문서가 너무 깁니다 (약 ${estimatedPages}페이지). ${MAX_PAGES}페이지 이하로 줄여서 다시 시도해 주세요.`);
      err.status = 413;
      throw err;
    }

    // Gemini 윤문 분석
    if (requestedModel && requestedModel !== selectedModel) {
      console.warn(`[모델] 허용되지 않은 모델 요청: "${requestedModel}" → "${selectedModel}" 로 대체`);
    }
    console.log(`[모델] ${selectedModel}`);
    
    // 분석 진행 콜백
    const onProgress = (info) => {
      res.write(`data: ${JSON.stringify({ type: 'progress', step: 'analyzing', ...info })}\n\n`);
    };

    const result = await analyzeDocument(markdownText, selectedModel, onProgress);

    console.log(`[분석 완료] 오류 ${result.errors.length}건 탐지`);

    const responseData = {
      filename,
      ...result,
    };

    resultCache.set(cacheKey, responseData);

    // 완료 결과 전송
    res.write(`data: ${JSON.stringify({ type: 'result', data: responseData })}\n\n`);
    res.end();
  } catch (err) {
    console.error('[분석 오류]', err);
    res.write(`data: ${JSON.stringify({ type: 'error', error: err.message || '서버 내부 오류가 발생했습니다.' })}\n\n`);
    res.end();
  }
});

export default router;

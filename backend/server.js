import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import analyzeRouter from './routes/analyze.js';

const app = express();
const PORT = process.env.PORT || 4000;

// CORS_ORIGINS: 콤마로 구분된 허용 origin 목록 (예: "http://localhost:5173,https://urimal.example.com")
// 미설정 시 개발 편의를 위해 localhost 만 허용한다.
const allowedOrigins = (process.env.CORS_ORIGINS ||
  'http://localhost:5173,http://localhost:4173,http://127.0.0.1:5173')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, cb) {
      // origin 이 없는 요청 = 동일 출처 / curl / 서버-서버 → 허용
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error(`CORS 차단: ${origin}`));
    },
  })
);
app.use(express.json());

// 헬스체크
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 라우터
app.use('/api/analyze', analyzeRouter);

// 전역 에러 핸들러
app.use((err, req, res, next) => {
  console.error('[Global Error Handler]', err);
  const status = err.status || 500;
  res.status(status).json({ error: err.message || '서버 내부 오류가 발생했습니다.' });
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`urimal 백엔드 서버 실행 중: http://localhost:${PORT}`);
  });
}

export default app;

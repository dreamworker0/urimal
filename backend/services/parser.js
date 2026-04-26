import { execFile } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import os from 'os';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const execFileAsync = promisify(execFile);

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 우선순위: 환경변수 > 프로젝트 루트 기준 상대경로
const KORDOC_PATH = process.env.KORDOC_PATH
  ? path.resolve(process.env.KORDOC_PATH)
  : path.resolve(
      __dirname,
      '..',
      '..',
      '.agents',
      'skills',
      'kordoc',
      'scripts',
      'kordoc',
      'dist',
      'cli.js'
    );

/**
 * kordoc CLI를 사용해 HWP/HWPX/DOCX/PDF 파일을 Markdown으로 파싱
 * @param {Buffer} fileBuffer - 업로드된 파일 버퍼
 * @param {string} originalName - 원본 파일명 (확장자 판별용)
 * @returns {Promise<string>} - Markdown 텍스트
 */
let kordocVerified = false;
async function verifyKordoc() {
  if (kordocVerified) return;
  try {
    await fs.access(KORDOC_PATH);
    kordocVerified = true;
  } catch {
    throw new Error(
      `kordoc CLI를 찾을 수 없습니다: ${KORDOC_PATH}\n` +
        `KORDOC_PATH 환경변수로 절대경로를 지정하거나, .agents/skills/kordoc 빌드 결과물이 있는지 확인하세요.`
    );
  }
}

export async function parseDocument(fileBuffer, originalName) {
  await verifyKordoc();

  // 임시 파일 생성 (처리 후 즉시 삭제)
  const ext = path.extname(originalName).toLowerCase();
  const tmpInput = path.join(os.tmpdir(), `urimal_input_${crypto.randomUUID()}${ext}`);

  try {
    await fs.writeFile(tmpInput, fileBuffer);

    const { stdout } = await execFileAsync('node', [KORDOC_PATH, tmpInput], {
      timeout: 90_000, // 90초 — 50페이지 5MB 이하 파일 기준 충분
      maxBuffer: 16 * 1024 * 1024, // 16MB — 5MB 파일이 만드는 markdown 보다 충분히 크게
    });

    return stdout;
  } finally {
    // 파일 무보관 원칙: 임시 파일 즉시 삭제
    await fs.unlink(tmpInput).catch(() => {});
  }
}

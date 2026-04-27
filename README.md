# 사회복지 문서 우리말 답게 쓰기 위한 윤문 도구 (urimal)

사회복지사가 작성하는 계획서, 주간업무보고서 등 다양한 공문서를 자연스럽고 올바른 우리말로 윤문해주는 에이전트 파이프라인 도구입니다.

## 주요 기능

*   **맞춤형 윤문**: 사회복지 현장에서 자주 사용되는 용어와 문맥을 이해하고, 문법에 맞게 자연스러운 문장으로 교정합니다.
*   **파일 지원**: PDF, HWP, DOCX 등 다양한 문서 형식의 텍스트를 추출하여 윤문할 수 있습니다.
*   **비교 보기**: 원본 텍스트와 윤문된 텍스트를 나란히 비교하여 어떤 부분이 어떻게 수정되었는지 쉽게 파악할 수 있습니다.
*   **원칙 기반 교정**: 
    1. 주어와 서술어의 문법적 호응 일치
    2. 논리적 흐름과 일관성 유지
    3. 문맥에 맞는 실용적인 어휘와 조사 사용

## 기술 스택

*   **Frontend**: React, Vite, TailwindCSS
*   **Backend (API)**: Node.js, Express, Vercel Serverless Functions
*   **AI Integration**: Google Gemini API

## 배포 (Deployment)

이 프로젝트는 Vercel을 통해 프론트엔드와 백엔드가 함께 배포됩니다.
*   **Frontend**: Vercel Static Build (`frontend` 폴더 빌드)
*   **Backend**: Vercel Zero-config Serverless Functions (`api` 폴더 기반)

### Vercel 배포 시 주의사항
*   Vercel 환경 변수(Environment Variables)에 `GEMINI_API_KEY`를 등록해야 합니다.

## 로컬 개발 환경 설정 (Local Development)

### 1. 환경 변수 설정
`api` 폴더 내에 `.env` 파일을 생성하고 다음 값을 설정합니다.
```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=4000
```

### 2. 백엔드(API) 서버 실행
```bash
cd api
npm install
npm run dev
```

### 3. 프론트엔드 실행
새로운 터미널을 열고 프론트엔드 디렉토리에서 다음을 실행합니다.
```bash
cd frontend
npm install
npm run dev
```


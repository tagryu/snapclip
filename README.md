# SnapClip — AI 상품 영상 자동 생성

상품 사진 한 장이면, 15초 숏폼 광고 영상이 자동으로 만들어집니다.

## 기술 스택

| 영역 | 기술 |
|------|------|
| Frontend | Next.js 15, React 19, Tailwind CSS 4, TypeScript |
| Backend | Express, BullMQ (Redis), TypeScript |
| AI | Google Gemini (카피라이팅), edge-tts (TTS) |
| 영상 처리 | FFmpeg, Sharp, @imgly/background-removal-node |
| 인증 | Supabase Auth |
| 결제 | TossPayments |
| 스토리지 | Cloudflare R2 |
| DB | Supabase (PostgreSQL) |

## Prerequisites

- **Node.js** 20+
- **FFmpeg** (`brew install ffmpeg` 또는 시스템 패키지 매니저)
- **Python 3** + **edge-tts** (`pip install edge-tts`) — TTS 사용 시
- **Redis** — BullMQ 큐 (Upstash Redis 또는 로컬)

## 설치

```bash
# 1. 의존성 설치
cd app && npm install
cd ../server && npm install

# 2. 환경변수 설정
cp app/.env.example app/.env.local    # 수정 필요
cp server/.env.example server/.env    # 수정 필요

# 3. Supabase 마이그레이션 (Supabase CLI 사용 시)
supabase db push
```

## 실행

```bash
# 동시 실행 (프론트 :3000 + 서버 :4000)
./start.sh

# 또는 개별 실행
cd app && npm run dev      # http://localhost:3000
cd server && npm run dev   # http://localhost:4000
```

## 환경변수

### Frontend (`app/.env.local`)

| 변수 | 설명 |
|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `NEXT_PUBLIC_TOSS_CLIENT_KEY` | TossPayments 클라이언트 키 |
| `TOSS_PAYMENTS_SECRET_KEY` | TossPayments 시크릿 키 |
| `NEXT_PUBLIC_APP_URL` | 앱 URL (기본: http://localhost:3000) |
| `SNAPCLIP_SERVER_URL` | 백엔드 서버 URL (기본: http://localhost:4000) |

### Backend (`server/.env`)

| 변수 | 설명 |
|------|------|
| `REDIS_URL` | Redis 연결 URL |
| `GEMINI_API_KEY` | Google Gemini API 키 |
| `R2_ACCOUNT_ID` | Cloudflare R2 계정 ID |
| `R2_ACCESS_KEY_ID` | R2 Access Key |
| `R2_SECRET_ACCESS_KEY` | R2 Secret Key |
| `R2_BUCKET_NAME` | R2 버킷 이름 |
| `R2_PUBLIC_URL` | R2 퍼블릭 URL |
| `PORT` | 서버 포트 (기본: 4000) |

## 프로젝트 구조

```
ai-product-video/
├── app/                        # Next.js 15 프론트엔드
│   └── src/
│       ├── app/
│       │   ├── page.tsx        # 랜딩페이지
│       │   ├── create/         # 영상 생성 페이지
│       │   ├── my/             # 내 영상
│       │   ├── pricing/        # 요금제
│       │   ├── login/          # 로그인
│       │   ├── terms/          # 이용약관
│       │   ├── privacy/        # 개인정보처리방침
│       │   └── api/            # Next.js API Routes (서버 프록시)
│       ├── components/         # 공통 컴포넌트
│       └── lib/                # 유틸리티 (Supabase, credits)
├── server/                     # Express 백엔드
│   ├── src/
│   │   ├── index.ts            # Express 서버 엔트리
│   │   ├── queue.ts            # BullMQ 큐 & 워커
│   │   └── logger.ts           # Winston 로거
│   ├── pipeline/               # 영상 생성 파이프라인
│   │   ├── index.ts            # 메인 파이프라인
│   │   ├── preprocess.ts       # 이미지 전처리
│   │   ├── background.ts       # 배경 제거
│   │   ├── copywriter.ts       # AI 카피 (Gemini)
│   │   ├── tts.ts              # TTS (edge-tts)
│   │   ├── composer.ts         # FFmpeg 영상 합성
│   │   └── uploader.ts         # R2 업로드
│   ├── templates/              # 영상 템플릿 (5종)
│   └── assets/                 # BGM, 폰트
├── supabase/
│   └── migrations/
│       └── 001_init.sql        # 전체 DB 스키마
├── start.sh                    # 동시 실행 스크립트
└── README.md
```

## 라이선스

Private — All rights reserved.

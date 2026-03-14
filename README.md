# SnapClip 📸✨

상품 사진 한 장으로 15초 숏폼 광고 영상을 자동 생성하는 AI 서비스

## 주요 기능

- 🖼️ 상품 이미지 업로드 (최대 5장)
- 🎨 5종 템플릿: Simple, Trendy, Luxury, Cute, Dynamic
- 📐 3종 비율: 9:16 (릴스/숏츠), 1:1 (피드), 16:9 (유튜브)
- ✍️ AI 광고 카피 자동 생성 (Gemini)
- 🎵 BGM 자동 삽입
- 📤 실시간 진행률 표시

## 아키텍처

```
Frontend (Next.js)  →  /api/generate  →  Server (Express + FFmpeg)
    :3001                                     :4000
```

## 빠른 시작

### 사전 요구사항

- Node.js 20+
- FFmpeg (`brew install ffmpeg`)

### 설치

```bash
# 프론트엔드
cd app && npm install

# 서버
cd server && npm install
```

### 환경변수

```bash
# app/.env.local (필수)
cp app/.env.example app/.env.local
# NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY 설정

# server/.env (선택 — 없어도 기본 동작)
cp server/.env.example server/.env
# GEMINI_API_KEY 설정 시 AI 카피 생성 활성화
```

### 실행

```bash
./start.sh
# Frontend: http://localhost:3001
# Server:   http://localhost:4000
```

또는 개별 실행:

```bash
# 서버
cd server && npm run dev

# 프론트엔드
cd app && PORT=3001 npm run dev
```

## 영상 구조 (15초)

| 구간 | 시간 | 내용 |
|------|------|------|
| Hook | 0-2초 | 시선을 끄는 카피 |
| Product | 2-5초 | 상품명 표시 |
| Features | 5-9초 | 특징/장점 |
| Price | 9-12초 | 가격 정보 |
| CTA | 12-15초 | 구매 유도 |

## 배포

### 프론트엔드 (Vercel)

```bash
cd app
vercel --prod
```

환경변수:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SNAPCLIP_SERVER_URL` — 배포된 서버 URL

### 서버 (Docker)

```bash
cd server
docker build -t snapclip-server .
docker run -p 4000:4000 \
  -e GEMINI_API_KEY=your-key \
  -e R2_ACCOUNT_ID=your-id \
  -e R2_ACCESS_KEY_ID=your-key \
  -e R2_SECRET_ACCESS_KEY=your-secret \
  snapclip-server
```

## 기술 스택

- **Frontend:** Next.js 16, React 19, Tailwind CSS 4, Supabase Auth
- **Server:** Express, Sharp, FFmpeg, Gemini AI
- **Storage:** Cloudflare R2 (또는 로컬 폴백)
- **결제:** TossPayments

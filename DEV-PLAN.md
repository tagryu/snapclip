# 🎬 AI 상품 영상 서비스 — 개발 계획

> 서비스명 (가칭): **SnapClip**
> 목표: 4주 MVP → 베타 런칭

---

## 기술 스택

| 영역 | 기술 | 이유 |
|------|------|------|
| Frontend | Next.js 15 + Tailwind v4 | 대표님 팀 익숙, SSR+SEO |
| Backend | Supabase (Auth+DB+Storage) | 빠른 개발, 무료 시작 |
| 영상 처리 | FFmpeg (서버사이드) | GPU 불필요, 안정적 |
| AI 카피 | Gemini Flash API | 키 보유, 저렴 |
| 배경 제거 | RMBG-2.0 (ONNX) | 무료, CPU 가능 |
| TTS | Edge-TTS | 무료, 한국어 우수 |
| 영상 저장 | Cloudflare R2 | 이그레스 무료 |
| 배포 | Vercel (프론트) + Railway (영상처리 서버) | |
| 결제 | TossPayments | 한국 시장 |

---

## DB 스키마

```sql
-- 유저
users (
  id uuid PK,
  email text,
  plan text DEFAULT 'free',  -- free/basic/pro/business
  credits_used int DEFAULT 0,
  credits_limit int DEFAULT 3,
  created_at timestamptz
)

-- 프로젝트 (영상 생성 건)
projects (
  id uuid PK,
  user_id uuid FK,
  title text,
  status text DEFAULT 'pending',  -- pending/processing/done/failed
  -- 입력
  product_name text,
  product_price text,
  product_features text[],
  images text[],           -- 원본 이미지 URL
  -- 설정
  template text,           -- simple/trendy/luxury/cute/dynamic
  aspect_ratio text,       -- 9:16 / 1:1 / 16:9
  bgm text,
  voice_enabled boolean DEFAULT false,
  -- AI 생성
  ai_copy text,            -- AI 광고 카피
  -- 결과
  video_url text,
  thumbnail_url text,
  duration_sec int,
  -- 메타
  created_at timestamptz,
  completed_at timestamptz
)

-- 결제
payments (
  id uuid PK,
  user_id uuid FK,
  plan text,
  amount int,
  status text,
  toss_payment_key text,
  created_at timestamptz
)
```

---

## 영상 생성 파이프라인

```
사용자 입력
    │
    ▼
[1] 이미지 전처리 (2초)
    - Sharp: 리사이즈, 품질 보정
    - RMBG-2.0: 배경 제거
    - 배경 교체 (그라데이션/단색/커스텀)
    │
    ▼
[2] AI 카피 생성 (1초)
    - Gemini Flash: 상품 사진 분석
    - 광고 문구 3줄 자동 생성
    - 해시태그 5개 추천
    │
    ▼
[3] 영상 조립 (5~10초)
    - FFmpeg filter_complex:
      · 이미지별 모션 (줌인/아웃/패닝/회전)
      · 전환 효과 (페이드/슬라이드/디졸브)
      · 텍스트 오버레이 (상품명, 가격, 카피)
      · 폰트: Pretendard (한국어 깔끔)
      · BGM 믹싱 (페이드인/아웃)
      · (선택) TTS 나레이션 합성
    - 출력: H.264, AAC, 30fps
    │
    ▼
[4] 후처리 (1초)
    - 썸네일 추출
    - R2 업로드
    - DB 상태 업데이트 → done
    - 웹소켓으로 완료 알림
```

**총 소요시간: 10~15초/건**

---

## 모션 템플릿 5종

### 1. Simple (심플)
```
[사진1 줌인 3초] → [페이드] → [사진2 줌아웃 3초] → [가격+CTA 3초]
자막: 하단 중앙, 흰색, 깔끔
BGM: Lo-fi, 잔잔
```

### 2. Trendy (트렌디)
```
[사진1 빠른줌 2초] → [글리치전환] → [사진2 패닝 2초] → [빠른컷] → [CTA 2초]
자막: 굵은 볼드, 팝업 애니메이션
BGM: 힙합 비트, 에너지
```

### 3. Luxury (고급)
```
[사진1 느린줌 4초] → [부드러운디졸브] → [사진2 느린패닝 4초] → [CTA 3초]
자막: 세리프체, 골드, 미니멀
BGM: 피아노, 우아
```

### 4. Cute (귀여운)
```
[사진1 바운스등장 2초] → [하트전환] → [사진2 회전등장 2초] → [스티커+CTA 3초]
자막: 둥근체, 파스텔, 이모지
BGM: 귀여운 팝
```

### 5. Dynamic (다이나믹)
```
[사진1 빠른회전 1.5초] → [플래시] → [사진2 줌크래시 1.5초] → [가격강조 2초] → [CTA 1초]
자막: 임팩트체, 크게, 흔들림
BGM: EDM 드롭
```

---

## 프로젝트 구조

```
ai-product-video/
├── PLAN.md                    # 기획서
├── DEV-PLAN.md               # 이 파일
├── app/                       # Next.js 앱
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx              # 랜딩페이지
│   │   │   ├── create/page.tsx       # 영상 생성 페이지
│   │   │   ├── my/page.tsx           # 마이페이지 (히스토리)
│   │   │   ├── pricing/page.tsx      # 요금제
│   │   │   ├── login/page.tsx        # 로그인
│   │   │   └── api/
│   │   │       ├── generate/route.ts # 영상 생성 요청
│   │   │       ├── status/route.ts   # 상태 조회
│   │   │       └── payments/
│   │   ├── components/
│   │   │   ├── landing/             # 랜딩 컴포넌트
│   │   │   ├── editor/              # 영상 에디터 UI
│   │   │   │   ├── ImageUploader.tsx
│   │   │   │   ├── TemplateSelector.tsx
│   │   │   │   ├── CopyEditor.tsx
│   │   │   │   ├── PreviewPlayer.tsx
│   │   │   │   └── ExportButton.tsx
│   │   │   └── common/
│   │   ├── lib/
│   │   │   ├── supabase.ts
│   │   │   ├── gemini.ts
│   │   │   └── utils.ts
│   │   └── styles/
│   ├── public/
│   ├── package.json
│   └── next.config.ts
│
├── server/                    # 영상 처리 서버
│   ├── index.ts               # Express + BullMQ Worker
│   ├── pipeline/
│   │   ├── preprocess.ts      # 이미지 전처리
│   │   ├── background.ts      # 배경 제거 (RMBG-2.0)
│   │   ├── copywriter.ts      # Gemini 카피 생성
│   │   ├── composer.ts        # FFmpeg 영상 조립
│   │   ├── tts.ts             # Edge-TTS
│   │   └── uploader.ts        # R2 업로드
│   ├── templates/
│   │   ├── simple.ts
│   │   ├── trendy.ts
│   │   ├── luxury.ts
│   │   ├── cute.ts
│   │   └── dynamic.ts
│   ├── assets/
│   │   ├── bgm/              # 저작권 프리 BGM
│   │   ├── fonts/             # Pretendard 등
│   │   └── overlays/          # 스티커, 프레임
│   ├── package.json
│   └── Dockerfile
│
└── supabase/
    └── migrations/
        └── 001_init.sql
```

---

## 주차별 개발 계획

### 🔵 Week 1: 기반 + 랜딩 (Day 1~7)

**Day 1-2: 프로젝트 셋업**
- [ ] Next.js 15 프로젝트 생성
- [ ] Supabase 프로젝트 생성 + DB 마이그레이션
- [ ] Tailwind v4 + Pretendard 폰트 설정
- [ ] GitHub 레포 생성 + CI/CD

**Day 3-4: 랜딩페이지**
- [ ] 히어로 섹션 (데모 영상 자동재생)
- [ ] 3단계 프로세스 설명 (찍고 → 고르고 → 완성)
- [ ] 요금제 카드
- [ ] 후기/신뢰 섹션
- [ ] 모바일 반응형
- [ ] CTA: "무료로 시작하기"

**Day 5-6: 인증 + 영상 생성 UI**
- [ ] Supabase Auth (구글/카카오 소셜 로그인)
- [ ] 영상 생성 페이지 UI
  - 이미지 업로더 (드래그앤드롭, 최대 5장)
  - 상품 정보 입력 (이름, 가격, 특징)
  - 템플릿 선택 (5종 미리보기)
  - 비율 선택 (9:16 / 1:1 / 16:9)
  - "영상 만들기" 버튼

**Day 7: 마이페이지**
- [ ] 생성 히스토리 리스트
- [ ] 영상 미리보기 + 다운로드
- [ ] 사용량 표시 (3/3 무료)

---

### 🟢 Week 2: 영상 파이프라인 (Day 8~14)

**Day 8-9: 이미지 전처리**
- [ ] Sharp 리사이즈 + 품질 보정
- [ ] RMBG-2.0 ONNX 모델 로드 + 배경 제거
- [ ] 배경 교체 (5가지 그라데이션 프리셋)

**Day 10-11: AI 카피 + TTS**
- [ ] Gemini Flash API 연동
  - 프롬프트: 상품사진+정보 → 광고카피 3줄 + 해시태그
- [ ] Edge-TTS 한국어 음성 생성
- [ ] 카피 수정 UI (AI 생성 → 유저가 편집 가능)

**Day 12-13: FFmpeg 영상 조립**
- [ ] FFmpeg filter_complex 파이프라인
- [ ] 템플릿 5종 구현
  - Ken Burns 효과 (줌인/아웃/패닝)
  - 전환 효과 (xfade 필터)
  - 텍스트 오버레이 (drawtext)
  - BGM 합성 (amix)
- [ ] 3가지 비율 출력

**Day 14: 통합 테스트**
- [ ] 업로드 → 전처리 → AI → 영상 → 저장 전체 파이프라인
- [ ] R2 업로드 + CDN URL
- [ ] 웹소켓 완료 알림

---

### 🟡 Week 3: 결제 + 다듬기 (Day 15~21)

**Day 15-16: 결제**
- [ ] TossPayments 연동
- [ ] 요금제 3종 (Basic/Pro/Business)
- [ ] 크레딧 차감 로직
- [ ] 무료 3건 제한 + 업그레이드 유도 모달

**Day 17-18: UX 개선**
- [ ] 영상 미리보기 플레이어 (인앱)
- [ ] 생성 중 프로그레스 애니메이션
- [ ] 영상 재생성 (설정 변경 후)
- [ ] SNS 공유 버튼 (인스타/틱톡 딥링크)
- [ ] 워터마크 로직 (무료=있음 / 유료=없음)

**Day 19-20: SEO + 퍼포먼스**
- [ ] 메타태그 + OG이미지
- [ ] 구글 서치콘솔 등록
- [ ] 이미지/폰트 최적화
- [ ] 로딩 스켈레톤

**Day 21: 어드민**
- [ ] 간단 어드민 (유저수, 생성수, 매출)
- [ ] 에러 로그 모니터링

---

### 🔴 Week 4: QA + 런칭 (Day 22~28)

**Day 22-23: QA**
- [ ] 전체 플로우 테스트 (회원가입→생성→결제→다운로드)
- [ ] 모바일 테스트 (iOS Safari, Android Chrome)
- [ ] 엣지 케이스 (큰 이미지, 투명 이미지, 텍스트만 등)
- [ ] 속도 최적화 (목표: 15초 이내)

**Day 24-25: 베타 준비**
- [ ] 랜딩페이지 최종 다듬기
- [ ] 이용약관 + 개인정보처리방침
- [ ] 버그 리포트 채널 (카카오톡 오픈채팅 or 디스코드)
- [ ] 샘플 영상 10개 미리 생성 (랜딩용)

**Day 26-27: 베타 런칭**
- [ ] Vercel 프로덕션 배포
- [ ] 커스텀 도메인 연결
- [ ] 스마트스토어 셀러 카페에 베타 테스터 모집 글
- [ ] 인스타그램 계정 생성 + 샘플 영상 게시

**Day 28: 모니터링**
- [ ] 실시간 에러 모니터링
- [ ] 유저 피드백 수집
- [ ] 핫픽스 대응

---

## API 설계

### POST /api/generate
```json
// Request
{
  "images": ["base64..."],
  "product_name": "캐시미어 니트",
  "product_price": "59,000원",
  "features": ["캐시미어 100%", "프리사이즈", "5가지 컬러"],
  "template": "luxury",
  "aspect_ratio": "9:16",
  "voice_enabled": false
}

// Response
{
  "project_id": "uuid",
  "status": "processing",
  "estimated_seconds": 15
}
```

### GET /api/status/:project_id
```json
{
  "project_id": "uuid",
  "status": "done",
  "video_url": "https://r2.snapclip.kr/videos/xxx.mp4",
  "thumbnail_url": "https://r2.snapclip.kr/thumbs/xxx.jpg",
  "ai_copy": "부드러운 촉감, 캐시미어 100%\n매일 입고 싶은 데일리 니트\n지금 59,000원",
  "hashtags": ["#캐시미어니트", "#데일리룩", "#겨울패션"]
}
```

---

## 예상 일정

| 주차 | 기간 | 목표 | 산출물 |
|------|------|------|--------|
| Week 1 | Day 1~7 | 기반+UI | 랜딩+생성페이지+마이페이지 |
| Week 2 | Day 8~14 | 영상 파이프라인 | 실제 영상 생성 동작 |
| Week 3 | Day 15~21 | 결제+완성도 | 결제 가능, 프로덕션급 UX |
| Week 4 | Day 22~28 | QA+런칭 | 베타 서비스 오픈 |

---

## 시작 전 필요한 것

- [ ] 서비스명 확정 (SnapClip? 다른 이름?)
- [ ] 도메인 구매
- [ ] Supabase 프로젝트 생성
- [ ] Cloudflare R2 버킷 생성
- [ ] 저작권 프리 BGM 5곡 확보
- [ ] 샘플 상품 이미지 10세트 준비 (테스트용)

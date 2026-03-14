# SnapClip 크레딧 시스템 설정 가이드

## ✅ 완료된 작업

### 1. Supabase DB 마이그레이션
- `supabase/migrations/001_init.sql` 생성됨
- profiles, credit_transactions, videos 테이블 정의
- RLS 정책 및 auth trigger 설정
- 신규 가입 시 1크레딧 보너스 자동 지급

### 2. 크레딧 충전 요금제 페이지
- `app/src/app/pricing/page.tsx` 완전 재작성
- 월정액 → 크레딧 충전 패키지로 변경
  - 5크레딧: ₩15,000 (개당 ₩3,000)
  - 20크레딧: ₩50,000 (개당 ₩2,500, 17% 할인)
  - 50크레딧: ₩100,000 (개당 ₩2,000, 33% 할인)

### 3. 토스페이먼츠 결제 연동
- `@tosspayments/tosspayments-sdk` 패키지 설치 완료
- `app/src/app/api/payments/confirm/route.ts` - 결제 승인 API
- `app/src/app/payments/success/page.tsx` - 결제 성공 페이지
- `app/src/app/payments/fail/page.tsx` - 결제 실패 페이지

### 4. 영상 생성 API + 크레딧 차감
- `app/src/app/api/generate/route.ts` 수정
- 크레딧 잔액 확인 → 1크레딧 차감 → videos 테이블 기록
- 백엔드 서버로 영상 생성 요청 전달

### 5. 마이페이지 실데이터 연동
- `app/src/app/my/page.tsx` 수정
- profiles 테이블에서 크레딧 잔액 조회
- videos 테이블에서 영상 목록 조회

### 6. 랜딩페이지 수정
- `app/src/app/page.tsx` 수정
- "무료로 시작하기" → "영상 만들기"
- 요금제 섹션: 크레딧 충전 패키지 반영

### 7. NavBar 로그인 상태
- `app/src/components/NavBar.tsx` 수정
- 로그인 시 크레딧 잔액 표시
- 드롭다운 메뉴: 마이페이지, 크레딧 충전, 로그아웃

---

## 🔧 필수 설정 작업

### 1. Supabase 마이그레이션 실행

```bash
cd /Users/tag/.openclaw/workspace/ai-product-video

# Supabase CLI로 마이그레이션 실행
supabase db push

# 또는 Supabase 대시보드에서 SQL Editor로 직접 실행
# supabase/migrations/001_init.sql 파일의 내용을 복사해서 실행
```

### 2. Supabase Service Role Key 설정

**중요:** 현재 `.env.local`에 플레이스홀더 키가 들어있습니다. 반드시 실제 키로 교체하세요!

1. Supabase 대시보드 접속: https://supabase.com/dashboard/project/pfczvkkavzavryylovcy
2. Settings → API → Project API keys
3. `service_role` 키 복사 (secret 키, 절대 클라이언트에 노출 금지!)
4. `app/.env.local` 파일 수정:

```bash
SUPABASE_SERVICE_ROLE_KEY=실제_service_role_키를_여기에_붙여넣기
```

### 3. 토스페이먼츠 키 설정

**현재 테스트 키가 설정되어 있습니다. 실제 운영 전에 반드시 교체하세요!**

1. 토스페이먼츠 개발자센터: https://developers.tosspayments.com/
2. 내 앱 → API 키 발급
3. `app/.env.local` 파일 수정:

```bash
# 테스트 키 (개발용)
NEXT_PUBLIC_TOSS_CLIENT_KEY=test_ck_실제_클라이언트_키
TOSS_PAYMENTS_SECRET_KEY=test_sk_실제_시크릿_키

# 실제 운영 시에는 라이브 키로 변경
NEXT_PUBLIC_TOSS_CLIENT_KEY=live_ck_...
TOSS_PAYMENTS_SECRET_KEY=live_sk_...
```

### 4. Supabase Storage 설정 (선택)

영상 생성 시 이미지를 Storage에 업로드하려면:

1. Supabase 대시보드 → Storage
2. `product-images` 버킷 생성
3. Public 접근 허용 설정

---

## 🚀 실행 방법

### 개발 환경

```bash
cd app
npm install
npm run dev
```

브라우저에서 http://localhost:3000 접속

### 프로덕션 빌드

```bash
cd app
npm run build
npm start
```

---

## 📋 테스트 체크리스트

### 1. 회원가입 및 보너스 크레딧
- [ ] 회원가입 완료 시 profiles 테이블에 레코드 생성됨
- [ ] 초기 크레딧 1개 지급됨
- [ ] credit_transactions에 보너스 내역 기록됨

### 2. 크레딧 충전
- [ ] /pricing 페이지 접속
- [ ] 패키지 선택 → 토스페이먼츠 결제창 오픈
- [ ] 테스트 카드로 결제 완료
- [ ] /payments/success 페이지로 리다이렉트
- [ ] profiles.credits 증가 확인
- [ ] credit_transactions에 purchase 내역 기록

### 3. 영상 생성 및 크레딧 차감
- [ ] /create 페이지 접속
- [ ] 크레딧 부족 시 충전 모달 표시
- [ ] 영상 생성 시 1크레딧 차감
- [ ] credit_transactions에 usage 내역 기록
- [ ] videos 테이블에 레코드 생성 (status: pending)

### 4. 마이페이지
- [ ] /my 페이지에서 크레딧 잔액 표시
- [ ] 영상 목록 조회 (videos 테이블)
- [ ] 충전 버튼 → /pricing 이동

### 5. NavBar
- [ ] 로그인 시 크레딧 잔액 표시
- [ ] 드롭다운 메뉴 동작 확인
- [ ] 로그아웃 기능

---

## ⚠️ 주의사항

1. **환경변수 보안**
   - `SUPABASE_SERVICE_ROLE_KEY`와 `TOSS_PAYMENTS_SECRET_KEY`는 절대 클라이언트에 노출되지 않도록 주의
   - Git에 커밋하지 않도록 `.gitignore` 확인

2. **RLS 정책**
   - profiles, credit_transactions, videos 테이블 모두 RLS 활성화됨
   - API에서는 service_role 키로 RLS 우회
   - 클라이언트에서는 RLS 정책에 따라 자신의 데이터만 접근 가능

3. **결제 테스트**
   - 개발 중에는 토스페이먼츠 테스트 키 사용
   - 테스트 카드 정보: https://docs.tosspayments.com/resources/test-cards
   - 실제 운영 전에 반드시 라이브 키로 교체

4. **백엔드 서버 연동**
   - 영상 생성 API는 `SNAPCLIP_SERVER_URL`로 설정된 백엔드 서버와 통신
   - 백엔드 서버에서 영상 완성 시 videos 테이블 업데이트 필요 (status: completed, video_url 등)

---

## 🎨 디자인 테마

모든 UI는 **라이트 테마 + 인스타 그라데이션** 유지:
- 그라데이션: `from-orange-500 via-pink-500 to-purple-600`
- 한국어 UI
- Tailwind CSS 사용

---

## 📞 문제 발생 시

1. **빌드 실패**: TypeScript 에러 확인
2. **DB 마이그레이션 오류**: Supabase 대시보드 SQL Editor에서 직접 실행
3. **결제 오류**: 토스페이먼츠 콘솔에서 로그 확인
4. **크레딧 차감 안됨**: service_role 키 확인

---

## ✨ 다음 단계

1. 백엔드 서버와 완전 연동
2. 실제 영상 생성 파이프라인 테스트
3. 토스페이먼츠 웹훅 구현 (결제 확인 이중화)
4. 관리자 대시보드 (크레딧 수동 지급, 환불 처리 등)
5. 이메일 알림 (결제 완료, 영상 생성 완료 등)

---

**작업 완료일**: 2026-03-14  
**빌드 상태**: ✅ 성공

# 🤖 AI 패션 광고 제작 최신 기술

> 소스: "How to Make Fashion Ads with AI (MIND BLOWING)" (38K views), GenSpace/Nano Banana Pro 워크플로우

---

## AI 패션 광고 워크플로우 (2026 최신)

### 전체 파이프라인
```
1. 캐릭터(모델) 설정 → AI에 외형 정의
2. 의류/브랜딩 요소 업로드 → 상품 이미지
3. 배경/로케이션 설정 → 장소+분위기
4. 이미지 생성 → 다양한 포즈/앵글
5. 영상 생성 → AI 이미지 → 모션
6. 편집 + 사운드 → 최종 광고
```

### 핵심 기술 스택
- **Gemini 2.5-flash-image / 3-pro-image**: 이미지 생성+편집
- **Imagen 4.0**: 고품질 이미지
- **LTX / Runway / Kling**: 이미지→영상
- **GenSpace**: 캐릭터 일관성 + 의류 매핑
- **Topview AI + Sora 2**: 바이럴 영상 레퍼런스 기반 재생성

---

## AI 모델 + 의류 합성 기법

### 캐릭터 일관성 유지
1. **요소(Element) 저장**: 캐릭터 외형을 프리셋으로 저장
2. **참조 이미지**: 동일 캐릭터의 기본 이미지 업로드
3. **의류 요소 분리**: 상품을 별도 요소로 등록
4. **프롬프트 규칙**: "캐릭터 [이름] wearing [의류 요소명]"

### 효과적인 프롬프트 패턴
```
패션 에디토리얼:
"fashion editorial shoot, casual pose, [character] wearing [clothing],
[location], natural lighting, shot on analog film"

스트릿 스냅:
"street style photography, [character] wearing [clothing],
urban background, candid shot, golden hour lighting"

스튜디오:
"studio fashion photography, clean white background,
[character] wearing [clothing], full body shot, soft lighting"

시네마틱:
"cinematic fashion film still, [character] wearing [clothing],
dramatic lighting, shallow depth of field, moody atmosphere"
```

### 주의사항
- 브랜딩(로고/패턴)은 AI가 변형할 수 있음 → 후보정 필요
- 얼굴 일관성은 아직 완벽하지 않음 → 여러 장 생성 후 선택
- 복잡한 의류(드레이프, 주름)는 품질 불균일

---

## 이미지 → 영상 변환 기법

### 카메라 무브 프롬프트
```
Slow dolly forward: 천천히 다가가는 느낌 (luxury)
Pan left to right: 파노라마 (환경 소개)
Low angle crane up: 아래→위 (힘/존재감)
Orbit shot: 모델 주위 회전 (360도)
Static with subtle movement: 정지 + 머리카락/옷 바람 (감성)
```

### 영상 품질 팁
- 4K 생성 → 1080p 다운스케일 (디테일 유지)
- 2-4초 클립으로 생성 → 편집에서 연결
- 여러 각도 생성 → 최적 선택
- 모션 과도하면 부자연스러움 → 미세한 움직임이 안전

---

## SnapClip 적용 방향

### Phase 1 (현재) — 정적 이미지 + 모션
- Gemini로 배경 합성 + 멀티앵글 생성
- FFmpeg으로 줌/패닝/전환 모션 추가
- 텍스트 오버레이 + BGM

### Phase 2 — AI 모델 착용
- 상품 이미지 + AI 모델 캐릭터 합성
- 다양한 체형/포즈/배경 자동 생성
- 이미지→영상(Gemini video or LTX)

### Phase 3 — 레퍼런스 기반 재생성
- 인기 영상 구조 분석 → 유사 영상 자동 생성
- 바이럴 포맷 템플릿화
- A/B 테스트 자동 생성

---

## AI 광고 성과 데이터

### AI vs 사람 비교 (2026 기준)
| 지표 | 사람 제작 | AI 제작 |
|------|---------|---------|
| 제작 비용 | $500-5,000/건 | $1-10/건 |
| 제작 시간 | 1-2주 | 5-30분 |
| 전환율 (CTR) | 2-4% | 1.5-3% (향상 중) |
| A/B 변형 생성 | 2-3개 | 10-50개 |
| 브랜드 일관성 | 높음 | 중간 (향상 중) |

### 핵심: AI의 진짜 장점 = 볼륨
- 10개 변형을 빠르게 만들어서 테스트
- 전환율 높은 포맷 발견 → 그걸로 집중
- 사람은 "최적 1개", AI는 "다수 테스트 후 선택"

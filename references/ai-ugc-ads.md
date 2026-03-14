# 🤳 AI UGC 광고 제작 최신 워크플로우 (2026)

> 소스: "How to Create AI UGC Ads That Get 3.6x ROAS" (236K views), "How to Make Viral AI UGC Ads in 2026" (71K views), "Create Realistic AI UGC Ads from Viral Videos" (143K views)

---

## 3.6x ROAS AI UGC 광고 5단계 워크플로우

### Step 1: AI 아바타 생성
- **Nano Banana Pro** → 일관된 AI 캐릭터 생성
- 다양한 포즈/표정/의상으로 여러 장 생성
- 📌 SnapClip: Gemini 이미지 생성으로 대체 가능

### Step 2: 샷 리스트 작성 (GPT 활용)
커스텀 GPT로 자동 생성:
```
Shot 1 (Hook): Close-up, model looks surprised
Shot 2 (A-roll): Model talks to camera, holding product
Shot 3 (B-roll): Product close-up detail
Shot 4 (A-roll): Model demonstrates product
Shot 5 (Social proof): Before/After or review
Shot 6 (CTA): Model holds product, text overlay
```
- A-roll = 사람이 카메라 보며 말하는 장면
- B-roll = 상품/디테일/사용 장면

### Step 3: Image-to-Video (각 샷 생성)
- 각 이미지를 Veo/Kling으로 영상 클립 변환
- **첫 프레임 제어**: 이미지를 first frame으로 지정
- 프롬프트에 카메라 무브 + 액션 상세 기술

### Step 4: 보이스오버 추가
- AI TTS로 스크립트 읽기
- 또는 실제 목소리 녹음
- CapCut 보이스 체인저로 다양한 톤 생성 가능

### Step 5: 편집 (CapCut/FFmpeg)
- 클립 연결 + 트리밍
- 자막 추가 (자동 생성)
- BGM + SFX
- 텍스트 오버레이 (가격/CTA)
- 컬러 그레이딩

---

## AI 광고 주요 포맷 (전환율순)

### 1. AI UGC 리뷰 (전환율 최고)
```
[Hook] "이거 진짜 대박인데..."
[Problem] "원래 OO가 고민이었는데"
[Solution] "이 제품 써보니까 완전 달라졌어요"
[Proof] 사용 전/후 비교
[CTA] "링크 타고 가세요!"
```

### 2. 제품 언박싱
```
[Hook] 택배 도착 장면
[Unbox] 패키지 오픈 (ASMR)
[Reveal] "와 이게 이 가격이라고?"
[Detail] 클로즈업 디테일
[CTA] "품절 전에 서두르세요"
```

### 3. 비교 광고
```
[Hook] "A vs B, 직접 비교해봤습니다"
[Old] 기존 제품 문제점
[New] 우리 제품 장점
[Proof] 나란히 비교
[CTA] "직접 확인해보세요"
```

---

## JSON 프롬프팅으로 정밀 제어 ⭐

Veo 3/3.1에서 JSON 형식 프롬프트로 영상 시퀀스 제어:

### 상품 광고용 JSON 템플릿
```json
{
  "style": "Fashion commercial, cinematic, warm tones",
  "shots": [
    {
      "shot": 1,
      "duration": "2s",
      "camera": "Dramatic close-up, rack focus",
      "subject": "Product on marble surface",
      "lighting": "Golden hour, side light",
      "action": "Camera reveals product texture",
      "audio": "Soft atmospheric music begins"
    },
    {
      "shot": 2,
      "duration": "3s",
      "camera": "Medium shot, slow orbit left",
      "subject": "Full product view",
      "lighting": "Soft diffused light",
      "action": "Product slowly rotates on display",
      "audio": "Music builds"
    },
    {
      "shot": 3,
      "duration": "3s",
      "camera": "Wide shot, dolly back",
      "subject": "Product in lifestyle setting",
      "lighting": "Natural ambient",
      "action": "Reveal full scene context",
      "audio": "Music peaks, resolution"
    }
  ]
}
```

---

## SnapClip 적용 방향

### 자동화 파이프라인
1. 상품 이미지 업로드
2. Gemini 분석 → 카테고리/특성/추천 장면 자동 파악
3. 카테고리별 샷 리스트 자동 생성 (JSON 프롬프트)
4. Gemini로 각 샷의 이미지 생성 (배경합성/모델착용)
5. Veo 3.1로 각 이미지 → 영상 클립 변환
6. FFmpeg로 클립 연결 + 텍스트/음악 편집
7. 최종 영상 출력

### 차별점
- **원클릭**: 사진 1장 → 완성 광고 영상
- **다중 카테고리**: 패션, 뷰티, 전자, 식품, 리빙
- **한국어 최적화**: 한국 시장 카피/자막
- **JSON 프롬프팅**: 정밀한 샷 시퀀스 제어

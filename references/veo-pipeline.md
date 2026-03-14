# 🎥 Veo 영상 생성 파이프라인

> 소스: Google Veo API 실전 테스트 + "How To Use Google VEO 3 JSON Prompting To Create $100k AI Ads" (309K views) + "Best AI Video Generators in 2026" (461K views)

---

## 사용 가능한 모델

| 모델 | API 이름 | 오디오 | 비고 |
|------|---------|--------|------|
| Veo 2 | `veo-2.0-generate-001` | ❌ | 안정적, 가장 저렴 |
| Veo 3 | `veo-3.0-generate-001` | ✅ | 오디오 생성 |
| Veo 3 fast | `veo-3.0-fast-generate-001` | ✅ | 빠르지만 품질↓ |
| Veo 3.1 | `veo-3.1-generate-preview` | ✅ | 최신, 최고 품질 |
| Veo 3.1 fast | `veo-3.1-fast-generate-preview` | ✅ | 빠른 버전 |

**모두 Gemini API 키로 사용 가능** (Vertex AI 불필요!)

## API 사용법

### Text-to-Video
```json
POST /v1beta/models/veo-3.1-generate-preview:predictLongRunning?key=API_KEY
{
  "instances": [{
    "prompt": "Camera slowly dolly forward..."
  }],
  "parameters": {
    "aspectRatio": "9:16",
    "sampleCount": 1
  }
}
```

### Image-to-Video (핵심!)
```json
{
  "instances": [{
    "prompt": "Camera motion description...",
    "image": {
      "bytesBase64Encoded": "BASE64_IMAGE",
      "mimeType": "image/png"
    }
  }],
  "parameters": {
    "aspectRatio": "9:16",
    "sampleCount": 1
  }
}
```

### 결과 폴링 (비동기)
```
GET /v1beta/models/{model}/operations/{op_id}?key=API_KEY
→ done: true → response.generateVideoResponse.generatedSamples[0].video.uri
→ URI + &key=API_KEY로 다운로드
```

## 생성 스펙
- 해상도: 720x1280 (9:16)
- 길이: 8초 (기본)
- FPS: 24
- 코덱: H.264 + AAC (Veo 3+)
- 생성 시간: ~30-90초

---

## JSON 프롬프팅 (고급) ⭐

Veo 3에서 JSON 형식으로 샷 시퀀스를 정밀 제어할 수 있음:

```json
{
  "shots": [
    {
      "shot_number": 1,
      "duration": "2 seconds",
      "camera": "Close-up, slow dolly forward",
      "action": "Product sits on table, warm light hits fabric",
      "audio": "Soft ambient music, fabric rustling"
    },
    {
      "shot_number": 2,
      "duration": "3 seconds",
      "camera": "Medium shot, orbit right",
      "action": "Hand reaches for product, picks it up",
      "audio": "Music builds slightly"
    }
  ]
}
```

→ JSON을 프롬프트 텍스트에 포함하면 Veo가 해석

---

## SnapClip 새 파이프라인

### Before (이미지 슬라이드쇼)
```
상품사진 → Gemini(배경합성) → FFmpeg(줌/패닝) → 슬라이드쇼
```

### After (진짜 AI 영상)
```
상품사진 → Gemini(배경합성/모델착용 이미지)
→ Veo 3.1(이미지→영상 클립 2-3개, 각 8초)
→ FFmpeg(클립 편집: 트리밍/연결/텍스트/음악)
→ 최종 15-30초 광고 영상
```

### 클립 생성 전략 (15초 영상)
1. **훅 클립** (0-5초): 상품 클로즈업 → Veo "dramatic zoom, product detail"
2. **메인 클립** (5-10초): 라이프스타일 → Veo "model walking, wearing product"
3. **CTA 클립** (10-15초): 브랜드 + 가격 → FFmpeg 텍스트 오버레이

### 비용 추정
- 15초 영상 = 2-3 Veo 클립
- Gemini 이미지 2-3장 + Veo 영상 2-3개
- 총 ~$0.5-2.0/영상 (예상, 정확한 가격 확인 필요)

---

## 프롬프트 패턴 (카테고리별)

### 패션/의류
```
Cinematic slow dolly forward. [Product] displayed elegantly on [surface].
Fabric gently moves in soft breeze. Warm golden hour lighting.
Shallow depth of field. Fashion commercial quality.
```

### 화장품/뷰티
```
Close-up beauty shot. Hand gently applies [product] on skin.
Dewy, glowing texture visible. Soft diffused lighting.
ASMR-quality detail. Clean white/marble background.
```

### 전자제품
```
Dramatic reveal shot. [Product] emerges from shadow.
LED indicator glows. Reflective surface catches light.
Tech commercial style. Dark premium background.
```

### 식품
```
Overhead shot. Steam rises from [product]. 
Fresh ingredients visible. Warm kitchen lighting.
Food photography style. Appetizing close-up detail.
```

### 홈/리빙
```
Slow pan across [product] in modern living space.
Natural daylight through window. Minimalist aesthetic.
Interior design magazine style.
```

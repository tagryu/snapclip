# ✂️ 숏폼 영상 편집 테크닉 마스터

> 소스: "The Ultimate Guide to Short-Form Video Editing" (652K views), "How to Edit Viral Reels in 2025" (1M views), "15 BEST CapCut Tricks" (1.6M views)

---

## 핵심 편집 원칙

### Speed to Value (가치 전달 속도)
- 모든 프레임이 정보/가치를 전달해야 함
- **Dead space(빈 시간) = 이탈** → 침묵/정적 구간 즉시 컷
- 말하기 전 침묵 컷 + 말한 직후 오버랩
- 15초 안에 최대한 많은 가치 압축

### 바이럴 영상의 편집 공통점
1. **1.5-2초마다 시각 변화** (컷/줌/텍스트)
2. **음악 비트 싱크** (컷 전환 = 비트 포인트)
3. **텍스트 = 음성과 동기화** (자막이 말 타이밍에 맞춤)
4. **줌인/줌아웃 반복** (시선 유지)
5. **사운드 이펙트** (전환마다 whoosh/hit/pop)

---

## 모션 테크닉 상세

### 1. Zoom (줌)
```
Slow Zoom In: 5초에 걸쳐 5-10% 확대 (Ken Burns)
→ 용도: luxury, 제품 디테일, 감성적 순간

Fast Zoom In: 0.2초에 30-50% 확대
→ 용도: 강조, 임팩트 순간, 숫자/가격 표시

Zoom Punch: 빠르게 줌인 → 바로 줌아웃
→ 용도: 놀라움, 리액션, 전환점
```

### 2. Camera Shake (흔들림)
```
미세 흔들림: 3-5px (자연스러운 핸드헬드 느낌)
→ 용도: UGC 느낌, 친근함

강한 흔들림: 8-15px (임팩트)
→ 용도: 강조 순간, 에너지 전달
```

### 3. Speed Ramping (속도 변화)
```
슬로우 → 노멀: 0.5x → 1x (강조 후 진행)
노멀 → 패스트: 1x → 2x (지루한 구간 빠르게)
패스트 → 슬로우 → 패스트: 2x → 0.3x → 2x (하이라이트 순간)
```

### 4. Transitions (전환 효과)
```
Hard Cut: 즉시 전환 (가장 기본, 빠른 리듬)
Cross Dissolve: 0.3-0.5초 겹침 (부드러운 전환)
Zoom Transition: 줌인으로 전환 (TikTok 네이티브)
Whip Pan: 빠른 좌우 스와이프 (에너지)
Glitch: RGB 시프트 + 프레임 스킵 (테크/트렌디)
Swipe: 밀어내기 (슬라이드쇼 느낌)
Match Cut: 같은 위치/동작에서 장면 전환 (고급)
```

### 5. B-Roll 삽입
```
주 영상(A-Roll) 사이에 보조 영상(B-Roll) 삽입
→ 상품 클로즈업, 사용 장면, 환경 샷
→ 1-2초 짧게, A-Roll과 교차
→ 정보 밀도 증가 + 시각 변화
```

---

## 텍스트 애니메이션

### 효과별 분류
```
Pop Up: scale 0 → 1 (0.15초) → 약간 바운스
→ 가장 많이 사용, 에너지 있음

Typing: 글자 하나씩 타이핑 (0.05초/글자)
→ 궁금증 유발, 스토리텔링

Slam: 위에서 떨어짐 + 흔들림
→ 강한 임팩트, 가격/숫자

Slide In: 좌/우에서 슬라이드
→ 리스트형 정보 나열

Fade In: 투명→불투명 (0.3초)
→ luxury, 차분한 무드

Highlight/Underline: 키워드 아래 형광펜 효과
→ 핵심 단어 강조
```

### 자막 스타일 (2025-2026 트렌드)
- **Bold + 배경 없음** (깔끔, 최신 트렌드)
- 키워드만 **컬러 변경** (노랑/빨강/초록)
- **1-2줄** 최대 (3줄 이상 X)
- 위치: **화면 중앙** (하단 아님 — 플랫폼 UI 겹침)
- 크기: 화면 너비의 80%+

---

## 사운드 디자인

### 사운드 이펙트 타이밍
```
텍스트 등장 → Pop/Click 효과
장면 전환 → Whoosh 효과
강조 순간 → Hit/Impact 효과
숫자 표시 → Cash register/Ding 효과
리스트 포인트 → 각 포인트마다 작은 효과음
```

### BGM 선택 규칙
| 템플릿 | BPM | 스타일 | 비트 싱크 |
|--------|-----|--------|----------|
| Simple | 100-120 | 라이트 팝, 미니멀 | 텍스트 타이밍 |
| Trendy | 128-140 | 트렌딩 사운드, 힙합 | 모든 컷 = 비트 |
| Luxury | 60-80 | 앰비언트, 피아노 | 느슨하게 |
| Cute | 110-130 | 큐트 팝, 효과음 다수 | 바운스 리듬 |
| Dynamic | 140-160 | 트랩, EDM | 임팩트 = 드롭 |

### 비트 싱크 방법
1. 음악의 킥/스네어 위치 파악
2. 컷 전환을 비트 포인트에 맞춤
3. 텍스트 등장도 비트에 맞춤
4. **비트 싱크된 영상 = 시청 완료율 30%+ 증가**

---

## SnapClip FFmpeg 구현 매핑

### 현재 → 목표
| 테크닉 | 현재 (FFmpeg) | 목표 |
|--------|-------------|------|
| Zoom | ❌ 없음 | zoompan 필터 |
| Shake | ❌ 없음 | random offset overlay |
| Speed Ramp | ❌ 없음 | setpts 필터 |
| Transitions | ❌ 하드컷만 | xfade 필터 |
| Text Anim | ❌ 정적 텍스트 | drawtext + enable 타이밍 |
| Sound FX | ❌ 없음 | amix + adelay |
| Beat Sync | ❌ 없음 | 비트 감지 → 컷 타이밍 자동화 |

### FFmpeg 핵심 필터
```bash
# Zoom (Ken Burns)
zoompan=z='min(zoom+0.001,1.1)':d=150:s=1080x1920

# Camera Shake
crop=in_w-10:in_h-10:5+random(0)*5:5+random(1)*5

# Speed Ramp
setpts='if(between(T,2,3),2*PTS,PTS)'

# Cross Dissolve
xfade=transition=fade:duration=0.5:offset=3

# Text with timing
drawtext=text='핵심 특징':enable='between(t,2,5)':fontsize=48:fontcolor=white
```

export default function Home() {
  const steps = [
    { num: "01", title: "찍고", desc: "상품 사진을 업로드하세요", icon: "📸" },
    { num: "02", title: "고르고", desc: "템플릿과 스타일을 선택하세요", icon: "🎨" },
    { num: "03", title: "완성", desc: "AI가 15초 숏폼 영상을 만들어요", icon: "✨" },
  ];

  const demos = [
    { category: "패션", product: "오버사이즈 니트", color: "from-rose-500/20 to-orange-500/20" },
    { category: "뷰티", product: "수분 크림", color: "from-sky-500/20 to-violet-500/20" },
    { category: "리빙", product: "캔들 세트", color: "from-amber-500/20 to-emerald-500/20" },
  ];

  const plans = [
    { name: "Free", price: "₩0", videos: "3개/월", desc: "가볍게 시작하기", features: ["워터마크 포함", "720p 해상도", "기본 템플릿 3종"], cta: "무료로 시작하기", highlight: false },
    { name: "Basic", price: "₩9,900", videos: "30개/월", desc: "성장하는 셀러를 위해", features: ["워터마크 제거", "1080p 해상도", "전체 템플릿", "AI 카피라이팅"], cta: "Basic 시작하기", highlight: true },
    { name: "Pro", price: "₩29,900", videos: "무제한", desc: "프로 셀러 & 마케터", features: ["모든 Basic 기능", "4K 해상도", "커스텀 브랜딩", "우선 렌더링", "API 액세스"], cta: "Pro 시작하기", highlight: false },
  ];

  const faqs = [
    {
      q: "어떤 상품 사진이 가장 잘 나오나요?",
      a: "배경이 깔끔한 정면 사진이 가장 좋은 결과를 만듭니다. AI가 자동으로 배경을 제거하기 때문에, 흰 배경 또는 단색 배경의 고해상도 사진을 추천합니다.",
    },
    {
      q: "영상 생성에 시간이 얼마나 걸리나요?",
      a: "보통 30초~1분 이내에 완성됩니다. 이미지 수, 선택한 템플릿, 서버 상태에 따라 다소 차이가 있을 수 있습니다.",
    },
    {
      q: "생성된 영상을 상업적으로 사용해도 되나요?",
      a: "네, 생성된 영상의 저작권은 회원에게 귀속됩니다. SNS 광고, 쇼핑몰, 마켓플레이스 등 자유롭게 상업적 활용이 가능합니다.",
    },
    {
      q: "무료 플랜과 유료 플랜의 차이는 무엇인가요?",
      a: "무료 플랜은 월 3개의 영상을 720p + 워터마크로 생성할 수 있습니다. Basic 이상에서는 워터마크 제거, 1080p 이상 해상도, 전체 템플릿 접근이 가능합니다.",
    },
    {
      q: "환불 정책은 어떻게 되나요?",
      a: "결제 후 7일 이내 크레딧을 사용하지 않았다면 전액 환불이 가능합니다. 부분 사용 시에는 잔여분 일할 계산 환불을 지원합니다.",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative px-4 pt-24 pb-20 md:pt-36 md:pb-32 text-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(124,58,237,0.15)_0%,_transparent_70%)]" />
        <div className="relative max-w-3xl mx-auto">
          <div className="inline-block px-3 py-1 mb-6 text-xs font-medium rounded-full border border-card-border text-muted">
            🚀 AI 숏폼 영상 생성 서비스
          </div>
          <h1 className="text-4xl md:text-6xl font-bold leading-tight tracking-tight mb-6">
            상품 사진 한 장이면,
            <br />
            <span className="gradient-text">15초 숏폼 광고</span>가 나온다
          </h1>
          <p className="text-lg md:text-xl text-muted mb-10 max-w-xl mx-auto">
            사진 업로드부터 완성까지 단 30초.
            <br />
            AI가 만드는 프로급 상품 영상.
          </p>
          <a
            href="/create"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full gradient-bg text-white font-semibold text-lg hover:opacity-90 transition-opacity shadow-lg shadow-purple-500/25"
          >
            무료로 시작하기
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
          </a>
          {/* Trust indicator */}
          <p className="mt-6 text-sm text-muted">
            ⭐ <strong className="text-foreground">1,000+</strong> 셀러가 사용 중
          </p>
        </div>
      </section>

      {/* Demo: Before → After */}
      <section className="px-4 py-20 md:py-28">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">이렇게 변합니다</h2>
          <p className="text-muted text-center mb-14">상품 사진 한 장 → AI 숏폼 영상</p>
          <div className="grid md:grid-cols-3 gap-8">
            {demos.map((demo) => (
              <div key={demo.product} className="rounded-2xl bg-card border border-card-border p-5 card-glow">
                <p className="text-xs text-accent-purple font-medium mb-3">{demo.category}</p>
                <div className="flex items-center gap-3 mb-4">
                  {/* Before */}
                  <div className={`flex-1 aspect-square rounded-xl bg-gradient-to-br ${demo.color} flex items-center justify-center`}>
                    <span className="text-3xl">📷</span>
                  </div>
                  <div className="text-muted text-xl">→</div>
                  {/* After */}
                  <div className={`flex-1 aspect-[9/16] rounded-xl bg-gradient-to-br ${demo.color} flex items-center justify-center border border-accent-purple/30`}>
                    <span className="text-2xl">🎬</span>
                  </div>
                </div>
                <p className="text-sm font-medium text-center">{demo.product}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="px-4 py-20 md:py-28">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">어떻게 만들어지나요?</h2>
          <p className="text-muted text-center mb-14">세 단계면 충분합니다</p>
          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((step) => (
              <div key={step.num} className="relative p-6 rounded-2xl bg-card border border-card-border card-glow transition-all duration-300">
                <div className="text-4xl mb-4">{step.icon}</div>
                <div className="text-xs font-mono text-accent-purple mb-2">{step.num}</div>
                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                <p className="text-muted text-sm">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="px-4 py-20 md:py-28">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">요금제</h2>
          <p className="text-muted text-center mb-14">무료로 시작하고, 필요할 때 업그레이드하세요</p>
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative p-6 rounded-2xl border transition-all duration-300 card-glow ${
                  plan.highlight
                    ? "bg-card border-accent-purple/50 shadow-lg shadow-purple-500/10"
                    : "bg-card border-card-border"
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 text-xs font-medium rounded-full gradient-bg text-white">
                    인기
                  </div>
                )}
                <h3 className="text-lg font-bold mb-1">{plan.name}</h3>
                <p className="text-xs text-muted mb-4">{plan.desc}</p>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-sm text-muted">/월</span>
                </div>
                <p className="text-sm text-accent-purple font-medium mb-6">영상 {plan.videos}</p>
                <ul className="space-y-2.5 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-muted">
                      <svg className="w-4 h-4 text-accent-purple shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <a
                  href="/create"
                  className={`block text-center py-2.5 rounded-xl text-sm font-medium transition-all ${
                    plan.highlight
                      ? "gradient-bg text-white hover:opacity-90"
                      : "bg-card-border text-foreground hover:bg-card-border/80"
                  }`}
                >
                  {plan.cta}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-4 py-20 md:py-28">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">자주 묻는 질문</h2>
          <p className="text-muted text-center mb-14">궁금한 점이 있으신가요?</p>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <details key={faq.q} className="group rounded-2xl bg-card border border-card-border p-5">
                <summary className="flex items-center justify-between cursor-pointer list-none font-medium">
                  {faq.q}
                  <span className="ml-4 text-muted group-open:rotate-45 transition-transform text-xl leading-none">+</span>
                </summary>
                <p className="mt-3 text-sm text-muted leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-20 md:py-28 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">지금 바로 시작하세요</h2>
          <p className="text-muted mb-8">무료로 3개의 영상을 만들어보세요. 카드 등록 없이 시작할 수 있습니다.</p>
          <a
            href="/create"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full gradient-bg text-white font-semibold text-lg hover:opacity-90 transition-opacity shadow-lg shadow-purple-500/25"
          >
            무료로 시작하기
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
          </a>
        </div>
      </section>
    </div>
  );
}

export default function Home() {
  const steps = [
    { num: "01", title: "찍고", desc: "상품 사진을 업로드하세요", icon: "📸", gradient: "from-blue-500/20 to-cyan-500/20" },
    { num: "02", title: "고르고", desc: "템플릿과 스타일을 선택하세요", icon: "🎨", gradient: "from-purple-500/20 to-pink-500/20" },
    { num: "03", title: "완성", desc: "AI가 15초 숏폼 영상을 만들어요", icon: "✨", gradient: "from-orange-500/20 to-red-500/20" },
  ];

  const demos = [
    { category: "패션", product: "오버사이즈 니트", gradient: "from-pink-500 via-rose-500 to-red-500", icon: "👕" },
    { category: "뷰티", product: "수분 크림", gradient: "from-blue-500 via-violet-500 to-purple-500", icon: "💄" },
    { category: "리빙", product: "캔들 세트", gradient: "from-amber-500 via-orange-500 to-yellow-500", icon: "🕯️" },
  ];

  const plans = [
    { 
      name: "Free", 
      price: "₩0", 
      videos: "3개/월", 
      desc: "가볍게 시작하기", 
      features: ["워터마크 포함", "720p 해상도", "기본 템플릿 3종"], 
      cta: "무료로 시작하기", 
      highlight: false 
    },
    { 
      name: "Basic", 
      price: "₩9,900", 
      videos: "30개/월", 
      desc: "성장하는 셀러를 위해", 
      features: ["워터마크 제거", "1080p 해상도", "전체 템플릿", "AI 카피라이팅"], 
      cta: "Basic 시작하기", 
      highlight: true 
    },
    { 
      name: "Pro", 
      price: "₩29,900", 
      videos: "무제한", 
      desc: "프로 셀러 & 마케터", 
      features: ["모든 Basic 기능", "4K 해상도", "커스텀 브랜딩", "우선 렌더링", "API 액세스"], 
      cta: "Pro 시작하기", 
      highlight: false 
    },
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
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative px-4 pt-20 pb-32 md:pt-32 md:pb-48 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 mesh-gradient" />
        <div className="absolute inset-0 bg-noise" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl opacity-20 animate-pulse-glow" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl opacity-20 animate-pulse-glow" style={{ animationDelay: '1s' }} />
        
        <div className="relative max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full glass text-sm font-medium text-foreground-secondary animate-scale-in">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500" />
            </span>
            AI 숏폼 영상 생성 서비스
          </div>
          
          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-[1.1] tracking-tight mb-8 text-balance">
            상품 사진 한 장이면,
            <br />
            <span className="gradient-text">15초 숏폼 광고</span>
            <br className="hidden sm:block" />
            <span className="text-foreground-secondary">가 나온다</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-foreground-secondary mb-12 max-w-2xl mx-auto text-balance leading-relaxed">
            사진 업로드부터 완성까지 <span className="text-foreground font-semibold">단 30초</span>.
            <br />
            AI가 만드는 프로급 상품 영상을 경험하세요.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <a
              href="/create"
              className="group relative inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold text-lg hover:shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105"
            >
              <span>무료로 시작하기</span>
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
            <a
              href="#demo"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl glass text-foreground font-semibold text-lg hover:bg-white/10 transition-all duration-300"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              데모 보기
            </a>
          </div>

          {/* Preview Mockup */}
          <div className="relative max-w-4xl mx-auto animate-float">
            <div className="glass-strong rounded-2xl p-8 shadow-2xl">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="aspect-[9/16] rounded-xl bg-gradient-to-br from-pink-500/20 to-rose-500/20 border border-white/10 flex items-center justify-center">
                  <span className="text-4xl">📸</span>
                </div>
                <div className="aspect-[9/16] rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-white/10 flex items-center justify-center">
                  <span className="text-4xl">✨</span>
                </div>
                <div className="aspect-[9/16] rounded-xl bg-gradient-to-br from-orange-500/20 to-yellow-500/20 border border-white/10 flex items-center justify-center">
                  <span className="text-4xl">🎬</span>
                </div>
              </div>
            </div>
            <div className="absolute -inset-4 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-3xl blur-2xl -z-10" />
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="px-4 py-16 border-y border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-3 gap-8 text-center">
            <div className="glass rounded-2xl p-6">
              <p className="text-3xl md:text-4xl font-bold gradient-text mb-2">1,000+</p>
              <p className="text-sm text-muted">셀러가 사용 중</p>
            </div>
            <div className="glass rounded-2xl p-6">
              <p className="text-3xl md:text-4xl font-bold gradient-text mb-2">50,000+</p>
              <p className="text-sm text-muted">생성된 영상</p>
            </div>
            <div className="glass rounded-2xl p-6">
              <p className="text-3xl md:text-4xl font-bold gradient-text mb-2">4.9 ⭐</p>
              <p className="text-sm text-muted">평균 만족도</p>
            </div>
          </div>
        </div>
      </section>

      {/* Demo: Before → After */}
      <section id="demo" className="px-4 py-20 md:py-32">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-foreground">이렇게 변합니다</h2>
            <p className="text-foreground-secondary text-lg">상품 사진 한 장 → AI 숏폼 영상</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {demos.map((demo) => (
              <div key={demo.product} className="glass rounded-2xl p-6 card-hover group">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-gradient-to-r from-purple-600/20 to-blue-600/20 text-purple-300 border border-purple-500/20">
                    {demo.category}
                  </span>
                </div>
                
                <div className="flex items-center gap-4 mb-5">
                  {/* Before */}
                  <div className={`flex-1 aspect-square rounded-xl bg-gradient-to-br ${demo.gradient} opacity-30 flex items-center justify-center border border-white/10 group-hover:opacity-50 transition-opacity`}>
                    <span className="text-3xl">{demo.icon}</span>
                  </div>
                  
                  {/* Arrow */}
                  <div className="text-foreground-secondary text-2xl font-bold group-hover:scale-110 transition-transform">→</div>
                  
                  {/* After */}
                  <div className={`flex-1 aspect-[9/16] rounded-xl bg-gradient-to-br ${demo.gradient} opacity-40 flex items-center justify-center border border-white/10 relative overflow-hidden group-hover:opacity-60 transition-opacity`}>
                    <span className="text-2xl">▶️</span>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  </div>
                </div>
                
                <p className="text-sm font-semibold text-center text-foreground">{demo.product}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="px-4 py-20 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-transparent" />
        
        <div className="relative max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-foreground">어떻게 만들어지나요?</h2>
            <p className="text-foreground-secondary text-lg">세 단계면 충분합니다</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((step, idx) => (
              <div key={step.num} className="relative">
                <div className="glass-strong rounded-2xl p-8 card-hover h-full">
                  {/* Step number badge */}
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-purple-600/30 to-blue-600/30 border border-purple-500/30 mb-6">
                    <span className="text-sm font-bold text-purple-300">{step.num}</span>
                  </div>
                  
                  <div className="text-5xl mb-6">{step.icon}</div>
                  <h3 className="text-2xl font-bold mb-3 text-foreground">{step.title}</h3>
                  <p className="text-foreground-secondary leading-relaxed">{step.desc}</p>
                  
                  {/* Decorative gradient */}
                  <div className={`absolute -bottom-2 -right-2 w-24 h-24 bg-gradient-to-br ${step.gradient} rounded-full blur-2xl opacity-50 -z-10`} />
                </div>
                
                {/* Connector arrow (desktop only) */}
                {idx < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-8 text-foreground-secondary text-2xl">
                    →
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="px-4 py-20 md:py-32">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-foreground">요금제</h2>
            <p className="text-foreground-secondary text-lg">무료로 시작하고, 필요할 때 업그레이드하세요</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl p-8 transition-all duration-300 ${
                  plan.highlight
                    ? "glass-strong border-2 border-purple-500/50 shadow-2xl shadow-purple-500/20 md:scale-105"
                    : "glass"
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 text-xs font-bold rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg">
                    🔥 가장 인기
                  </div>
                )}
                
                <h3 className="text-xl font-bold mb-2 text-foreground">{plan.name}</h3>
                <p className="text-sm text-foreground-secondary mb-6">{plan.desc}</p>
                
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-foreground-secondary">/월</span>
                </div>
                <p className="text-sm font-semibold gradient-text-pink mb-8">영상 {plan.videos}</p>
                
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-3 text-sm text-foreground-secondary">
                      <svg className="w-5 h-5 text-purple-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                
                <a
                  href="/create"
                  className={`block text-center py-3 rounded-xl text-sm font-semibold transition-all ${
                    plan.highlight
                      ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-xl hover:shadow-purple-500/50 hover:scale-105"
                      : "glass-strong hover:bg-white/10"
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
      <section className="px-4 py-20 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-purple-500/5" />
        
        <div className="relative max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-foreground">자주 묻는 질문</h2>
            <p className="text-foreground-secondary text-lg">궁금한 점이 있으신가요?</p>
          </div>
          
          <div className="space-y-4">
            {faqs.map((faq) => (
              <details key={faq.q} className="group glass-strong rounded-xl p-6 cursor-pointer hover:bg-white/10 transition-all">
                <summary className="flex items-center justify-between font-semibold text-foreground list-none">
                  <span>{faq.q}</span>
                  <span className="ml-4 text-foreground-secondary group-open:rotate-45 transition-transform text-2xl leading-none">+</span>
                </summary>
                <p className="mt-4 text-sm text-foreground-secondary leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-4 py-20 md:py-32 text-center relative overflow-hidden">
        <div className="absolute inset-0 mesh-gradient" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-3xl" />
        
        <div className="relative max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-foreground">
            지금 바로 <span className="gradient-text">시작</span>하세요
          </h2>
          <p className="text-foreground-secondary text-lg mb-10 text-balance">
            무료로 3개의 영상을 만들어보세요.
            <br />
            카드 등록 없이 바로 시작할 수 있습니다.
          </p>
          
          <a
            href="/create"
            className="inline-flex items-center gap-2 px-10 py-5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold text-xl hover:shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105 group"
          >
            <span>무료로 시작하기</span>
            <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </div>
      </section>
    </div>
  );
}

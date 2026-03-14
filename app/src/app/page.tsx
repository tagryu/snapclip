export default function Home() {
  const steps = [
    { num: "01", title: "찍고", desc: "상품 사진을 업로드하세요", icon: "📸" },
    { num: "02", title: "고르고", desc: "템플릿과 스타일을 선택하세요", icon: "🎨" },
    { num: "03", title: "완성", desc: "AI가 15초 숏폼 영상을 만들어요", icon: "✨" },
  ];

  const demos = [
    { category: "패션", product: "오버사이즈 니트", icon: "👕" },
    { category: "뷰티", product: "수분 크림", icon: "💄" },
    { category: "리빙", product: "캔들 세트", icon: "🕯️" },
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
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="px-4 pt-20 pb-32 md:pt-32 md:pb-40 bg-gray-50">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-white border border-gray-200 text-sm font-medium text-gray-600 shadow-sm">
            <span className="w-2 h-2 bg-blue-600 rounded-full" />
            AI 숏폼 영상 생성 서비스
          </div>
          
          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-[1.1] tracking-tight mb-8 text-balance text-gray-900">
            상품 사진 한 장이면,
            <br />
            <span className="text-blue-600">15초 숏폼 광고</span>
            <br className="hidden sm:block" />
            <span className="text-gray-600">가 나온다</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-2xl mx-auto text-balance leading-relaxed">
            사진 업로드부터 완성까지 <span className="text-gray-900 font-semibold">단 30초</span>.
            <br />
            AI가 만드는 프로급 상품 영상을 경험하세요.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <a
              href="/create"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-blue-600 text-white font-semibold text-lg hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md"
            >
              <span>무료로 시작하기</span>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
            <a
              href="#demo"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border border-gray-300 text-gray-700 font-semibold text-lg hover:bg-gray-50 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              데모 보기
            </a>
          </div>

          {/* Preview Mockup */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="aspect-[9/16] rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center">
                  <span className="text-4xl">📸</span>
                </div>
                <div className="aspect-[9/16] rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center">
                  <span className="text-4xl">✨</span>
                </div>
                <div className="aspect-[9/16] rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center">
                  <span className="text-4xl">🎬</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="px-4 py-16 bg-white border-y border-gray-200">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-3 gap-8 text-center">
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
              <p className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">1,000+</p>
              <p className="text-sm text-gray-600">셀러가 사용 중</p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
              <p className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">50,000+</p>
              <p className="text-sm text-gray-600">생성된 영상</p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
              <p className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">4.9 ⭐</p>
              <p className="text-sm text-gray-600">평균 만족도</p>
            </div>
          </div>
        </div>
      </section>

      {/* Demo: Before → After */}
      <section id="demo" className="px-4 py-24 md:py-32 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-gray-900">이렇게 변합니다</h2>
            <p className="text-gray-600 text-lg">상품 사진 한 장 → AI 숏폼 영상</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {demos.map((demo) => (
              <div key={demo.product} className="bg-white rounded-2xl p-6 border border-gray-200 card-hover">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    {demo.category}
                  </span>
                </div>
                
                <div className="flex items-center gap-4 mb-5">
                  {/* Before */}
                  <div className="flex-1 aspect-square rounded-xl bg-gray-100 flex items-center justify-center border border-gray-200">
                    <span className="text-3xl">{demo.icon}</span>
                  </div>
                  
                  {/* Arrow */}
                  <div className="text-gray-400 text-2xl font-bold">→</div>
                  
                  {/* After */}
                  <div className="flex-1 aspect-[9/16] rounded-xl bg-gray-100 flex items-center justify-center border border-gray-200 relative overflow-hidden">
                    <span className="text-2xl">▶️</span>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  </div>
                </div>
                
                <p className="text-sm font-semibold text-center text-gray-900">{demo.product}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="px-4 py-24 md:py-32 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-gray-900">어떻게 만들어지나요?</h2>
            <p className="text-gray-600 text-lg">세 단계면 충분합니다</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((step, idx) => (
              <div key={step.num} className="relative">
                <div className="bg-white rounded-2xl p-8 border border-gray-200 card-hover h-full">
                  {/* Step number badge */}
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 border border-blue-200 mb-6">
                    <span className="text-sm font-bold text-blue-600">{step.num}</span>
                  </div>
                  
                  <div className="text-5xl mb-6">{step.icon}</div>
                  <h3 className="text-2xl font-bold mb-3 text-gray-900">{step.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{step.desc}</p>
                </div>
                
                {/* Connector arrow (desktop only) */}
                {idx < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-8 text-gray-300 text-2xl">
                    →
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="px-4 py-24 md:py-32 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-gray-900">요금제</h2>
            <p className="text-gray-600 text-lg">무료로 시작하고, 필요할 때 업그레이드하세요</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl p-8 transition-all border ${
                  plan.highlight
                    ? "bg-blue-600 text-white border-blue-600 shadow-xl md:scale-105"
                    : "bg-white border-gray-200"
                }`}
              >
                {plan.highlight && (
                  <div className="inline-flex items-center gap-1 px-3 py-1 mb-4 text-xs font-bold rounded-full bg-white/20 text-white">
                    🔥 가장 인기
                  </div>
                )}
                
                <h3 className={`text-xl font-bold mb-2 ${plan.highlight ? "text-white" : "text-gray-900"}`}>
                  {plan.name}
                </h3>
                <p className={`text-sm mb-6 ${plan.highlight ? "text-blue-100" : "text-gray-600"}`}>
                  {plan.desc}
                </p>
                
                <div className="flex items-baseline gap-2 mb-2">
                  <span className={`text-4xl font-bold ${plan.highlight ? "text-white" : "text-gray-900"}`}>
                    {plan.price}
                  </span>
                  <span className={plan.highlight ? "text-blue-100" : "text-gray-600"}>/월</span>
                </div>
                <p className={`text-sm font-semibold mb-8 ${plan.highlight ? "text-blue-100" : "text-blue-600"}`}>
                  영상 {plan.videos}
                </p>
                
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className={`flex items-center gap-3 text-sm ${plan.highlight ? "text-blue-50" : "text-gray-600"}`}>
                      <svg className={`w-5 h-5 shrink-0 ${plan.highlight ? "text-white" : "text-blue-600"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                
                <a
                  href="/create"
                  className={`block text-center py-3 rounded-xl text-sm font-semibold transition-colors ${
                    plan.highlight
                      ? "bg-white text-blue-600 hover:bg-blue-50"
                      : "bg-blue-600 text-white hover:bg-blue-700"
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
      <section className="px-4 py-24 md:py-32 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-gray-900">자주 묻는 질문</h2>
            <p className="text-gray-600 text-lg">궁금한 점이 있으신가요?</p>
          </div>
          
          <div className="space-y-4">
            {faqs.map((faq) => (
              <details key={faq.q} className="group bg-white rounded-xl p-6 cursor-pointer border border-gray-200 hover:border-gray-300 transition-colors">
                <summary className="flex items-center justify-between font-semibold text-gray-900 list-none">
                  <span>{faq.q}</span>
                  <span className="ml-4 text-gray-400 group-open:rotate-45 transition-transform text-2xl leading-none">+</span>
                </summary>
                <p className="mt-4 text-sm text-gray-600 leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-4 py-24 md:py-32 text-center bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-gray-900">
            지금 바로 <span className="text-blue-600">시작</span>하세요
          </h2>
          <p className="text-gray-600 text-lg mb-10 text-balance">
            무료로 3개의 영상을 만들어보세요.
            <br />
            카드 등록 없이 바로 시작할 수 있습니다.
          </p>
          
          <a
            href="/create"
            className="inline-flex items-center gap-2 px-10 py-5 rounded-xl bg-blue-600 text-white font-semibold text-xl hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
          >
            <span>무료로 시작하기</span>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </div>
      </section>
    </div>
  );
}

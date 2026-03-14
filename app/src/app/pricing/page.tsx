"use client";

import { useState } from "react";

const plans = [
  {
    name: "Free",
    price: "₩0",
    priceNum: 0,
    videos: "3개/월",
    desc: "가볍게 시작하기",
    features: ["워터마크 포함", "720p 해상도", "기본 템플릿 3종"],
    cta: "무료로 시작하기",
    highlight: false,
    planId: "free",
  },
  {
    name: "Basic",
    price: "₩9,900",
    priceNum: 9900,
    videos: "30개/월",
    desc: "성장하는 셀러를 위해",
    features: ["워터마크 제거", "1080p 해상도", "전체 템플릿", "AI 카피라이팅"],
    cta: "Basic 시작하기",
    highlight: true,
    planId: "basic",
  },
  {
    name: "Pro",
    price: "₩29,900",
    priceNum: 29900,
    videos: "무제한",
    desc: "프로 셀러 & 마케터",
    features: ["모든 Basic 기능", "4K 해상도", "커스텀 브랜딩", "우선 렌더링", "API 액세스"],
    cta: "Pro 시작하기",
    highlight: false,
    planId: "pro",
  },
];

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null);

  const handleSelect = async (planId: string) => {
    if (planId === "free") {
      window.location.href = "/create";
      return;
    }

    setLoading(planId);
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId }),
      });
      const data = await res.json();
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch {
      // error handled
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen px-4 py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-gray-100 border border-gray-200 text-sm font-medium text-gray-600">
            💳 간편한 결제, 언제든 해지
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gray-900">
            딱 맞는 <span className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 bg-clip-text text-transparent">요금제</span>를 선택하세요
          </h1>
          <p className="text-gray-600 text-xl max-w-2xl mx-auto text-balance">
            무료로 시작하고, 필요할 때 업그레이드하세요
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 mb-20">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl p-8 transition-all border ${
                plan.highlight
                  ? "bg-blue-600 text-white border-blue-600 shadow-xl md:scale-105"
                  : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-lg"
              }`}
            >
              {/* Highlight Badge */}
              {plan.highlight && (
                <div className="inline-flex items-center gap-1 px-3 py-1 mb-4 text-xs font-bold rounded-full bg-white/20 text-white">
                  🔥 가장 인기
                </div>
              )}
              
              <div>
                {/* Plan Name */}
                <h3 className={`text-2xl font-bold mb-2 ${plan.highlight ? "text-white" : "text-gray-900"}`}>
                  {plan.name}
                </h3>
                <p className={`text-sm mb-6 ${plan.highlight ? "text-white/90" : "text-gray-600"}`}>
                  {plan.desc}
                </p>
                
                {/* Price */}
                <div className="mb-2">
                  <div className="flex items-baseline gap-2">
                    <span className={`text-5xl font-bold ${plan.highlight ? "text-white" : "text-gray-900"}`}>
                      {plan.price}
                    </span>
                    <span className={`text-lg ${plan.highlight ? "text-white/90" : "text-gray-600"}`}>/월</span>
                  </div>
                </div>
                
                <p className={`text-sm font-semibold mb-8 ${plan.highlight ? "text-white/95" : "bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 bg-clip-text text-transparent"}`}>
                  영상 {plan.videos}
                </p>
                
                {/* Features */}
                <ul className="space-y-4 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className={`flex items-start gap-3 text-sm ${plan.highlight ? "text-white/95" : "text-gray-600"}`}>
                      <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${
                        plan.highlight ? "bg-white/20" : "bg-gradient-to-r from-pink-50 to-purple-50"
                      }`}>
                        <svg className={`w-3 h-3 ${plan.highlight ? "text-white" : "text-pink-500"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                
                {/* CTA Button */}
                <button
                  onClick={() => handleSelect(plan.planId)}
                  disabled={loading !== null}
                  className={`w-full py-4 rounded-xl font-semibold text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                    plan.highlight
                      ? "bg-white text-pink-600 hover:bg-pink-50"
                      : "bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 text-white hover:opacity-90 border-0"
                  }`}
                >
                  {loading === plan.planId ? (
                    <span className="inline-flex items-center gap-2">
                      <div className={`w-4 h-4 border-2 rounded-full animate-spin ${
                        plan.highlight ? "border-pink-600/30 border-t-pink-600" : "border-white/30 border-t-white"
                      }`} />
                      처리 중...
                    </span>
                  ) : (
                    plan.cta
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="bg-gray-50 rounded-2xl p-8 mb-20 border border-gray-200">
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-600">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-50 border border-green-200 flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <span className="font-medium text-gray-900">안전한 결제</span>
            </div>
            
            <div className="hidden sm:block w-px h-8 bg-gray-200" />
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <span className="font-medium text-gray-900">언제든 해지 가능</span>
            </div>
            
            <div className="hidden sm:block w-px h-8 bg-gray-200" />
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200 flex items-center justify-center">
                <svg className="w-5 h-5 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <span className="font-medium text-gray-900">TossPayments 보안결제</span>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">자주 묻는 질문</h2>
            <p className="text-gray-600">궁금한 점이 있으신가요?</p>
          </div>
          
          <div className="space-y-3">
            {[
              { 
                q: "무료 플랜에서 유료로 업그레이드하면?", 
                a: "즉시 크레딧이 충전되고, 워터마크가 제거됩니다. 이전 영상의 워터마크도 제거할 수 있어요." 
              },
              { 
                q: "결제는 어떻게 되나요?", 
                a: "TossPayments를 통한 안전한 결제입니다. 카드, 간편결제 등 다양한 수단을 지원합니다." 
              },
              { 
                q: "언제든 해지할 수 있나요?", 
                a: "네, 언제든 해지 가능합니다. 해지 후에도 결제 기간까지는 서비스를 이용할 수 있어요." 
              },
              { 
                q: "크레딧이 다음 달로 이월되나요?", 
                a: "크레딧은 매월 초기화됩니다. 미사용 크레딧은 이월되지 않아요." 
              },
            ].map((faq) => (
              <details key={faq.q} className="group bg-gray-50 rounded-xl cursor-pointer overflow-hidden border border-gray-200 hover:border-gray-300">
                <summary className="flex items-center justify-between p-6 font-semibold text-gray-900 list-none transition-colors">
                  <span>{faq.q}</span>
                  <svg className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform flex-shrink-0 ml-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-6 pb-6 text-sm text-gray-600 leading-relaxed border-t border-gray-200">
                  <p className="pt-4">{faq.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-20">
          <div className="bg-gray-50 rounded-2xl p-12 border border-gray-200">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900">
                아직 고민 중이신가요?
              </h3>
              <p className="text-gray-600 mb-8 max-w-xl mx-auto">
                무료 플랜으로 먼저 경험해보세요. 카드 등록 없이 바로 시작할 수 있습니다.
              </p>
              <a
                href="/create"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 text-white font-semibold text-lg hover:opacity-90 transition-all shadow-lg"
              >
                <span>무료로 시작하기</span>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

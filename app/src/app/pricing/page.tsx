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
    <div className="min-h-screen px-4 py-16 md:py-24 bg-gradient-to-b from-surface to-white">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            딱 맞는 <span className="gradient-text">요금제</span>를 선택하세요
          </h1>
          <p className="text-muted text-lg">무료로 시작하고, 필요할 때 업그레이드하세요</p>
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative p-6 md:p-8 rounded-2xl border transition-all duration-300 card-hover ${
                plan.highlight
                  ? "bg-white border-ig-blue shadow-xl shadow-ig-blue/10 md:scale-105"
                  : "bg-white border-card-border"
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 text-xs font-bold rounded-full gradient-bg text-white">
                  🔥 가장 인기
                </div>
              )}
              <h3 className="text-xl font-bold mb-1 text-foreground">{plan.name}</h3>
              <p className="text-sm text-muted mb-5">{plan.desc}</p>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                <span className="text-muted">/월</span>
              </div>
              <p className="text-sm text-ig-blue font-semibold mb-8">영상 {plan.videos}</p>
              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-muted">
                    <svg className="w-4.5 h-4.5 text-ig-blue shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleSelect(plan.planId)}
                disabled={loading !== null}
                className={`w-full py-3 rounded-xl text-sm font-semibold transition-all ${
                  plan.highlight
                    ? "bg-ig-blue text-white hover:bg-ig-blue/90 shadow-lg shadow-ig-blue/20"
                    : "bg-surface text-foreground hover:bg-card-border/50 border border-card-border"
                } disabled:opacity-50`}
              >
                {loading === plan.planId ? "처리 중..." : plan.cta}
              </button>
            </div>
          ))}
        </div>

        {/* Trust Section */}
        <div className="text-center">
          <div className="inline-flex items-center gap-6 text-sm text-muted">
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5 text-ig-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              안전한 결제
            </span>
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5 text-ig-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              언제든 해지 가능
            </span>
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5 text-ig-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              TossPayments 보안결제
            </span>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-20 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-10 text-foreground">자주 묻는 질문</h2>
          {[
            { q: "무료 플랜에서 유료로 업그레이드하면?", a: "즉시 크레딧이 충전되고, 워터마크가 제거됩니다. 이전 영상의 워터마크도 제거할 수 있어요." },
            { q: "결제는 어떻게 되나요?", a: "TossPayments를 통한 안전한 결제입니다. 카드, 간편결제 등 다양한 수단을 지원합니다." },
            { q: "언제든 해지할 수 있나요?", a: "네, 언제든 해지 가능합니다. 해지 후에도 결제 기간까지는 서비스를 이용할 수 있어요." },
            { q: "크레딧이 다음 달로 이월되나요?", a: "크레딧은 매월 초기화됩니다. 미사용 크레딧은 이월되지 않아요." },
          ].map((faq) => (
            <details key={faq.q} className="group border-b border-card-border">
              <summary className="flex items-center justify-between py-4 cursor-pointer text-sm font-semibold text-foreground hover:text-ig-blue transition-colors">
                {faq.q}
                <svg className="w-4 h-4 text-muted group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <p className="pb-4 text-sm text-muted">{faq.a}</p>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}

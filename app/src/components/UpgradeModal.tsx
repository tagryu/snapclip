"use client";

import { useState } from "react";

const plans = [
  {
    name: "Basic",
    price: "₩9,900",
    videos: "30개/월",
    features: ["워터마크 제거", "1080p 해상도", "전체 템플릿", "AI 카피라이팅"],
    planId: "basic" as const,
  },
  {
    name: "Pro",
    price: "₩29,900",
    videos: "무제한",
    features: ["모든 Basic 기능", "4K 해상도", "커스텀 브랜딩", "우선 렌더링", "API 액세스"],
    planId: "pro" as const,
  },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  creditsUsed?: number;
  creditsLimit?: number;
}

export default function UpgradeModal({ isOpen, onClose, creditsUsed = 3, creditsLimit = 3 }: Props) {
  const [loading, setLoading] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleUpgrade = async (planId: string) => {
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
      // handle error
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-card border border-card-border rounded-2xl p-6 animate-in fade-in zoom-in-95">
        {/* Close */}
        <button onClick={onClose} className="absolute top-4 right-4 text-muted hover:text-foreground transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full gradient-bg mb-4">
            <span className="text-2xl">🚀</span>
          </div>
          <h2 className="text-xl font-bold mb-2">크레딧을 모두 사용했어요</h2>
          <p className="text-sm text-muted">
            이번 달 {creditsUsed}/{creditsLimit}개를 사용했습니다. 업그레이드하고 더 많은 영상을 만들어보세요!
          </p>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {plans.map((plan) => (
            <div key={plan.planId} className="p-4 rounded-xl border border-card-border bg-background">
              <h3 className="font-bold mb-1">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-2xl font-bold gradient-text">{plan.price}</span>
                <span className="text-xs text-muted">/월</span>
              </div>
              <p className="text-xs text-accent-purple font-medium mb-3">영상 {plan.videos}</p>
              <ul className="space-y-1.5 mb-4">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-1.5 text-xs text-muted">
                    <svg className="w-3 h-3 text-accent-purple shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleUpgrade(plan.planId)}
                disabled={loading !== null}
                className="w-full py-2 rounded-lg gradient-bg text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loading === plan.planId ? "처리 중..." : `${plan.name} 시작하기`}
              </button>
            </div>
          ))}
        </div>

        {/* Trust badges */}
        <div className="flex items-center justify-center gap-4 text-xs text-muted">
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            안전한 결제
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            언제든 해지
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            TossPayments
          </span>
        </div>
      </div>
    </div>
  );
}

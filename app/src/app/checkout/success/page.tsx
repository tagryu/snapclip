"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [plan, setPlan] = useState<string>("");

  useEffect(() => {
    const paymentKey = searchParams.get("paymentKey");
    const orderId = searchParams.get("orderId");
    const amount = searchParams.get("amount");

    if (!paymentKey || !orderId || !amount) {
      setStatus("error");
      return;
    }

    fetch("/api/payments/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentKey, orderId, amount: Number(amount) }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStatus("success");
          setPlan(data.plan);
        } else {
          setStatus("error");
        }
      })
      .catch(() => setStatus("error"));
  }, [searchParams]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-full gradient-bg animate-spin mb-4" />
        <p className="text-muted">결제를 확인하고 있어요...</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
          <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold mb-2">결제에 문제가 생겼어요</h1>
        <p className="text-muted mb-6">잠시 후 다시 시도해주세요</p>
        <a href="/pricing" className="px-6 py-3 rounded-xl gradient-bg text-white font-medium hover:opacity-90 transition-opacity">
          요금제 페이지로
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      {/* Success animation */}
      <div className="relative w-20 h-20 mb-8">
        <div className="absolute inset-0 rounded-full gradient-bg opacity-20 animate-ping" />
        <div className="w-full h-full rounded-full gradient-bg flex items-center justify-center">
          <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>

      <h1 className="text-2xl md:text-3xl font-bold mb-2">🎉 결제가 완료되었어요!</h1>
      <p className="text-muted mb-2">
        <span className="font-semibold text-foreground capitalize">{plan}</span> 플랜이 활성화되었습니다
      </p>
      <p className="text-sm text-muted mb-8">이제 더 많은 영상을 만들 수 있어요</p>

      <div className="flex gap-3">
        <a
          href="/create"
          className="px-8 py-3 rounded-xl gradient-bg text-white font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-purple-500/20"
        >
          ✨ 영상 만들기
        </a>
        <a
          href="/my"
          className="px-8 py-3 rounded-xl bg-card-border text-foreground font-medium hover:bg-card-border/80 transition-colors"
        >
          내 영상
        </a>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 rounded-full gradient-bg animate-spin" />
      </div>
    }>
      <CheckoutSuccessContent />
    </Suspense>
  );
}

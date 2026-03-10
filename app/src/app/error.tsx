"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
        <span className="text-3xl">😵</span>
      </div>
      <h1 className="text-2xl font-bold mb-2">문제가 발생했어요</h1>
      <p className="text-muted text-sm mb-6 text-center max-w-md">
        일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="px-6 py-3 rounded-xl gradient-bg text-white font-medium hover:opacity-90 transition-opacity"
        >
          다시 시도
        </button>
        <a
          href="/"
          className="px-6 py-3 rounded-xl bg-card-border text-foreground font-medium hover:bg-card-border/80 transition-colors"
        >
          홈으로
        </a>
      </div>
    </div>
  );
}

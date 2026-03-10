"use client";

import { useState, useEffect } from "react";

const stages = [
  { key: "bg-remove", label: "배경 제거 중", icon: "✂️", desc: "AI가 상품을 깔끔하게 분리하고 있어요" },
  { key: "ai-copy", label: "AI 카피 생성 중", icon: "✍️", desc: "매력적인 광고 문구를 만들고 있어요" },
  { key: "compose", label: "영상 조립 중", icon: "🎬", desc: "요소들을 조합해서 영상을 만들고 있어요" },
  { key: "render", label: "최종 렌더링 중", icon: "✨", desc: "고품질 영상을 출력하고 있어요" },
];

interface Props {
  currentStage?: string;
  progress?: number;
}

export default function ProgressAnimation({ currentStage, progress: externalProgress }: Props) {
  const [stageIndex, setStageIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (currentStage) {
      const idx = stages.findIndex((s) => s.key === currentStage);
      if (idx >= 0) setStageIndex(idx);
    }
    if (externalProgress !== undefined) {
      setProgress(externalProgress);
      return;
    }

    // Auto-advance for demo
    const timer = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) return 100;
        const next = p + Math.random() * 3 + 1;
        if (next > 25 && stageIndex < 1) setStageIndex(1);
        if (next > 55 && stageIndex < 2) setStageIndex(2);
        if (next > 80 && stageIndex < 3) setStageIndex(3);
        return Math.min(next, 98);
      });
    }, 200);

    return () => clearInterval(timer);
  }, [currentStage, externalProgress, stageIndex]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      {/* Spinner */}
      <div className="relative w-24 h-24 mb-8">
        <div className="absolute inset-0 rounded-full gradient-bg opacity-20 animate-ping" />
        <div className="absolute inset-3 rounded-full gradient-bg opacity-30 animate-pulse" />
        <div className="absolute inset-0 flex items-center justify-center text-4xl">
          {stages[stageIndex].icon}
        </div>
      </div>

      <h2 className="text-xl font-bold mb-2">{stages[stageIndex].label}</h2>
      <p className="text-muted text-sm mb-8">{stages[stageIndex].desc}</p>

      {/* Progress bar */}
      <div className="w-72 mb-6">
        <div className="h-2 bg-card-border rounded-full overflow-hidden">
          <div
            className="h-full gradient-bg rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-muted text-right mt-1">{Math.round(progress)}%</p>
      </div>

      {/* Stage indicators */}
      <div className="flex gap-6">
        {stages.map((s, i) => (
          <div key={s.key} className="flex flex-col items-center gap-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all ${
                i < stageIndex
                  ? "gradient-bg text-white"
                  : i === stageIndex
                  ? "border-2 border-accent-purple text-accent-purple"
                  : "border border-card-border text-muted"
              }`}
            >
              {i < stageIndex ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                s.icon
              )}
            </div>
            <span className={`text-[10px] ${i <= stageIndex ? "text-foreground" : "text-muted"}`}>{s.label.replace(" 중", "")}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

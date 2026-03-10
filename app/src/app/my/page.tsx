"use client";

import { useState } from "react";
import UpgradeModal from "@/components/UpgradeModal";

const mockHistory = [
  { id: 1, title: "프리미엄 가죽 지갑", date: "2025.03.08", thumbnail: null },
  { id: 2, title: "무선 블루투스 이어폰", date: "2025.03.07", thumbnail: null },
  { id: 3, title: "에코 텀블러 500ml", date: "2025.03.06", thumbnail: null },
];

export default function MyPage() {
  const used = 2;
  const total = 3;
  const plan = "Free";
  const [showUpgrade, setShowUpgrade] = useState(false);

  return (
    <div className="min-h-screen px-4 py-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">내 영상</h1>
        <p className="text-muted text-sm mb-8">생성한 영상을 관리하세요</p>

        {/* Usage */}
        <div className="bg-card border border-card-border rounded-2xl p-5 sm:p-6 mb-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium">이번 달 사용량</h3>
            <button
              onClick={() => plan === "Free" && setShowUpgrade(true)}
              className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
                plan === "Free"
                  ? "gradient-bg text-white hover:opacity-90 cursor-pointer"
                  : "bg-card-border text-muted"
              }`}
            >
              {plan} 플랜 {plan === "Free" && "→ 업그레이드"}
            </button>
          </div>
          <div className="flex items-baseline gap-1 mb-3">
            <span className="text-3xl font-bold gradient-text">{used}</span>
            <span className="text-muted">/ {total}개</span>
          </div>
          <div className="w-full h-2 bg-card-border rounded-full overflow-hidden">
            <div className="h-full gradient-bg rounded-full transition-all" style={{ width: `${(used / total) * 100}%` }} />
          </div>
          <p className="text-xs text-muted mt-2">{total - used}개 남았어요</p>
        </div>

        {/* History Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {mockHistory.map((item) => (
            <div
              key={item.id}
              className="bg-card border border-card-border rounded-2xl overflow-hidden card-glow transition-all duration-300 cursor-pointer group"
            >
              <div className="aspect-[9/16] bg-gradient-to-br from-accent-purple/20 to-accent-pink/20 flex items-center justify-center relative">
                <span className="text-4xl opacity-50 group-hover:opacity-100 transition-opacity">▶️</span>
                {/* Watermark indicator for free plan */}
                {plan === "Free" && (
                  <span className="absolute top-2 right-2 text-[10px] px-1.5 py-0.5 rounded bg-black/50 text-white/60">워터마크</span>
                )}
              </div>
              <div className="p-3">
                <p className="text-sm font-medium truncate">{item.title}</p>
                <p className="text-xs text-muted mt-0.5">{item.date}</p>
              </div>
            </div>
          ))}

          {/* Empty state */}
          <div
            className="bg-card border border-dashed border-card-border rounded-2xl flex flex-col items-center justify-center aspect-[9/16] cursor-pointer hover:border-accent-purple/50 transition-colors"
            onClick={() => (window.location.href = "/create")}
          >
            <span className="text-3xl mb-2">+</span>
            <span className="text-xs text-muted">새 영상 만들기</span>
          </div>
        </div>
      </div>

      <UpgradeModal isOpen={showUpgrade} onClose={() => setShowUpgrade(false)} creditsUsed={used} creditsLimit={total} />
    </div>
  );
}

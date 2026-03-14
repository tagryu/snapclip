"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { getUserCredits, type UserCredits } from "@/lib/credits";
import UpgradeModal from "@/components/UpgradeModal";

interface Project {
  id: string;
  product_name: string;
  status: string;
  output_url: string | null;
  template: string;
  created_at: string;
}

export default function MyPage() {
  const { user, loading: authLoading } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [credits, setCredits] = useState<UserCredits>({ plan: "free", credits_used: 0, credits_limit: 3 });
  const [loading, setLoading] = useState(true);
  const [showUpgrade, setShowUpgrade] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      window.location.href = "/login";
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const [creditsData, { data: projectsData }] = await Promise.all([
          getUserCredits(user.id),
          supabase
            .from("projects")
            .select("id, product_name, status, output_url, template, created_at")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(20),
        ]);
        setCredits(creditsData);
        setProjects(projectsData || []);
      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="w-8 h-8 rounded-full border-2 border-card-border border-t-ig-blue animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
  };

  const planLabel = credits.plan === "free" ? "Free" : credits.plan === "basic" ? "Basic" : "Pro";

  return (
    <div className="min-h-screen px-4 py-10 bg-surface">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header - Instagram Style */}
        <div className="bg-white border border-card-border rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full gradient-bg flex items-center justify-center text-white text-xl font-bold ring-2 ring-white shadow-md">
              {user.user_metadata?.full_name?.[0] || user.email?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-foreground">{user.user_metadata?.full_name || "셀러"}</h1>
              <p className="text-sm text-muted">{user.email}</p>
            </div>
          </div>

          {/* Stats Row */}
          <div className="flex items-center gap-8 pb-4 border-b border-card-border mb-4">
            <div className="text-center">
              <p className="text-lg font-bold text-foreground">{projects.length}</p>
              <p className="text-xs text-muted">영상</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-foreground">{credits.credits_used}</p>
              <p className="text-xs text-muted">사용</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-foreground">{credits.credits_limit - credits.credits_used}</p>
              <p className="text-xs text-muted">남음</p>
            </div>
          </div>

          {/* Usage Bar */}
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-foreground">이번 달 사용량</h3>
            <button
              onClick={() => credits.plan === "free" && setShowUpgrade(true)}
              className={`text-xs px-3 py-1 rounded-full font-semibold transition-colors ${
                credits.plan === "free"
                  ? "bg-ig-blue text-white hover:bg-ig-blue/90 cursor-pointer"
                  : "bg-surface text-muted border border-card-border"
              }`}
            >
              {planLabel} 플랜 {credits.plan === "free" && "→ 업그레이드"}
            </button>
          </div>
          <div className="w-full h-2 bg-surface rounded-full overflow-hidden">
            <div
              className="h-full gradient-bg rounded-full transition-all"
              style={{ width: `${Math.min((credits.credits_used / credits.credits_limit) * 100, 100)}%` }}
            />
          </div>
          <p className="text-xs text-muted mt-2">
            {credits.credits_limit - credits.credits_used > 0
              ? `${credits.credits_limit - credits.credits_used}개 남았어요`
              : "크레딧을 모두 사용했어요"}
          </p>
        </div>

        {/* Video Grid - Instagram 3-column style */}
        {projects.length === 0 ? (
          <div className="text-center py-20 bg-white border border-card-border rounded-2xl">
            <div className="text-5xl mb-4">🎬</div>
            <h3 className="text-lg font-semibold mb-2 text-foreground">아직 만든 영상이 없어요</h3>
            <p className="text-muted text-sm mb-6">첫 번째 상품 영상을 만들어보세요!</p>
            <a
              href="/create"
              className="inline-block px-6 py-3 rounded-xl bg-ig-blue text-white font-semibold hover:bg-ig-blue/90 transition-colors"
            >
              ✨ 영상 만들기
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-1 sm:gap-3">
            {projects.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-card-border rounded-lg sm:rounded-2xl overflow-hidden card-hover transition-all duration-300 cursor-pointer group"
              >
                <div className="aspect-square bg-gradient-to-br from-pink-50 to-orange-50 flex items-center justify-center relative">
                  {item.status === "completed" ? (
                    <span className="text-4xl opacity-40 group-hover:opacity-80 transition-opacity">▶️</span>
                  ) : item.status === "failed" ? (
                    <span className="text-4xl opacity-40">❌</span>
                  ) : (
                    <div className="w-8 h-8 border-2 border-ig-blue border-t-transparent rounded-full animate-spin" />
                  )}
                  {credits.plan === "free" && item.status === "completed" && (
                    <span className="absolute top-2 right-2 text-[10px] px-1.5 py-0.5 rounded bg-black/50 text-white/80">워터마크</span>
                  )}
                  <span className="absolute bottom-2 left-2 text-[10px] px-1.5 py-0.5 rounded-full bg-white/90 text-foreground font-medium shadow-sm">
                    {item.status === "completed" ? "완성" : item.status === "failed" ? "실패" : "진행 중"}
                  </span>
                </div>
                <div className="p-2 sm:p-3">
                  <p className="text-xs sm:text-sm font-semibold truncate text-foreground">{item.product_name}</p>
                  <p className="text-[10px] sm:text-xs text-muted mt-0.5">{formatDate(item.created_at)}</p>
                </div>
              </div>
            ))}

            {/* New */}
            <div
              className="bg-white border-2 border-dashed border-card-border rounded-lg sm:rounded-2xl flex flex-col items-center justify-center aspect-square cursor-pointer hover:border-ig-blue/50 hover:bg-ig-blue/5 transition-colors"
              role="button"
              tabIndex={0}
              aria-label="새 영상 만들기"
              onClick={() => (window.location.href = "/create")}
              onKeyDown={(e) => { if (e.key === "Enter") window.location.href = "/create"; }}
            >
              <span className="text-3xl text-ig-blue mb-2">+</span>
              <span className="text-xs text-muted font-medium">새 영상</span>
            </div>
          </div>
        )}
      </div>

      <UpgradeModal isOpen={showUpgrade} onClose={() => setShowUpgrade(false)} creditsUsed={credits.credits_used} creditsLimit={credits.credits_limit} />
    </div>
  );
}

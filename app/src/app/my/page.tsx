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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-white/10 border-t-purple-500 animate-spin" />
          <p className="text-foreground-secondary text-sm">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
  };

  const planLabel = credits.plan === "free" ? "Free" : credits.plan === "basic" ? "Basic" : "Pro";
  const usagePercent = Math.min((credits.credits_used / credits.credits_limit) * 100, 100);

  return (
    <div className="min-h-screen px-4 py-12 bg-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 mesh-gradient" />
      <div className="absolute top-20 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      
      <div className="relative max-w-5xl mx-auto">
        {/* Profile Header */}
        <div className="glass-strong rounded-2xl p-8 mb-8 border border-white/10">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white text-3xl font-bold ring-4 ring-purple-500/20 shadow-2xl shadow-purple-500/30">
                {user.user_metadata?.full_name?.[0] || user.email?.[0]?.toUpperCase() || "U"}
              </div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 border-4 border-background flex items-center justify-center">
                <span className="text-xs">✓</span>
              </div>
            </div>
            
            {/* User Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl font-bold text-foreground mb-2">
                {user.user_metadata?.full_name || "셀러"}
              </h1>
              <p className="text-foreground-secondary text-sm mb-4">{user.email}</p>
              
              {/* Stats */}
              <div className="flex items-center justify-center md:justify-start gap-6">
                <div>
                  <p className="text-2xl font-bold gradient-text">{projects.length}</p>
                  <p className="text-xs text-foreground-secondary">영상</p>
                </div>
                <div className="w-px h-10 bg-white/10" />
                <div>
                  <p className="text-2xl font-bold gradient-text">{credits.credits_used}</p>
                  <p className="text-xs text-foreground-secondary">사용</p>
                </div>
                <div className="w-px h-10 bg-white/10" />
                <div>
                  <p className="text-2xl font-bold gradient-text">{credits.credits_limit - credits.credits_used}</p>
                  <p className="text-xs text-foreground-secondary">남음</p>
                </div>
              </div>
            </div>
            
            {/* Plan Badge */}
            <div className="flex flex-col gap-3">
              <button
                onClick={() => credits.plan === "free" && setShowUpgrade(true)}
                className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                  credits.plan === "free"
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-xl hover:shadow-purple-500/50 hover:scale-105"
                    : "glass-strong border border-white/10 text-foreground"
                }`}
              >
                {credits.plan === "free" ? "⬆️ 업그레이드" : `${planLabel} 플랜`}
              </button>
            </div>
          </div>

          {/* Usage Bar */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-foreground">이번 달 사용량</h3>
              <span className="text-xs text-foreground-secondary">
                {credits.credits_used} / {credits.credits_limit}
              </span>
            </div>
            
            <div className="relative w-full h-3 bg-surface-elevated rounded-full overflow-hidden border border-white/5">
              <div
                className="h-full bg-gradient-to-r from-purple-600 to-blue-600 rounded-full transition-all duration-500 relative overflow-hidden"
                style={{ width: `${usagePercent}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 animate-pulse-glow" />
              </div>
            </div>
            
            <p className="text-xs text-foreground-secondary mt-2">
              {credits.credits_limit - credits.credits_used > 0
                ? `💫 ${credits.credits_limit - credits.credits_used}개 남았어요`
                : "⚠️ 크레딧을 모두 사용했어요"}
            </p>
          </div>
        </div>

        {/* Video Grid */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
            <span className="text-2xl">🎬</span>
            내 영상
          </h2>
          
          {projects.length === 0 ? (
            <div className="text-center py-20 glass-strong rounded-2xl border border-white/10">
              <div className="text-6xl mb-6 animate-float">📹</div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">아직 만든 영상이 없어요</h3>
              <p className="text-foreground-secondary mb-8 max-w-md mx-auto">
                첫 번째 상품 영상을 만들어보세요!<br />
                단 30초면 프로급 숏폼 광고가 완성됩니다.
              </p>
              <a
                href="/create"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold hover:shadow-xl hover:shadow-purple-500/50 transition-all hover:scale-105 group"
              >
                <span>✨</span>
                <span>영상 만들기</span>
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {/* New Video Card */}
              <div
                className="aspect-square glass border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-purple-500/50 hover:bg-purple-500/5 hover:scale-105 transition-all group"
                role="button"
                tabIndex={0}
                aria-label="새 영상 만들기"
                onClick={() => (window.location.href = "/create")}
                onKeyDown={(e) => { if (e.key === "Enter") window.location.href = "/create"; }}
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600/20 to-blue-600/20 border border-purple-500/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <span className="text-3xl">+</span>
                </div>
                <span className="text-sm font-semibold text-foreground-secondary group-hover:text-foreground transition-colors">
                  새 영상
                </span>
              </div>
              
              {/* Video Cards */}
              {projects.map((item) => (
                <div
                  key={item.id}
                  className="group glass-strong border border-white/10 rounded-2xl overflow-hidden hover:scale-105 hover:border-purple-500/50 transition-all duration-300 cursor-pointer"
                >
                  {/* Thumbnail */}
                  <div className="aspect-square bg-gradient-to-br from-purple-500/20 via-blue-500/20 to-pink-500/20 flex items-center justify-center relative overflow-hidden">
                    {item.status === "completed" ? (
                      <>
                        <span className="text-5xl opacity-40 group-hover:opacity-100 group-hover:scale-110 transition-all">▶️</span>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </>
                    ) : item.status === "failed" ? (
                      <span className="text-5xl opacity-40">❌</span>
                    ) : (
                      <div className="w-12 h-12 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                    )}
                    
                    {/* Watermark Badge */}
                    {credits.plan === "free" && item.status === "completed" && (
                      <span className="absolute top-2 right-2 text-[10px] px-2 py-1 rounded-md bg-black/70 text-white/90 backdrop-blur-sm">
                        워터마크
                      </span>
                    )}
                    
                    {/* Status Badge */}
                    <span className={`absolute bottom-2 left-2 text-xs px-2.5 py-1 rounded-full font-medium shadow-lg backdrop-blur-sm ${
                      item.status === "completed" 
                        ? "bg-green-500/90 text-white" 
                        : item.status === "failed"
                        ? "bg-red-500/90 text-white"
                        : "bg-blue-500/90 text-white"
                    }`}>
                      {item.status === "completed" ? "✓ 완성" : item.status === "failed" ? "✕ 실패" : "⏳ 진행 중"}
                    </span>
                  </div>
                  
                  {/* Info */}
                  <div className="p-4">
                    <p className="text-sm font-semibold truncate text-foreground mb-1 group-hover:text-purple-400 transition-colors">
                      {item.product_name}
                    </p>
                    <p className="text-xs text-foreground-secondary">
                      {formatDate(item.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4">
          <a
            href="/create"
            className="glass-strong rounded-2xl p-6 border border-white/10 hover:border-purple-500/50 hover:bg-white/5 transition-all group"
          >
            <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">✨</div>
            <h3 className="font-semibold text-foreground mb-1">영상 만들기</h3>
            <p className="text-sm text-foreground-secondary">새로운 상품 영상을 만들어보세요</p>
          </a>
          
          <a
            href="/pricing"
            className="glass-strong rounded-2xl p-6 border border-white/10 hover:border-purple-500/50 hover:bg-white/5 transition-all group"
          >
            <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">💎</div>
            <h3 className="font-semibold text-foreground mb-1">요금제</h3>
            <p className="text-sm text-foreground-secondary">플랜을 업그레이드하세요</p>
          </a>
          
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.href = "/";
            }}
            className="glass-strong rounded-2xl p-6 border border-white/10 hover:border-red-500/50 hover:bg-red-500/5 transition-all group text-left"
          >
            <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">🚪</div>
            <h3 className="font-semibold text-foreground mb-1">로그아웃</h3>
            <p className="text-sm text-foreground-secondary">계정에서 로그아웃합니다</p>
          </button>
        </div>
      </div>

      <UpgradeModal 
        isOpen={showUpgrade} 
        onClose={() => setShowUpgrade(false)} 
        creditsUsed={credits.credits_used} 
        creditsLimit={credits.credits_limit} 
      />
    </div>
  );
}

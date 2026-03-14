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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-gray-200 border-t-blue-600 animate-spin" />
          <p className="text-gray-600 text-sm">로딩 중...</p>
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
    <div className="min-h-screen px-4 py-12 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl p-8 mb-8 border border-gray-200 shadow-sm">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold ring-4 ring-pink-100 shadow-lg">
                {user.user_metadata?.full_name?.[0] || user.email?.[0]?.toUpperCase() || "U"}
              </div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-green-500 border-4 border-white flex items-center justify-center">
                <span className="text-xs text-white">✓</span>
              </div>
            </div>
            
            {/* User Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {user.user_metadata?.full_name || "셀러"}
              </h1>
              <p className="text-gray-600 text-sm mb-4">{user.email}</p>
              
              {/* Stats */}
              <div className="flex items-center justify-center md:justify-start gap-6">
                <div>
                  <p className="text-2xl font-bold bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 bg-clip-text text-transparent">{projects.length}</p>
                  <p className="text-xs text-gray-500">영상</p>
                </div>
                <div className="w-px h-10 bg-gray-200" />
                <div>
                  <p className="text-2xl font-bold bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 bg-clip-text text-transparent">{credits.credits_used}</p>
                  <p className="text-xs text-gray-500">사용</p>
                </div>
                <div className="w-px h-10 bg-gray-200" />
                <div>
                  <p className="text-2xl font-bold bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 bg-clip-text text-transparent">{credits.credits_limit - credits.credits_used}</p>
                  <p className="text-xs text-gray-500">남음</p>
                </div>
              </div>
            </div>
            
            {/* Plan Badge */}
            <div className="flex flex-col gap-3">
              <button
                onClick={() => credits.plan === "free" && setShowUpgrade(true)}
                className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                  credits.plan === "free"
                    ? "bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 text-white hover:opacity-90 shadow-sm"
                    : "bg-gray-100 border border-gray-200 text-gray-700"
                }`}
              >
                {credits.plan === "free" ? "⬆️ 업그레이드" : `${planLabel} 플랜`}
              </button>
            </div>
          </div>

          {/* Usage Bar */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">이번 달 사용량</h3>
              <span className="text-xs text-gray-500">
                {credits.credits_used} / {credits.credits_limit}
              </span>
            </div>
            
            <div className="relative w-full h-3 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
              <div
                className="h-full bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 rounded-full transition-all duration-500"
                style={{ width: `${usagePercent}%` }}
              />
            </div>
            
            <p className="text-xs text-gray-500 mt-2">
              {credits.credits_limit - credits.credits_used > 0
                ? `💫 ${credits.credits_limit - credits.credits_used}개 남았어요`
                : "⚠️ 크레딧을 모두 사용했어요"}
            </p>
          </div>
        </div>

        {/* Video Grid */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span className="text-2xl">🎬</span>
            내 영상
          </h2>
          
          {projects.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
              <div className="text-6xl mb-6">📹</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">아직 만든 영상이 없어요</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                첫 번째 상품 영상을 만들어보세요!<br />
                단 30초면 프로급 숏폼 광고가 완성됩니다.
              </p>
              <a
                href="/create"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 text-white font-semibold hover:opacity-90 transition-all shadow-lg"
              >
                <span>✨</span>
                <span>영상 만들기</span>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {/* New Video Card */}
              <div
                className="aspect-square border-2 border-dashed border-gray-300 bg-white rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-pink-500 hover:bg-pink-50 transition-all group"
                role="button"
                tabIndex={0}
                aria-label="새 영상 만들기"
                onClick={() => (window.location.href = "/create")}
                onKeyDown={(e) => { if (e.key === "Enter") window.location.href = "/create"; }}
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200 flex items-center justify-center mb-3 group-hover:bg-pink-100 transition-colors">
                  <span className="text-3xl bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 bg-clip-text text-transparent">+</span>
                </div>
                <span className="text-sm font-semibold text-gray-600 group-hover:text-gray-900 transition-colors">
                  새 영상
                </span>
              </div>
              
              {/* Video Cards */}
              {projects.map((item) => (
                <div
                  key={item.id}
                  className="group bg-white border border-gray-200 rounded-2xl overflow-hidden hover:border-pink-300 hover:shadow-lg transition-all duration-300 cursor-pointer"
                >
                  {/* Thumbnail */}
                  <div className="aspect-square bg-gray-100 flex items-center justify-center relative overflow-hidden">
                    {item.status === "completed" ? (
                      <>
                        <span className="text-5xl opacity-40 group-hover:opacity-100 group-hover:scale-110 transition-all">▶️</span>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </>
                    ) : item.status === "failed" ? (
                      <span className="text-5xl opacity-40">❌</span>
                    ) : (
                      <div className="w-12 h-12 border-2 border-pink-600 border-t-transparent rounded-full animate-spin" />
                    )}
                    
                    {/* Watermark Badge */}
                    {credits.plan === "free" && item.status === "completed" && (
                      <span className="absolute top-2 right-2 text-[10px] px-2 py-1 rounded-md bg-gray-900/70 text-white backdrop-blur-sm">
                        워터마크
                      </span>
                    )}
                    
                    {/* Status Badge */}
                    <span className={`absolute bottom-2 left-2 text-xs px-2.5 py-1 rounded-full font-medium shadow-sm ${
                      item.status === "completed" 
                        ? "bg-green-100 text-green-700 border border-green-200" 
                        : item.status === "failed"
                        ? "bg-red-100 text-red-700 border border-red-200"
                        : "bg-blue-100 text-blue-700 border border-blue-200"
                    }`}>
                      {item.status === "completed" ? "✓ 완성" : item.status === "failed" ? "✕ 실패" : "⏳ 진행 중"}
                    </span>
                  </div>
                  
                  {/* Info */}
                  <div className="p-4 bg-white">
                    <p className="text-sm font-semibold truncate text-gray-900 mb-1 group-hover:text-pink-600 transition-colors">
                      {item.product_name}
                    </p>
                    <p className="text-xs text-gray-500">
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
            className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-pink-300 hover:bg-pink-50 transition-all group shadow-sm"
          >
            <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">✨</div>
            <h3 className="font-semibold text-gray-900 mb-1">영상 만들기</h3>
            <p className="text-sm text-gray-600">새로운 상품 영상을 만들어보세요</p>
          </a>
          
          <a
            href="/pricing"
            className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-pink-300 hover:bg-pink-50 transition-all group shadow-sm"
          >
            <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">💎</div>
            <h3 className="font-semibold text-gray-900 mb-1">요금제</h3>
            <p className="text-sm text-gray-600">플랜을 업그레이드하세요</p>
          </a>
          
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.href = "/";
            }}
            className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-red-300 hover:bg-red-50 transition-all group text-left shadow-sm"
          >
            <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">🚪</div>
            <h3 className="font-semibold text-gray-900 mb-1">로그아웃</h3>
            <p className="text-sm text-gray-600">계정에서 로그아웃합니다</p>
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

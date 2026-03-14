"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const { user, loading } = useAuth();
  const [authLoading, setAuthLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && !loading) {
      window.location.href = "/create";
    }
  }, [user, loading]);

  const handleOAuth = async (provider: "google" | "kakao") => {
    setAuthLoading(provider);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/create`,
        },
      });
      if (error) {
        setError(error.message);
        setAuthLoading(null);
      }
    } catch {
      setError("로그인 중 오류가 발생했습니다.");
      setAuthLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-white/10 border-t-purple-500 animate-spin" />
          <p className="text-foreground-secondary text-sm">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 mesh-gradient" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }} />
      
      <div className="relative w-full max-w-md">
        {/* Logo & Welcome */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 mb-6 shadow-2xl shadow-purple-500/30 animate-scale-in">
            <span className="text-4xl">✨</span>
          </div>
          <h1 className="text-5xl font-bold gradient-text mb-4">SnapClip</h1>
          <p className="text-foreground-secondary text-lg">로그인하고 영상을 만들어보세요</p>
        </div>

        {/* Login Card */}
        <div className="glass-strong rounded-2xl p-8 border border-white/10 shadow-2xl">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center animate-scale-in">
              ⚠️ {error}
            </div>
          )}

          <div className="space-y-3">
            {/* Google Login */}
            <button
              onClick={() => handleOAuth("google")}
              disabled={authLoading !== null}
              className="w-full flex items-center justify-center gap-3 py-4 rounded-xl glass-strong border border-white/10 text-foreground font-semibold hover:bg-white/10 hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 group"
            >
              {authLoading === "google" ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              <span className="group-hover:tracking-wide transition-all">Google로 계속하기</span>
            </button>

            {/* Kakao Login */}
            <button
              onClick={() => handleOAuth("kakao")}
              disabled={authLoading !== null}
              className="w-full flex items-center justify-center gap-3 py-4 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 disabled:hover:scale-100 group shadow-lg"
              style={{ backgroundColor: "#FEE500", color: "#191919" }}
            >
              {authLoading === "kakao" ? (
                <div className="w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#191919">
                  <path d="M12 3C6.48 3 2 6.36 2 10.5c0 2.67 1.74 5.01 4.37 6.35-.14.51-.9 3.27-.93 3.48 0 0-.02.16.08.22.1.06.22.01.22.01.29-.04 3.37-2.21 3.9-2.59.76.11 1.55.17 2.36.17 5.52 0 10-3.36 10-7.5S17.52 3 12 3z"/>
                </svg>
              )}
              <span className="group-hover:tracking-wide transition-all">카카오로 계속하기</span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 glass-strong text-foreground-secondary">또는</span>
            </div>
          </div>

          {/* Skip Login */}
          <a
            href="/create"
            className="block w-full py-4 text-center rounded-xl glass border border-white/10 text-foreground-secondary font-medium hover:text-foreground hover:bg-white/5 hover:scale-105 transition-all group"
          >
            <span className="group-hover:tracking-wide transition-all">로그인 없이 체험하기</span>
          </a>
        </div>

        {/* Terms */}
        <p className="text-center text-xs text-foreground-secondary mt-8 px-4">
          계속하면{" "}
          <a href="/terms" className="text-purple-400 hover:text-purple-300 underline transition-colors">
            이용약관
          </a>{" "}
          및{" "}
          <a href="/privacy" className="text-purple-400 hover:text-purple-300 underline transition-colors">
            개인정보처리방침
          </a>
          에 동의하게 됩니다.
        </p>

        {/* Features Preview */}
        <div className="mt-12 glass rounded-2xl p-6 border border-white/10">
          <h3 className="text-sm font-semibold text-foreground mb-4 text-center">로그인하면 이런 기능을!</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl mb-2">💾</div>
              <p className="text-xs text-foreground-secondary">영상 저장</p>
            </div>
            <div>
              <div className="text-2xl mb-2">📊</div>
              <p className="text-xs text-foreground-secondary">통계 확인</p>
            </div>
            <div>
              <div className="text-2xl mb-2">⚡</div>
              <p className="text-xs text-foreground-secondary">빠른 생성</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

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
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="w-8 h-8 rounded-full border-2 border-card-border border-t-ig-blue animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-surface">
      <div className="w-full max-w-sm">
        {/* Card */}
        <div className="bg-white border border-card-border rounded-xl p-10">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold gradient-text mb-3">SnapClip</h1>
            <p className="text-muted text-sm">로그인하고 영상을 만들어보세요</p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm text-center">
              {error}
            </div>
          )}

          <div className="space-y-3">
            {/* Google */}
            <button
              onClick={() => handleOAuth("google")}
              disabled={authLoading !== null}
              className="w-full flex items-center justify-center gap-3 py-3 rounded-lg border border-card-border bg-white text-foreground font-semibold hover:bg-surface transition-colors disabled:opacity-50"
            >
              {authLoading === "google" ? (
                <div className="w-5 h-5 border-2 border-card-border border-t-ig-blue rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              Google로 계속하기
            </button>

            {/* Kakao */}
            <button
              onClick={() => handleOAuth("kakao")}
              disabled={authLoading !== null}
              className="w-full flex items-center justify-center gap-3 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
              style={{ backgroundColor: "#FEE500", color: "#191919" }}
            >
              {authLoading === "kakao" ? (
                <div className="w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#191919">
                  <path d="M12 3C6.48 3 2 6.36 2 10.5c0 2.67 1.74 5.01 4.37 6.35-.14.51-.9 3.27-.93 3.48 0 0-.02.16.08.22.1.06.22.01.22.01.29-.04 3.37-2.21 3.9-2.59.76.11 1.55.17 2.36.17 5.52 0 10-3.36 10-7.5S17.52 3 12 3z"/>
                </svg>
              )}
              카카오로 계속하기
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-muted mt-6">
          계속하면 <a href="/terms" className="text-ig-blue hover:underline">이용약관</a> 및{" "}
          <a href="/privacy" className="text-ig-blue hover:underline">개인정보처리방침</a>에 동의하게 됩니다.
        </p>
      </div>
    </div>
  );
}

"use client";

import { useAuth } from "@/context/AuthContext";
import { useState } from "react";

export default function NavBar() {
  const { user, loading, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 border-b border-card-border bg-white/95 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <a href="/" className="text-xl font-bold gradient-text tracking-tight">SnapClip</a>
        <div className="flex items-center gap-2 sm:gap-4">
          <a href="/create" className="text-sm text-muted hover:text-foreground transition-colors font-medium">만들기</a>
          {user && (
            <a href="/my" className="text-sm text-muted hover:text-foreground transition-colors font-medium hidden sm:block">내 영상</a>
          )}
          <a href="/pricing" className="text-sm text-muted hover:text-foreground transition-colors font-medium">요금제</a>

          {loading ? (
            <div className="w-8 h-8 rounded-full bg-surface animate-pulse" />
          ) : user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 text-sm"
                aria-label="사용자 메뉴"
              >
                <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center text-white text-xs font-bold ring-2 ring-white">
                  {user.user_metadata?.full_name?.[0] || user.email?.[0]?.toUpperCase() || "U"}
                </div>
              </button>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-card-border rounded-xl shadow-lg z-50 py-1">
                    <div className="px-3 py-2 border-b border-card-border">
                      <p className="text-xs text-muted truncate">{user.email}</p>
                    </div>
                    <a href="/my" className="block px-3 py-2 text-sm hover:bg-surface transition-colors">내 영상</a>
                    <button
                      onClick={signOut}
                      className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-surface transition-colors"
                    >
                      로그아웃
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <a href="/login" className="text-sm px-5 py-1.5 rounded-lg bg-ig-blue text-white font-semibold hover:bg-ig-blue/90 transition-colors">
              로그인
            </a>
          )}
        </div>
      </div>
    </nav>
  );
}

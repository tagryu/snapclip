"use client";

import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function NavBar() {
  const { user, loading, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [credits, setCredits] = useState<number | null>(null);

  useEffect(() => {
    if (user) {
      // Fetch user credits
      const fetchCredits = async () => {
        const { data, error } = await supabase
          .from("profiles")
          .select("credits")
          .eq("id", user.id)
          .single();
        
        if (!error && data) {
          setCredits(data.credits);
        }
      };
      
      fetchCredits();
      
      // Poll credits every 10 seconds when menu is open
      const interval = setInterval(() => {
        if (user) fetchCredits();
      }, 10000);
      
      return () => clearInterval(interval);
    } else {
      setCredits(null);
    }
  }, [user]);

  return (
    <nav className="fixed top-0 w-full z-50 border-b border-gray-200 bg-white/95 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <a href="/" className="text-xl font-bold bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 bg-clip-text text-transparent tracking-tight">
          SnapClip
        </a>
        
        <div className="flex items-center gap-2 sm:gap-4">
          <a 
            href="/create" 
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium"
          >
            만들기
          </a>
          
          {user && (
            <a 
              href="/my" 
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium hidden sm:block"
            >
              내 영상
            </a>
          )}
          
          <a 
            href="/pricing" 
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium"
          >
            요금제
          </a>

          {loading ? (
            <div className="w-8 h-8 rounded-full bg-gray-100 animate-pulse" />
          ) : user ? (
            <div className="relative flex items-center gap-3">
              {/* Credits Badge */}
              {credits !== null && (
                <a
                  href="/pricing"
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-orange-50 via-pink-50 to-purple-50 border border-pink-200 hover:border-pink-300 transition-all group"
                >
                  <span className="text-lg group-hover:scale-110 transition-transform">💎</span>
                  <span className="text-sm font-semibold bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 bg-clip-text text-transparent">
                    {credits}
                  </span>
                </a>
              )}
              
              {/* User Avatar */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 text-sm hover:opacity-80 transition-opacity"
                aria-label="사용자 메뉴"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold ring-2 ring-pink-100 shadow-sm">
                  {user.user_metadata?.full_name?.[0] || user.email?.[0]?.toUpperCase() || "U"}
                </div>
              </button>
              
              {/* Dropdown Menu */}
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-xl z-50 py-2 overflow-hidden">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {user.user_metadata?.full_name || user.email?.split('@')[0]}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    
                    {/* Credits */}
                    {credits !== null && (
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600">보유 크레딧</span>
                          <span className="text-sm font-bold bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 bg-clip-text text-transparent">
                            {credits}
                          </span>
                        </div>
                      </div>
                    )}
                    
                    {/* Menu Items */}
                    <a 
                      href="/my" 
                      className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <span className="mr-2">🎬</span>
                      마이페이지
                    </a>
                    
                    <a 
                      href="/pricing" 
                      className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <span className="mr-2">💎</span>
                      크레딧 충전
                    </a>
                    
                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <button
                        onClick={async () => {
                          await signOut();
                          setMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <span className="mr-2">🚪</span>
                        로그아웃
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <a 
              href="/login" 
              className="text-sm px-5 py-2 rounded-lg bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 text-white font-semibold hover:opacity-90 transition-all shadow-sm"
            >
              로그인
            </a>
          )}
        </div>
      </div>
    </nav>
  );
}

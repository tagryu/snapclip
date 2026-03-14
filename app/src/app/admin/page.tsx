"use client";

import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

const ADMIN_EMAILS = ["tames@tags.kr"];

interface Stats {
  totalUsers: number;
  todayProjects: number;
  totalProjects: number;
  paidUsers: number;
  planCounts: Record<string, number>;
}

interface Project {
  id: string;
  product_name: string;
  template: string;
  status: string;
  created_at: string;
  user_email: string;
}

interface UserRow {
  id: string;
  email: string;
  plan: string;
  credits_used: number;
  credits_limit: number;
  created_at: string;
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    processing: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
    failed: "bg-red-100 text-red-800",
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || "bg-gray-100 text-gray-800"}`}>
      {status}
    </span>
  );
}

function PlanBadge({ plan }: { plan: string }) {
  const colors: Record<string, string> = {
    free: "bg-gray-100 text-gray-700",
    basic: "bg-purple-100 text-purple-700",
    pro: "bg-gradient-to-r from-pink-500 to-orange-400 text-white",
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[plan] || "bg-gray-100 text-gray-700"}`}>
      {plan}
    </span>
  );
}

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [planFilter, setPlanFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  const getToken = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token || "";
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user || !ADMIN_EMAILS.includes(user.email || "")) {
      setAuthorized(false);
      setLoading(false);
      return;
    }
    setAuthorized(true);

    async function fetchAll() {
      const token = await getToken();
      if (!token) return;
      const headers = { Authorization: `Bearer ${token}` };

      const [statsRes, projRes, usersRes] = await Promise.all([
        fetch("/api/admin/stats", { headers }),
        fetch("/api/admin/projects", { headers }),
        fetch("/api/admin/users", { headers }),
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (projRes.ok) {
        const d = await projRes.json();
        setProjects(d.projects || []);
      }
      if (usersRes.ok) {
        const d = await usersRes.json();
        setUsers(d.users || []);
      }
      setLoading(false);
    }

    fetchAll();
  }, [user, authLoading, getToken]);

  // Refetch users on plan filter change
  useEffect(() => {
    if (!authorized) return;
    async function fetchUsers() {
      const token = await getToken();
      if (!token) return;
      const res = await fetch(`/api/admin/users?plan=${planFilter}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const d = await res.json();
        setUsers(d.users || []);
      }
    }
    fetchUsers();
  }, [planFilter, authorized, getToken]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-pink-500 border-t-transparent" />
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-gray-200">404</h1>
          <p className="mt-2 text-gray-500">페이지를 찾을 수 없습니다.</p>
          <button
            onClick={() => router.push("/")}
            className="mt-4 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition"
          >
            홈으로
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (d: string) => new Date(d).toLocaleDateString("ko-KR", {
    year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit",
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">📊 SnapClip Admin</h1>
          <p className="text-gray-500 text-sm mt-1">관리자 대시보드</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: "총 유저", value: stats.totalUsers, icon: "👥", color: "from-blue-500 to-cyan-400" },
              { label: "오늘 영상", value: stats.todayProjects, icon: "🎬", color: "from-pink-500 to-rose-400" },
              { label: "총 영상", value: stats.totalProjects, icon: "📹", color: "from-purple-500 to-violet-400" },
              { label: "유료 구독", value: stats.paidUsers, icon: "💎", color: "from-amber-500 to-orange-400" },
            ].map((card) => (
              <div key={card.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl">{card.icon}</span>
                  <span className={`text-xs px-2 py-1 rounded-full bg-gradient-to-r ${card.color} text-white`}>
                    Live
                  </span>
                </div>
                <p className="text-3xl font-bold text-gray-900">{card.value.toLocaleString()}</p>
                <p className="text-sm text-gray-500 mt-1">{card.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Revenue / Plan Breakdown */}
        {stats && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">💰 플랜별 현황</h2>
            <div className="grid grid-cols-3 gap-4">
              {Object.entries(stats.planCounts).map(([plan, count]) => (
                <div key={plan} className="text-center p-4 bg-gray-50 rounded-xl">
                  <PlanBadge plan={plan} />
                  <p className="text-2xl font-bold mt-2">{count}</p>
                  <p className="text-xs text-gray-500">명</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Projects */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-8 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">🎬 최근 영상 생성</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="px-6 py-3 text-left font-medium">유저</th>
                  <th className="px-6 py-3 text-left font-medium">상품명</th>
                  <th className="px-6 py-3 text-left font-medium">템플릿</th>
                  <th className="px-6 py-3 text-left font-medium">상태</th>
                  <th className="px-6 py-3 text-left font-medium">생성일</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {projects.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-3 text-gray-700">{p.user_email}</td>
                    <td className="px-6 py-3 text-gray-900 font-medium">{p.product_name}</td>
                    <td className="px-6 py-3 text-gray-500">{p.template}</td>
                    <td className="px-6 py-3"><StatusBadge status={p.status} /></td>
                    <td className="px-6 py-3 text-gray-500 text-xs">{formatDate(p.created_at)}</td>
                  </tr>
                ))}
                {projects.length === 0 && (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400">데이터 없음</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
            <h2 className="text-lg font-semibold text-gray-900">👥 유저 목록</h2>
            <div className="flex gap-2">
              {["all", "free", "basic", "pro"].map((p) => (
                <button
                  key={p}
                  onClick={() => setPlanFilter(p)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                    planFilter === p
                      ? "bg-pink-500 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {p === "all" ? "전체" : p}
                </button>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="px-6 py-3 text-left font-medium">이메일</th>
                  <th className="px-6 py-3 text-left font-medium">플랜</th>
                  <th className="px-6 py-3 text-left font-medium">크레딧</th>
                  <th className="px-6 py-3 text-left font-medium">가입일</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-3 text-gray-700">{u.email}</td>
                    <td className="px-6 py-3"><PlanBadge plan={u.plan} /></td>
                    <td className="px-6 py-3 text-gray-600">
                      {u.credits_used} / {u.credits_limit}
                    </td>
                    <td className="px-6 py-3 text-gray-500 text-xs">{formatDate(u.created_at)}</td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-400">데이터 없음</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

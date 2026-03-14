import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const ADMIN_EMAILS = ["tames@tags.kr"];

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function GET(request: NextRequest) {
  const supabase = getSupabase();

  // Auth check
  const authHeader = request.headers.get("authorization");
  if (!authHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const token = authHeader.replace("Bearer ", "");
  const { data: { user } } = await supabase.auth.getUser(token);
  if (!user || !ADMIN_EMAILS.includes(user.email || "")) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Total users
  const { count: totalUsers } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true });

  // Today's projects
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const { count: todayProjects } = await supabase
    .from("projects")
    .select("*", { count: "exact", head: true })
    .gte("created_at", today.toISOString());

  // Total projects
  const { count: totalProjects } = await supabase
    .from("projects")
    .select("*", { count: "exact", head: true });

  // Paid subscribers
  const { count: paidUsers } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true })
    .neq("plan", "free");

  // Plan breakdown
  const { data: planData } = await supabase
    .from("users")
    .select("plan");

  const planCounts: Record<string, number> = {};
  (planData || []).forEach((u: { plan: string }) => {
    planCounts[u.plan] = (planCounts[u.plan] || 0) + 1;
  });

  return NextResponse.json({
    totalUsers: totalUsers || 0,
    todayProjects: todayProjects || 0,
    totalProjects: totalProjects || 0,
    paidUsers: paidUsers || 0,
    planCounts,
  });
}

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

  const authHeader = request.headers.get("authorization");
  if (!authHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const token = authHeader.replace("Bearer ", "");
  const { data: { user } } = await supabase.auth.getUser(token);
  if (!user || !ADMIN_EMAILS.includes(user.email || "")) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { data: projects } = await supabase
    .from("projects")
    .select("id, product_name, template, status, created_at, user_id")
    .order("created_at", { ascending: false })
    .limit(50);

  // Get user emails for the projects
  const userIds = [...new Set((projects || []).map((p: { user_id: string }) => p.user_id).filter(Boolean))];
  let userMap: Record<string, string> = {};

  if (userIds.length > 0) {
    const { data: users } = await supabase
      .from("users")
      .select("id, email")
      .in("id", userIds);
    (users || []).forEach((u: { id: string; email: string }) => {
      userMap[u.id] = u.email;
    });
  }

  const enriched = (projects || []).map((p: { user_id: string; id: string; product_name: string; template: string; status: string; created_at: string }) => ({
    ...p,
    user_email: userMap[p.user_id] || "unknown",
  }));

  return NextResponse.json({ projects: enriched });
}

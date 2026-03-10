import { supabase } from "./supabase";

export type Plan = "free" | "basic" | "pro";

export const PLAN_LIMITS: Record<Plan, number> = {
  free: 3,
  basic: 30,
  pro: 999999, // unlimited
};

export const PLAN_PRICES: Record<Exclude<Plan, "free">, number> = {
  basic: 9900,
  pro: 29900,
};

export interface UserCredits {
  plan: Plan;
  credits_used: number;
  credits_limit: number;
}

export async function getUserCredits(userId: string): Promise<UserCredits> {
  const { data, error } = await supabase
    .from("users")
    .select("plan, credits_used, credits_limit")
    .eq("id", userId)
    .single();

  if (error || !data) {
    return { plan: "free", credits_used: 0, credits_limit: PLAN_LIMITS.free };
  }

  return data as UserCredits;
}

export async function useCredit(userId: string): Promise<{ ok: boolean; remaining: number }> {
  const credits = await getUserCredits(userId);
  if (credits.credits_used >= credits.credits_limit) {
    return { ok: false, remaining: 0 };
  }

  const { error } = await supabase
    .from("users")
    .update({ credits_used: credits.credits_used + 1 })
    .eq("id", userId);

  if (error) return { ok: false, remaining: credits.credits_limit - credits.credits_used };

  return { ok: true, remaining: credits.credits_limit - credits.credits_used - 1 };
}

export async function upgradePlan(userId: string, plan: Plan): Promise<boolean> {
  const { error } = await supabase
    .from("users")
    .update({
      plan,
      credits_limit: PLAN_LIMITS[plan],
      credits_used: 0,
    })
    .eq("id", userId);

  return !error;
}

export function hasWatermark(plan: Plan): boolean {
  return plan === "free";
}

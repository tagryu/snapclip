import { supabase } from "./supabase";

export const CREDIT_PACKAGES = [
  {
    id: "credit_5",
    name: "5 크레딧",
    credits: 5,
    price: 15000,
    pricePerCredit: 3000,
    discount: null,
    label: "입문",
  },
  {
    id: "credit_20",
    name: "20 크레딧",
    credits: 20,
    price: 50000,
    pricePerCredit: 2500,
    discount: 17,
    label: "인기",
  },
  {
    id: "credit_50",
    name: "50 크레딧",
    credits: 50,
    price: 100000,
    pricePerCredit: 2000,
    discount: 33,
    label: "최고 가성비",
  },
] as const;

export type CreditPackageId = (typeof CREDIT_PACKAGES)[number]["id"];

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  credits: number;
  total_credits_purchased: number;
  created_at: string;
  updated_at: string;
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error || !data) return null;
  return data as UserProfile;
}

export async function getUserCredits(userId: string): Promise<number> {
  const { data, error } = await supabase
    .from("profiles")
    .select("credits")
    .eq("id", userId)
    .single();

  if (error || !data) return 0;
  return data.credits;
}

export function getPackageById(packageId: string) {
  return CREDIT_PACKAGES.find((p) => p.id === packageId) ?? null;
}

export function getPackageByAmount(amount: number) {
  return CREDIT_PACKAGES.find((p) => p.price === amount) ?? null;
}

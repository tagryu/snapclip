import { NextRequest, NextResponse } from "next/server";

const TOSS_SECRET_KEY = process.env.TOSS_PAYMENTS_SECRET_KEY || "test_sk_placeholder";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

const PLAN_AMOUNTS: Record<string, { amount: number; orderName: string }> = {
  basic: { amount: 9900, orderName: "SnapClip Basic 월간 구독" },
  pro: { amount: 29900, orderName: "SnapClip Pro 월간 구독" },
};

export async function POST(request: NextRequest) {
  try {
    const { plan } = await request.json();

    if (!plan || !PLAN_AMOUNTS[plan]) {
      return NextResponse.json({ error: "유효하지 않은 플랜입니다." }, { status: 400 });
    }

    const { amount, orderName } = PLAN_AMOUNTS[plan];
    const orderId = `SNAPCLIP_${plan.toUpperCase()}_${Date.now()}`;

    // Return checkout info for client-side TossPayments SDK
    return NextResponse.json({
      orderId,
      amount,
      orderName,
      plan,
      successUrl: `${APP_URL}/checkout/success`,
      failUrl: `${APP_URL}/pricing?error=payment_failed`,
      // Client will use TossPayments SDK with these params
      clientKey: process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY || "test_ck_placeholder",
    });
  } catch (error: any) {
    console.error("Payment init error:", error);
    return NextResponse.json({ error: "결제 요청 중 오류가 발생했습니다." }, { status: 500 });
  }
}

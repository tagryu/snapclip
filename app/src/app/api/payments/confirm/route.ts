import { NextRequest, NextResponse } from "next/server";

const TOSS_SECRET_KEY = process.env.TOSS_PAYMENTS_SECRET_KEY || "test_sk_placeholder";

export async function POST(request: NextRequest) {
  try {
    const { paymentKey, orderId, amount } = await request.json();

    if (!paymentKey || !orderId || !amount) {
      return NextResponse.json({ error: "필수 파라미터가 누락되었습니다." }, { status: 400 });
    }

    // Confirm payment with TossPayments API
    const response = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${TOSS_SECRET_KEY}:`).toString("base64")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ paymentKey, orderId, amount }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || "결제 승인에 실패했습니다." },
        { status: response.status }
      );
    }

    // Extract plan from orderId (SNAPCLIP_BASIC_xxx or SNAPCLIP_PRO_xxx)
    const planMatch = orderId.match(/SNAPCLIP_(BASIC|PRO)_/);
    const plan = planMatch ? planMatch[1].toLowerCase() : "basic";

    // TODO: Update user's plan in Supabase
    // await supabase.from('users').update({ plan, credits_limit: PLAN_LIMITS[plan], credits_used: 0 }).eq('id', userId);

    return NextResponse.json({
      success: true,
      plan,
      orderId: data.orderId,
      totalAmount: data.totalAmount,
    });
  } catch (error: any) {
    console.error("Payment confirm error:", error);
    return NextResponse.json({ error: "결제 승인 중 오류가 발생했습니다." }, { status: 500 });
  }
}

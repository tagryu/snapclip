import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const tossSecretKey = process.env.TOSS_PAYMENTS_SECRET_KEY!;

// Service role client (bypasses RLS)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

interface ConfirmPaymentRequest {
  paymentKey: string;
  orderId: string;
  amount: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: ConfirmPaymentRequest = await request.json();
    const { paymentKey, orderId, amount } = body;

    if (!paymentKey || !orderId || !amount) {
      return NextResponse.json(
        { error: "필수 파라미터가 누락되었습니다." },
        { status: 400 }
      );
    }

    // 1. Get authenticated user
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { error: "인증이 필요합니다." },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    
    if (userError || !user) {
      return NextResponse.json(
        { error: "유효하지 않은 사용자입니다." },
        { status: 401 }
      );
    }

    // 2. Confirm payment with Toss Payments API
    const tossResponse = await fetch(
      "https://api.tosspayments.com/v1/payments/confirm",
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`${tossSecretKey}:`).toString("base64")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentKey,
          orderId,
          amount,
        }),
      }
    );

    if (!tossResponse.ok) {
      const errorData = await tossResponse.json();
      console.error("Toss payment confirmation failed:", errorData);
      return NextResponse.json(
        { error: "결제 승인에 실패했습니다.", details: errorData },
        { status: tossResponse.status }
      );
    }

    const paymentData = await tossResponse.json();

    // 3. Calculate credits based on amount
    const creditMap: { [key: number]: number } = {
      15000: 5,
      50000: 20,
      100000: 50,
    };

    const creditsToAdd = creditMap[amount];
    if (!creditsToAdd) {
      return NextResponse.json(
        { error: "유효하지 않은 결제 금액입니다." },
        { status: 400 }
      );
    }

    // 4. Update user credits in transaction
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("credits, total_credits_purchased")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      console.error("Profile fetch error:", profileError);
      return NextResponse.json(
        { error: "사용자 프로필을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // Update credits
    const newCredits = profile.credits + creditsToAdd;
    const newTotalPurchased = profile.total_credits_purchased + creditsToAdd;

    const { error: updateError } = await supabaseAdmin
      .from("profiles")
      .update({
        credits: newCredits,
        total_credits_purchased: newTotalPurchased,
      })
      .eq("id", user.id);

    if (updateError) {
      console.error("Credits update error:", updateError);
      return NextResponse.json(
        { error: "크레딧 업데이트에 실패했습니다." },
        { status: 500 }
      );
    }

    // 5. Record transaction
    const { error: transactionError } = await supabaseAdmin
      .from("credit_transactions")
      .insert({
        user_id: user.id,
        amount: creditsToAdd,
        type: "purchase",
        description: `${creditsToAdd}크레딧 충전 (₩${amount.toLocaleString()})`,
        payment_id: paymentData.paymentKey,
      });

    if (transactionError) {
      console.error("Transaction record error:", transactionError);
      // Don't fail the request if transaction recording fails
    }

    return NextResponse.json({
      success: true,
      credits: creditsToAdd,
      newBalance: newCredits,
      paymentData,
    });
  } catch (error) {
    console.error("Payment confirmation error:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

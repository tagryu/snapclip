import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SERVER_URL = process.env.SNAPCLIP_SERVER_URL || 'http://localhost:4000';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Service role client (bypasses RLS)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productName, productPrice, productFeatures, images, template, aspectRatio } = body;

    if (!productName || !images?.length) {
      return NextResponse.json(
        { error: '상품명과 이미지는 필수입니다.' },
        { status: 400 }
      );
    }

    // 1. Get authenticated user
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    
    if (userError || !user) {
      return NextResponse.json(
        { error: '유효하지 않은 사용자입니다.' },
        { status: 401 }
      );
    }

    // 2. Check credit balance
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('credits')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: '사용자 프로필을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    if (profile.credits < 1) {
      return NextResponse.json(
        { error: '크레딧이 부족합니다. 크레딧을 충전해주세요.', code: 'INSUFFICIENT_CREDITS' },
        { status: 402 }
      );
    }

    // 3. Deduct 1 credit
    const newCredits = profile.credits - 1;
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ credits: newCredits })
      .eq('id', user.id);

    if (updateError) {
      console.error('Credit deduction error:', updateError);
      return NextResponse.json(
        { error: '크레딧 차감 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    // 4. Record credit usage transaction
    const { error: transactionError } = await supabaseAdmin
      .from('credit_transactions')
      .insert({
        user_id: user.id,
        amount: -1,
        type: 'usage',
        description: `영상 생성: ${productName}`,
      });

    if (transactionError) {
      console.error('Transaction record error:', transactionError);
      // Don't fail the request
    }

    // 5. Create video record
    const videoTitle = `${productName} 영상`;
    const { data: video, error: videoError } = await supabaseAdmin
      .from('videos')
      .insert({
        user_id: user.id,
        title: videoTitle,
        status: 'pending',
        template: template || 'simple',
        aspect_ratio: aspectRatio || '9:16',
        product_name: productName,
        product_price: productPrice || null,
        product_tags: productFeatures ? productFeatures.join(', ') : null,
      })
      .select('id')
      .single();

    if (videoError) {
      console.error('Video creation error:', videoError);
      // Rollback credit deduction
      await supabaseAdmin
        .from('profiles')
        .update({ credits: profile.credits })
        .eq('id', user.id);
      
      return NextResponse.json(
        { error: '영상 레코드 생성 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    // 6. Forward request to backend server
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${SERVER_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoId: video.id,
          userId: user.id,
          productName,
          productPrice: productPrice || '',
          productFeatures: productFeatures || [],
          images,
          template: template || 'simple',
          aspectRatio: aspectRatio || '9:16',
        }),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!response.ok) {
        console.error('Backend server error:', await response.text());
      } else {
        // Update video status to 'generating'
        await supabaseAdmin
          .from('videos')
          .update({ status: 'generating' })
          .eq('id', video.id);
      }
    } catch (error) {
      console.error('Backend server connection error:', error);
      // Continue - video will stay in 'pending' status
    }

    return NextResponse.json({
      success: true,
      videoId: video.id,
      creditsRemaining: newCredits,
      message: '영상 생성이 시작되었습니다.',
    });
  } catch (error) {
    console.error('Generate API error:', error);
    return NextResponse.json(
      { error: '영상 생성 요청 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

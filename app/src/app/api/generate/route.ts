import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const SERVER_URL = process.env.SNAPCLIP_SERVER_URL || 'http://localhost:4000';

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

    // Try the backend server first
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${SERVER_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
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

      const data = await response.json();
      if (response.ok) {
        return NextResponse.json(data);
      }
    } catch {
      // Server unavailable, create project in Supabase directly
    }

    // Fallback: create project record in Supabase
    // Get user from auth header if available
    const authHeader = request.headers.get('authorization');
    let userId: string | null = null;
    if (authHeader) {
      const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
      userId = user?.id ?? null;
    }

    const { data: project, error } = await supabase
      .from('projects')
      .insert({
        user_id: userId,
        product_name: productName,
        product_price: productPrice || null,
        product_features: productFeatures || [],
        template: template || 'simple',
        aspect_ratio: aspectRatio || '9:16',
        status: 'pending',
      })
      .select('id')
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      // Return a demo projectId so the frontend can still function
      return NextResponse.json({
        projectId: null,
        message: '데모 모드로 실행됩니다.',
      });
    }

    return NextResponse.json({
      projectId: project.id,
      message: '프로젝트가 생성되었습니다. 서버가 연결되면 처리됩니다.',
    });
  } catch (error) {
    console.error('Generate API error:', error);
    return NextResponse.json(
      { error: '영상 생성 요청 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

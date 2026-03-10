import { NextRequest, NextResponse } from 'next/server';

const SERVER_URL = process.env.SNAPCLIP_SERVER_URL || 'http://localhost:4000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { productName, productPrice, productFeatures, images, template, aspectRatio, voiceEnabled, backgroundStyle } = body;

    if (!productName || !images?.length) {
      return NextResponse.json(
        { error: '상품명과 이미지는 필수입니다.' },
        { status: 400 }
      );
    }

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
        voiceEnabled: voiceEnabled || false,
        backgroundStyle: backgroundStyle || 'dark',
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Generate API error:', error);
    return NextResponse.json(
      { error: '영상 생성 요청 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

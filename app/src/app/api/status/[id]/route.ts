import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const SERVER_URL = process.env.SNAPCLIP_SERVER_URL || 'http://localhost:4000';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Try the backend server first
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    const response = await fetch(`${SERVER_URL}/api/status/${id}`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    const data = await response.json();
    if (response.ok) {
      return NextResponse.json(data);
    }
  } catch {
    // Server unavailable, fall back to Supabase
  }

  // Fallback: query Supabase directly
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('id, status, output_url, copy, created_at, product_name, template, aspect_ratio')
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: '프로젝트를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      projectId: data.id,
      status: data.status || 'pending',
      outputUrl: data.output_url,
      copy: data.copy,
      productName: data.product_name,
      template: data.template,
      aspectRatio: data.aspect_ratio,
      createdAt: data.created_at,
    });
  } catch (error) {
    console.error('Status API fallback error:', error);
    return NextResponse.json(
      { error: '상태 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

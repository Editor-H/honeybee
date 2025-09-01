import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    console.log('🔍 REST API 직접 호출 테스트');
    
    const response = await fetch(`${supabaseUrl}/rest/v1/cache?key=eq.articles&select=*`, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey!,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('📋 REST API 응답:', data);
    
    return NextResponse.json({
      success: true,
      hasData: Array.isArray(data) && data.length > 0,
      dataCount: Array.isArray(data) ? data.length : 0,
      firstItem: Array.isArray(data) && data.length > 0 ? {
        key: data[0].key,
        articleCount: data[0].data?.articles?.length || 0,
        lastUpdated: data[0].data?.lastUpdated,
        updatedAt: data[0].updated_at
      } : null
    });
    
  } catch (error) {
    console.error('REST API 테스트 실패:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
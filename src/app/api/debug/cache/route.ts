import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export async function GET() {
  try {
    console.log('🔍 디버그: 캐시 직접 조회');
    
    // 환경 변수 확인
    console.log('📋 환경 변수:', {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      supabaseUrlLength: process.env.NEXT_PUBLIC_SUPABASE_URL?.length,
    });
    
    // 캐시 테이블 직접 조회
    const { data, error } = await supabaseServer
      .from('cache')
      .select('*')
      .eq('key', 'articles');
    
    console.log('📋 Supabase 응답:', { data, error });
    
    if (error) {
      return NextResponse.json({ 
        success: false, 
        error: error.message,
        details: error 
      });
    }
    
    return NextResponse.json({ 
      success: true, 
      data,
      hasData: data && data.length > 0,
      articleCount: data?.[0]?.data?.articles?.length || 0
    });
    
  } catch (error) {
    console.error('디버그 API 오류:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}
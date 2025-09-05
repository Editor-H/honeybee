import { NextResponse } from 'next/server';
import { CacheManager } from '@/lib/cache-manager';

export async function POST() {
  try {
    console.log('🗑️ 캐시 초기화 시작...');
    
    await CacheManager.clearCache();
    
    console.log('✅ 캐시 초기화 완료');
    
    return NextResponse.json({
      success: true,
      message: '캐시가 성공적으로 초기화되었습니다',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ 캐시 초기화 실패:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
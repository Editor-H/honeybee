import { NextResponse } from 'next/server';
import { ContentCollectionService } from '@/lib/rss-collector-refactored';
import { CacheManager } from '@/lib/cache-manager';

// 이 API는 cron job이나 스케줄러에서만 호출되어야 함 (사용자 요청 차단)
export async function POST() {
  try {
    console.log('🔄 정기 RSS 수집 시작...');
    
    // 기존 캐시 삭제
    await CacheManager.clearCache();
    
    // 새로운 콘텐츠 수집 (리팩토링된 통합 시스템)
    const collectionService = new ContentCollectionService();
    const articles = await collectionService.collectAllContent();
    
    console.log(`✅ 정기 콘텐츠 수집 완료: ${articles.length}개 아티클`);
    
    return NextResponse.json({
      success: true,
      message: 'RSS 데이터가 성공적으로 업데이트되었습니다',
      totalArticles: articles.length,
      lastUpdated: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('정기 RSS 수집 실패:', error);
    
    return NextResponse.json({
      success: false,
      error: '정기 RSS 수집에 실패했습니다',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    const cacheInfo = await CacheManager.getCacheInfo();
    
    return NextResponse.json({
      success: true,
      cacheInfo: {
        lastUpdated: cacheInfo.lastUpdated,
        hoursAgo: cacheInfo.hoursAgo,
        needsUpdate: cacheInfo.hoursAgo === null || cacheInfo.hoursAgo >= 24
      }
    });
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: '캐시 정보를 가져올 수 없습니다'
    }, { status: 500 });
  }
}
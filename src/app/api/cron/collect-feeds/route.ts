import { NextResponse } from 'next/server';
import { ContentCollectionService } from '@/lib/rss-collector-refactored';
import { CacheManager } from '@/lib/cache-manager';

// Vercel Cron에서만 호출되는 API
export async function GET(request: Request) {
  try {
    // Vercel Cron 요청인지 확인 (보안)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      console.log('⚠️ 비인가 cron 요청 차단:', authHeader);
      return NextResponse.json({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 });
    }

    console.log('🕔 자동 콘텐츠 수집 시작 - 매일 오전 5시 (KST)');
    const startTime = Date.now();
    
    // 기존 캐시 정보 확인
    const { lastUpdated, hoursAgo } = await CacheManager.getCacheInfo();
    console.log(`이전 수집: ${lastUpdated ? lastUpdated.toLocaleString('ko-KR') : '없음'} (${hoursAgo}시간 전)`);
    
    // 누적 수집을 위해 캐시 삭제 제거
    console.log('📚 기존 아티클에 새로운 콘텐츠 누적 추가');
    
    // 새로운 콘텐츠 수집 (리팩토링된 통합 시스템)
    const collectionService = new ContentCollectionService();
    const articles = await collectionService.collectAllContent();
    
    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);
    
    console.log(`✅ 자동 콘텐츠 수집 완료: ${articles.length}개 아티클 (${duration}초 소요)`);
    
    // 수집 결과 요약 생성  
    const platformStats = articles.reduce((acc, article) => {
      const platformName = article.platform.name;
      acc[platformName] = (acc[platformName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // 플랫폼 통계 정보 추가
    const collectionStats = collectionService.getCollectionStats();
    
    const summary = {
      timestamp: new Date().toISOString(),
      kstTime: new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }),
      totalArticles: articles.length,
      duration: `${duration}초`,
      platforms: Object.keys(platformStats).length,
      activePlatforms: collectionStats.activePlatforms,
      platformBreakdown: platformStats,
      platformsByType: collectionStats.platformsByType,
      platformsByMethod: collectionStats.platformsByMethod,
      previousUpdate: lastUpdated?.toLocaleString('ko-KR') || '없음',
      hoursAgo: hoursAgo
    };
    
    console.log('📊 수집 요약:', JSON.stringify(summary, null, 2));
    
    return NextResponse.json({
      success: true,
      message: '자동 콘텐츠 수집이 성공적으로 완료되었습니다',
      summary
    });
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ 자동 콘텐츠 수집 실패:', error);
    
    // 에러 발생 시에도 기본 정보는 응답
    return NextResponse.json({
      success: false,
      error: '자동 콘텐츠 수집에 실패했습니다',
      details: errorMessage,
      timestamp: new Date().toISOString(),
      kstTime: new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })
    }, { status: 500 });
  }
}

// POST 메소드는 수동 테스트용으로 남겨둠
export async function POST() {
  return NextResponse.json({
    success: false,
    error: 'POST 메소드는 지원되지 않습니다. 이 엔드포인트는 Vercel Cron 전용입니다.'
  }, { status: 405 });
}
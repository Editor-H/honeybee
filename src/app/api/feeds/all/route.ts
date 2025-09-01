import { NextResponse } from 'next/server';
import { CacheManager } from '@/lib/cache-manager';

export async function GET() {
  try {
    // 항상 캐시된 데이터만 반환 (사용자 요청에 의한 수집 없음)
    const cachedArticles = await CacheManager.getCachedArticles();
    
    if (cachedArticles) {
      // 캐시 정보 가져오기
      const { lastUpdated, hoursAgo } = await CacheManager.getCacheInfo();
      
      console.log(`✅ 캐시된 데이터 반환: ${cachedArticles.length}개 아티클 (${hoursAgo}시간 전 수집)`);
      
      // Date 객체를 문자열로 변환
      const serializedArticles = cachedArticles.map(article => ({
        ...article,
        publishedAt: article.publishedAt.toISOString()
      }));

      return NextResponse.json({
        success: true,
        totalArticles: serializedArticles.length,
        articles: serializedArticles,
        lastUpdated: lastUpdated?.toISOString() || new Date().toISOString(),
        fromCache: true,
        cacheAge: hoursAgo
      });
    }

    // 캐시가 없는 경우 (초기 상태 또는 파일 손실)
    console.log('⚠️ 캐시된 데이터가 없습니다. 빈 결과 반환');
    return NextResponse.json({
      success: true,
      totalArticles: 0,
      articles: [],
      lastUpdated: new Date().toISOString(),
      fromCache: false,
      message: '데이터가 아직 수집되지 않았습니다. 잠시 후 다시 시도해주세요.'
    });

  } catch (error) {
    console.error('캐시 데이터 읽기 에러:', error);
    
    return NextResponse.json({
      success: false,
      error: '캐시된 데이터를 불러올 수 없습니다',
      lastUpdated: new Date().toISOString()
    }, { status: 500 });
  }
}
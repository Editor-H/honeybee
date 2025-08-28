import { NextResponse } from 'next/server';
import { collectFreshFeeds } from '@/lib/rss-collector';
import { CacheManager } from '@/lib/cache-manager';

export async function POST() {
  try {
    console.log('수동 새로고침 요청 시작...');
    
    // 기존 캐시 삭제
    await CacheManager.clearCache();
    
    // 새로운 RSS 데이터 수집
    const articles = await collectFreshFeeds();
    
    return NextResponse.json({
      success: true,
      message: '피드가 성공적으로 새로고침되었습니다',
      articlesCount: articles.length,
      lastUpdated: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('수동 새로고침 실패:', error);
    
    return NextResponse.json({
      success: false,
      error: '피드 새로고침에 실패했습니다',
      message: error instanceof Error ? error.message : '알 수 없는 오류'
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
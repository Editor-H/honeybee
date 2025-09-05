import { NextResponse } from 'next/server';
import { collectAllFeedsOptimized } from '@/lib/rss-collector-optimized';

export async function GET() {
  try {
    // 모든 아티클 가져오기
    const articles = await collectAllFeedsOptimized();
    
    // 플랫폼별 통계
    const platformStats = articles.reduce((acc, article) => {
      const platformName = article.platform.name;
      if (!acc[platformName]) {
        acc[platformName] = {
          count: 0,
          sampleTitles: [],
          platformType: article.platform.type,
          baseUrl: article.platform.baseUrl
        };
      }
      acc[platformName].count++;
      if (acc[platformName].sampleTitles.length < 3) {
        acc[platformName].sampleTitles.push(article.title);
      }
      return acc;
    }, {} as Record<string, { count: number; sampleTitles: string[]; platformType: string; baseUrl: string }>);

    // 플랫폼을 카운트순으로 정렬
    const sortedPlatforms = Object.entries(platformStats)
      .sort(([,a], [,b]) => b.count - a.count)
      .map(([name, stats]) => ({ name, ...stats }));

    return NextResponse.json({
      success: true,
      totalArticles: articles.length,
      totalPlatforms: sortedPlatforms.length,
      platforms: sortedPlatforms
    });

  } catch (error) {
    console.error('All platforms debug error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
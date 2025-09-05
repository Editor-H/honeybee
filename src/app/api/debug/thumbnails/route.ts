import { NextResponse } from 'next/server';
import { collectAllFeedsOptimized } from '@/lib/rss-collector-optimized';

export async function GET() {
  try {
    // 모든 아티클 가져오기
    const articles = await collectAllFeedsOptimized();
    
    // 썸네일 상태 분석
    const thumbnailStats = articles.slice(0, 20).map(article => ({
      id: article.id,
      title: article.title.substring(0, 50) + '...',
      platform: article.platform.name,
      thumbnailUrl: article.thumbnailUrl,
      hasThumbnail: !!article.thumbnailUrl,
      thumbnailValid: article.thumbnailUrl ? article.thumbnailUrl.startsWith('http') : false,
      contentType: article.contentType
    }));

    const summary = {
      totalArticles: articles.length,
      withThumbnails: articles.filter(a => a.thumbnailUrl).length,
      withValidThumbnails: articles.filter(a => a.thumbnailUrl && a.thumbnailUrl.startsWith('http')).length,
      withoutThumbnails: articles.filter(a => !a.thumbnailUrl).length
    };

    return NextResponse.json({
      success: true,
      summary,
      sampleArticles: thumbnailStats
    });

  } catch (error) {
    console.error('Thumbnail debug error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
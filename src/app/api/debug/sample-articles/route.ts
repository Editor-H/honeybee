import { NextResponse } from 'next/server';
import { collectAllFeedsOptimized } from '@/lib/rss-collector-optimized';

export async function GET() {
  try {
    // 모든 아티클 가져오기
    const articles = await collectAllFeedsOptimized();
    
    // 첫 10개 아티클의 상세 정보
    const sampleArticles = articles.slice(0, 10).map(article => ({
      id: article.id,
      title: article.title,
      platform: article.platform.name,
      thumbnailUrl: article.thumbnailUrl,
      url: article.url,
      contentType: article.contentType,
      publishedAt: article.publishedAt
    }));

    return NextResponse.json({
      success: true,
      totalArticles: articles.length,
      sampleArticles
    });

  } catch (error) {
    console.error('Sample articles debug error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
import { NextResponse } from 'next/server';
import { collectAllFeedsOptimized } from '@/lib/rss-collector-optimized';

export async function GET() {
  try {
    // 모든 아티클 가져오기
    const articles = await collectAllFeedsOptimized();
    
    // lecture 타입 아티클만 필터링
    const lectureArticles = articles.filter(article => article.contentType === 'lecture');
    
    const lectureStats = lectureArticles.map(article => ({
      id: article.id,
      title: article.title,
      contentType: article.contentType,
      category: article.category,
      tags: article.tags,
      platform: article.platform.name,
      channelName: 'channelName' in article.platform ? article.platform.channelName : null,
      publishedAt: article.publishedAt,
      coursePrice: 'coursePrice' in article ? article.coursePrice : undefined,
      courseDuration: 'courseDuration' in article ? article.courseDuration : undefined,
      courseLevel: 'courseLevel' in article ? article.courseLevel : undefined,
      courseInstructor: 'courseInstructor' in article ? article.courseInstructor : undefined,
      courseStudentCount: 'courseStudentCount' in article ? article.courseStudentCount : undefined,
      courseRating: 'courseRating' in article ? article.courseRating : undefined,
    }));

    return NextResponse.json({
      success: true,
      totalArticles: articles.length,
      lectureCount: lectureArticles.length,
      lectures: lectureStats
    });

  } catch (error) {
    console.error('Lecture debug error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
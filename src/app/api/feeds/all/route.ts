import { NextResponse } from 'next/server';
import { collectAllFeeds } from '@/lib/rss-collector';

export async function GET() {
  try {
    // 새로운 중앙화된 RSS 수집 시스템 사용
    const articles = await collectAllFeeds();

    // Date 객체를 문자열로 변환
    const serializedArticles = articles.map(article => ({
      ...article,
      publishedAt: article.publishedAt.toISOString()
    }));

    return NextResponse.json({
      success: true,
      totalArticles: serializedArticles.length,
      articles: serializedArticles,
      lastUpdated: new Date().toISOString(),
      platforms: ['toss', 'daangn', 'kakao', 'naver', 'woowahan', 'medium', 'google_dev', 'line_dev', 'aws_korea', 'toast', 'line_blog', 'coupang', 'banksalad', 'spoqa']
    });

  } catch (error) {
    console.error('전체 RSS 수집 에러:', error);
    return NextResponse.json({
      success: false,
      error: '전체 RSS 수집 실패',
      lastUpdated: new Date().toISOString()
    }, { status: 500 });
  }
}
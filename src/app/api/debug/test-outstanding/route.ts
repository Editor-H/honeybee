import { NextResponse } from 'next/server';
import { SmartOutstandingCollector } from '@/lib/playwright/smart-outstanding-collector';

export async function GET() {
  console.log('🧪 아웃스탠딩 크롤러 테스트 시작...');
  
  const result = {
    success: false,
    count: 0,
    error: null as string | null,
    articles: [] as Array<{
      title: string;
      url: string;
      author: string;
      category: string;
      tags: string[];
      qualityScore: number;
      publishedAt: Date;
    }>,
    performance: {
      duration: 0,
      startTime: Date.now()
    }
  };

  try {
    console.log('📰 아웃스탠딩 베스트 크롤러 테스트 중...');
    const collector = new SmartOutstandingCollector();
    
    const startTime = Date.now();
    const articles = await collector.collectArticles(3); // 3개만 테스트
    const duration = Date.now() - startTime;
    
    result.success = articles.length > 0;
    result.count = articles.length;
    result.articles = articles.map(article => ({
      title: article.title,
      url: article.url,
      author: article.author.name,
      category: article.category,
      tags: article.tags.slice(0, 3), // 처음 3개 태그만
      qualityScore: article.qualityScore,
      publishedAt: article.publishedAt
    }));
    result.performance.duration = duration;
    
    // 브라우저 정리
    await collector.closeBrowser();
    
    console.log(`✅ 아웃스탠딩: ${articles.length}개 수집 (${duration}ms)`);
    
  } catch (error) {
    console.error('❌ 아웃스탠딩 테스트 실패:', error);
    result.error = error instanceof Error ? error.message : 'Unknown error';
  }

  console.log('🏁 아웃스탠딩 크롤러 테스트 완료');

  return NextResponse.json({
    success: true,
    message: '아웃스탠딩 크롤러 테스트 완료',
    result,
    timestamp: new Date().toISOString()
  });
}
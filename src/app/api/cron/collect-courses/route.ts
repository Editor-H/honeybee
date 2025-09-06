import { NextResponse } from 'next/server';
import { InflearnCrawler } from '@/lib/crawlers/inflearn-crawler';
import { ColosoCrawler } from '@/lib/crawlers/coloso-crawler';
import { Class101Crawler } from '@/lib/crawlers/class101-crawler';
import { CacheManager } from '@/lib/cache-manager';
import { Article } from '@/types/article';

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

    console.log('🎓 강의 크롤링 시작');
    const startTime = Date.now();
    
    const crawlers = [
      new InflearnCrawler('인프런', 'https://www.inflearn.com'),
      new ColosoCrawler('콜로소', 'https://coloso.co.kr'),
      new Class101Crawler('클래스101', 'https://class101.net')
    ];

    const allCourses: Article[] = [];
    const platformStats: Record<string, number> = {};

    // 각 플랫폼별로 강의 수집
    for (const crawler of crawlers) {
      try {
        console.log(`📚 ${crawler['siteName']} 크롤링 시작...`);
        const courses = await crawler.crawlCourses(30); // 각 플랫폼에서 30개씩
        
        // CourseData를 Article로 변환
        const articles = courses.map((course, index) => crawler.convertToArticle(course, index));
        
        allCourses.push(...articles);
        platformStats[crawler['siteName']] = articles.length;
        
        console.log(`✅ ${crawler['siteName']}: ${articles.length}개 강의 수집 완료`);
        
        // 리소스 정리
        await crawler.closeBrowser();
      } catch (error) {
        console.error(`❌ ${crawler['siteName']} 크롤링 실패:`, error);
        platformStats[crawler['siteName']] = 0;
      }
    }

    // 기존 캐시에 강의 데이터 추가
    if (allCourses.length > 0) {
      const existingArticles = await CacheManager.getCachedArticles();
      const combinedArticles = [...(existingArticles || []), ...allCourses];
      await CacheManager.setCachedArticles(combinedArticles);
      console.log('💾 강의 데이터를 기존 캐시에 추가 완료');
    }

    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);
    
    console.log(`✅ 강의 크롤링 완료: ${allCourses.length}개 강의 (${duration}초 소요)`);
    
    const summary = {
      timestamp: new Date().toISOString(),
      kstTime: new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }),
      totalCourses: allCourses.length,
      duration: `${duration}초`,
      platforms: Object.keys(platformStats).length,
      platformBreakdown: platformStats
    };
    
    console.log('📊 크롤링 요약:', JSON.stringify(summary, null, 2));
    
    return NextResponse.json({
      success: true,
      message: '강의 크롤링이 성공적으로 완료되었습니다',
      summary
    });
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ 강의 크롤링 실패:', error);
    
    return NextResponse.json({
      success: false,
      error: '강의 크롤링에 실패했습니다',
      details: errorMessage,
      timestamp: new Date().toISOString(),
      kstTime: new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })
    }, { status: 500 });
  }
}

export async function POST() {
  return NextResponse.json({
    success: false,
    error: 'POST 메소드는 지원되지 않습니다. 이 엔드포인트는 Vercel Cron 전용입니다.'
  }, { status: 405 });
}
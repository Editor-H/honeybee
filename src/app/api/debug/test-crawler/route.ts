import { NextResponse } from 'next/server';
import { InflearnCrawler } from '@/lib/crawlers/inflearn-crawler';
import { ColosoCrawler } from '@/lib/crawlers/coloso-crawler';
import { Class101Crawler } from '@/lib/crawlers/class101-crawler';

export async function GET() {
  console.log('🧪 크롤러 테스트 시작...');
  
  const results = {
    inflearn: { success: false, count: 0, error: null as any, sample: null as any },
    coloso: { success: false, count: 0, error: null as any, sample: null as any },
    class101: { success: false, count: 0, error: null as any, sample: null as any }
  };

  // 인프런 테스트 (간단한 테스트)
  try {
    console.log('📚 인프런 크롤러 테스트 중...');
    const inflearn = new InflearnCrawler();
    await inflearn.initBrowser();
    
    // 소량 테스트 (5개 정도)
    const courses = await inflearn.crawlCourses();
    results.inflearn.success = true;
    results.inflearn.count = courses.length;
    results.inflearn.sample = courses.length > 0 ? {
      title: courses[0].title,
      instructor: courses[0].instructor,
      price: courses[0].price,
      platform: courses[0].platform
    } : null;
    
    await inflearn.closeBrowser();
    console.log(`✅ 인프런: ${courses.length}개 수집`);
  } catch (error) {
    console.error('❌ 인프런 테스트 실패:', error);
    results.inflearn.error = error instanceof Error ? error.message : 'Unknown error';
  }

  // 콜로소 간단 테스트
  try {
    console.log('🎨 콜로소 크롤러 테스트 중...');
    const coloso = new ColosoCrawler();
    await coloso.initBrowser();
    
    const courses = await coloso.crawlCourses(3); // 3개만 테스트
    results.coloso.success = true;
    results.coloso.count = courses.length;
    results.coloso.sample = courses.length > 0 ? {
      title: courses[0].title,
      instructor: courses[0].instructor,
      price: courses[0].price,
      platform: courses[0].platform
    } : null;
    
    await coloso.closeBrowser();
    console.log(`✅ 콜로소: ${courses.length}개 수집`);
  } catch (error) {
    console.error('❌ 콜로소 테스트 실패:', error);
    results.coloso.error = error instanceof Error ? error.message : 'Unknown error';
  }

  // 클래스101 간단 테스트
  try {
    console.log('📖 클래스101 크롤러 테스트 중...');
    const class101 = new Class101Crawler();
    await class101.initBrowser();
    
    const courses = await class101.crawlCourses(3); // 3개만 테스트
    results.class101.success = true;
    results.class101.count = courses.length;
    results.class101.sample = courses.length > 0 ? {
      title: courses[0].title,
      instructor: courses[0].instructor,
      price: courses[0].price,
      platform: courses[0].platform
    } : null;
    
    await class101.closeBrowser();
    console.log(`✅ 클래스101: ${courses.length}개 수집`);
  } catch (error) {
    console.error('❌ 클래스101 테스트 실패:', error);
    results.class101.error = error instanceof Error ? error.message : 'Unknown error';
  }

  console.log('🏁 크롤러 테스트 완료');

  return NextResponse.json({
    success: true,
    message: '크롤러 테스트 완료',
    results,
    timestamp: new Date().toISOString()
  });
}
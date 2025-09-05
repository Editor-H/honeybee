import { NextResponse } from 'next/server';
import { CourseCrawler, CourseData } from '@/lib/course-crawler';
import { CacheManager } from '@/lib/cache-manager';

// Mock 크롤러 클래스
class MockCourseCrawler extends CourseCrawler {
  constructor() {
    super('Mock Platform', 'https://mock.com');
  }

  async crawlCourses(): Promise<CourseData[]> {
    // Mock 강의 데이터
    return [
      {
        title: '[테스트] React 완벽 가이드',
        description: 'React의 모든 것을 배워보는 완벽한 강의입니다. 기초부터 고급까지 단계별로 학습할 수 있습니다.',
        instructor: '김개발',
        price: 150000,
        originalPrice: 200000,
        rating: 4.8,
        studentCount: 1250,
        thumbnailUrl: 'https://via.placeholder.com/300x200?text=React+Course',
        courseUrl: 'https://mock.com/courses/react-guide',
        category: '프로그래밍',
        tags: ['React', 'JavaScript', 'Frontend'],
        duration: 720, // 12시간
        level: 'intermediate',
        platform: 'Mock Platform'
      },
      {
        title: '[테스트] UI/UX 디자인 마스터클래스',
        description: 'UI/UX 디자인의 핵심 원리와 실무 노하우를 배우는 종합 강의입니다.',
        instructor: '박디자인',
        price: 89000,
        originalPrice: 120000,
        rating: 4.6,
        studentCount: 890,
        thumbnailUrl: 'https://via.placeholder.com/300x200?text=UI%2FUX+Course',
        courseUrl: 'https://mock.com/courses/uiux-master',
        category: 'UI/UX',
        tags: ['UI', 'UX', 'Design', 'Figma'],
        duration: 480, // 8시간
        level: 'beginner',
        platform: 'Mock Platform'
      },
      {
        title: '[테스트] 머신러닝 입문',
        description: 'Python으로 배우는 머신러닝 기초부터 실전 프로젝트까지 다루는 강의입니다.',
        instructor: '이머신',
        price: 0, // 무료 강의
        rating: 4.9,
        studentCount: 2340,
        thumbnailUrl: 'https://via.placeholder.com/300x200?text=ML+Course',
        courseUrl: 'https://mock.com/courses/ml-intro',
        category: 'AI',
        tags: ['Python', 'Machine Learning', 'AI', 'Data Science'],
        duration: 600, // 10시간
        level: 'beginner',
        platform: 'Mock Platform'
      }
    ];
  }
}

export async function GET() {
  try {
    console.log('🧪 Mock 강의 데이터 테스트 시작...');
    
    // Mock 크롤러 생성
    const mockCrawler = new MockCourseCrawler();
    
    // Mock 강의 데이터 수집
    const courses = await mockCrawler.crawlCourses();
    console.log(`📚 Mock 강의 ${courses.length}개 생성`);
    
    // CourseData를 Article로 변환
    const articles = courses.map((course, index) => mockCrawler.convertToArticle(course, index));
    console.log(`📄 Article 형태로 변환: ${articles.length}개`);
    
    // 캐시에 추가
    await CacheManager.setCachedArticles(articles);
    console.log('💾 캐시에 강의 데이터 추가 완료');
    
    // 결과 정리
    const summary = {
      totalCourses: courses.length,
      courseTypes: articles.map(article => ({
        title: article.title,
        contentType: article.contentType,
        category: article.category,
        platform: article.platform.name,
        coursePrice: article.coursePrice,
        courseLevel: article.courseLevel,
        courseInstructor: article.courseInstructor,
        courseRating: article.courseRating,
        tags: article.tags
      }))
    };
    
    console.log('✅ Mock 강의 데이터 테스트 완료');
    
    return NextResponse.json({
      success: true,
      message: 'Mock 강의 데이터가 성공적으로 캐시에 추가되었습니다',
      summary,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Mock 강의 데이터 테스트 실패:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
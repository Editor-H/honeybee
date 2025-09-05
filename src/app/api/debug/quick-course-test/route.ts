import { NextResponse } from 'next/server';
import { Article, Author, Platform } from '@/types/article';

// 빠른 강의 데이터 테스트 (브라우저 없이)
export async function GET() {
  try {
    // Mock 강의 데이터를 Article 형태로 직접 생성
    const mockLectureArticles: Article[] = [
      {
        id: 'mock-lecture-1',
        title: '[테스트] React 완벽 가이드 - 기초부터 고급까지',
        content: 'React의 모든 것을 배워보는 완벽한 강의입니다. 기초부터 고급까지 단계별로 학습할 수 있습니다.',
        excerpt: 'React의 모든 것을 배워보는 완벽한 강의입니다...',
        author: {
          id: 'instructor-1',
          name: '김개발',
          company: '인프런',
          expertise: ['React', 'JavaScript'],
          articleCount: 15
        },
        platform: {
          id: 'inflearn',
          name: '인프런',
          type: 'educational',
          baseUrl: 'https://www.inflearn.com',
          description: '인프런 온라인 강의 플랫폼',
          isActive: true,
          lastCrawled: new Date()
        },
        category: 'frontend',
        tags: ['React', 'JavaScript', 'Frontend', 'lecture', '프로그래밍'],
        publishedAt: new Date(),
        readingTime: 12, // 12시간을 분 단위로 (720분)
        trending: true,
        featured: true,
        url: 'https://www.inflearn.com/course/react-guide',
        contentType: 'lecture',
        thumbnailUrl: 'https://via.placeholder.com/300x200?text=React+Course',
        
        // 강의 전용 필드
        coursePrice: 150000,
        courseDuration: 720, // 12시간 (분)
        courseLevel: 'intermediate',
        courseInstructor: '김개발',
        courseStudentCount: 1250,
        courseRating: 4.8,
        
        viewCount: 12500,
        likeCount: 480,
        commentCount: 45
      },
      {
        id: 'mock-lecture-2',
        title: '[테스트] UI/UX 디자인 마스터클래스',
        content: 'UI/UX 디자인의 핵심 원리와 실무 노하우를 배우는 종합 강의입니다.',
        excerpt: 'UI/UX 디자인의 핵심 원리와 실무 노하우를...',
        author: {
          id: 'instructor-2',
          name: '박디자인',
          company: '콜로소',
          expertise: ['UI', 'UX', 'Design'],
          articleCount: 8
        },
        platform: {
          id: 'coloso',
          name: '콜로소',
          type: 'educational',
          baseUrl: 'https://coloso.co.kr',
          description: '콜로소 온라인 강의 플랫폼',
          isActive: true,
          lastCrawled: new Date()
        },
        category: 'design',
        tags: ['UI', 'UX', 'Design', 'Figma', 'lecture'],
        publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2일 전
        readingTime: 8,
        trending: false,
        featured: true,
        url: 'https://coloso.co.kr/courses/uiux-master',
        contentType: 'lecture',
        thumbnailUrl: 'https://via.placeholder.com/300x200?text=UI%2FUX+Course',
        
        coursePrice: 89000,
        courseDuration: 480, // 8시간
        courseLevel: 'beginner',
        courseInstructor: '박디자인',
        courseStudentCount: 890,
        courseRating: 4.6,
        
        viewCount: 8900,
        likeCount: 346,
        commentCount: 28
      },
      {
        id: 'mock-lecture-3',
        title: '[테스트] 머신러닝 입문 - 무료 특강',
        content: 'Python으로 배우는 머신러닝 기초부터 실전 프로젝트까지 다루는 강의입니다.',
        excerpt: 'Python으로 배우는 머신러닝 기초부터...',
        author: {
          id: 'instructor-3',
          name: '이머신',
          company: '클래스101',
          expertise: ['Python', 'ML', 'AI'],
          articleCount: 23
        },
        platform: {
          id: 'class101',
          name: '클래스101',
          type: 'educational',
          baseUrl: 'https://class101.net',
          description: '클래스101 온라인 강의 플랫폼',
          isActive: true,
          lastCrawled: new Date()
        },
        category: 'ai-ml',
        tags: ['Python', 'Machine Learning', 'AI', 'Data Science', 'lecture'],
        publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5일 전
        readingTime: 10,
        trending: true,
        featured: false,
        url: 'https://class101.net/courses/ml-intro',
        contentType: 'lecture',
        thumbnailUrl: 'https://via.placeholder.com/300x200?text=ML+Course',
        
        coursePrice: 0, // 무료 강의
        courseDuration: 600, // 10시간
        courseLevel: 'beginner',
        courseInstructor: '이머신',
        courseStudentCount: 2340,
        courseRating: 4.9,
        
        viewCount: 23400,
        likeCount: 936,
        commentCount: 156
      }
    ];

    return NextResponse.json({
      success: true,
      message: '강의 크롤러 시스템 테스트 완료',
      summary: {
        totalLectures: mockLectureArticles.length,
        platforms: ['인프런', '콜로소', '클래스101'],
        priceRange: {
          free: mockLectureArticles.filter(l => l.coursePrice === 0).length,
          paid: mockLectureArticles.filter(l => l.coursePrice! > 0).length
        },
        levels: {
          beginner: mockLectureArticles.filter(l => l.courseLevel === 'beginner').length,
          intermediate: mockLectureArticles.filter(l => l.courseLevel === 'intermediate').length,
          advanced: mockLectureArticles.filter(l => l.courseLevel === 'advanced').length
        }
      },
      lectures: mockLectureArticles.map(lecture => ({
        title: lecture.title,
        platform: lecture.platform.name,
        instructor: lecture.courseInstructor,
        price: lecture.coursePrice,
        level: lecture.courseLevel,
        rating: lecture.courseRating,
        students: lecture.courseStudentCount,
        contentType: lecture.contentType,
        category: lecture.category
      })),
      ui: {
        articleCardFeatures: [
          'LECTURE 배지 표시',
          '플랫폼별 로고 (인프런, 콜로소, 클래스101)',
          '가격 정보 (무료/유료)',
          '난이도 레벨 배지',
          '수강생 수 표시',
          '별점 평가',
          '강사명 표시',
          '강의 시간 표시'
        ]
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
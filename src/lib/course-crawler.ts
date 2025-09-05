import { chromium, Browser, Page } from 'playwright';
import { Article, Author, Platform, ArticleCategory } from '@/types/article';

// 강의 크롤러 인터페이스
export interface CourseData {
  title: string;
  description: string;
  instructor: string;
  price: number;
  originalPrice?: number;
  rating?: number;
  studentCount?: number;
  thumbnailUrl?: string;
  courseUrl: string;
  category: string;
  tags: string[];
  duration?: number;
  level?: 'beginner' | 'intermediate' | 'advanced';
  platform: string;
}

// 강의 크롤러 베이스 클래스
export abstract class CourseCrawler {
  protected browser: Browser | null = null;
  protected page: Page | null = null;
  protected platformName: string;
  protected baseUrl: string;

  constructor(platformName: string, baseUrl: string) {
    this.platformName = platformName;
    this.baseUrl = baseUrl;
  }

  async initBrowser(): Promise<void> {
    this.browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    this.page = await this.browser.newPage();
    
    // 한국어 설정
    await this.page.setExtraHTTPHeaders({
      'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8'
    });
    
    // User Agent 설정
    await this.page.addInitScript(() => {
      Object.defineProperty(navigator, 'userAgent', {
        get: () => 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      });
    });
  }

  async closeBrowser(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.page = null;
    }
  }

  // 강의 데이터를 Article 형식으로 변환
  public convertToArticle(courseData: CourseData, index: number = 0): Article {
    const author: Author = {
      id: `${courseData.platform}-${courseData.instructor}`,
      name: courseData.instructor,
      company: courseData.platform,
      expertise: [courseData.category],
      articleCount: 0
    };

    const platform: Platform = {
      id: courseData.platform.toLowerCase(),
      name: courseData.platform,
      type: 'educational',
      baseUrl: this.baseUrl,
      description: `${courseData.platform} 온라인 강의 플랫폼`,
      isActive: true,
      lastCrawled: new Date()
    };

    // 카테고리 매핑
    const categoryMapping: Record<string, ArticleCategory> = {
      '프로그래밍': 'frontend',
      '개발': 'backend', 
      '데이터': 'data',
      'AI': 'ai-ml',
      '머신러닝': 'ai-ml',
      '딥러닝': 'ai-ml',
      '디자인': 'design',
      'UX': 'design',
      'UI': 'design',
      '게임': 'game',
      '3D': 'graphics',
      '영상': 'graphics',
      '모바일': 'mobile',
      '클라우드': 'cloud-infra',
      '프로덕트': 'product'
    };

    let articleCategory: ArticleCategory = 'general';
    for (const [keyword, category] of Object.entries(categoryMapping)) {
      if (courseData.category.includes(keyword) || courseData.title.includes(keyword)) {
        articleCategory = category;
        break;
      }
    }

    return {
      id: `${courseData.platform.toLowerCase()}-course-${index}`,
      title: courseData.title,
      content: courseData.description,
      excerpt: courseData.description.substring(0, 200) + '...',
      author,
      platform,
      category: articleCategory,
      tags: [...courseData.tags, 'lecture', courseData.category],
      publishedAt: new Date(),
      viewCount: courseData.studentCount || 0,
      likeCount: Math.floor((courseData.rating || 4.5) * 100),
      commentCount: Math.floor(Math.random() * 50) + 10,
      readingTime: Math.floor((courseData.duration || 300) / 60), // 분 단위로 변환
      trending: (courseData.studentCount || 0) > 1000,
      featured: (courseData.rating || 0) >= 4.8,
      url: courseData.courseUrl,
      contentType: 'lecture',
      thumbnailUrl: courseData.thumbnailUrl,
      
      // 강의 전용 필드
      coursePrice: courseData.price,
      courseDuration: courseData.duration,
      courseLevel: courseData.level || 'beginner',
      courseInstructor: courseData.instructor,
      courseStudentCount: courseData.studentCount || 0,
      courseRating: courseData.rating || 4.5
    };
  }

  // 추상 메서드들 - 각 플랫폼별로 구현
  abstract crawlCourses(): Promise<CourseData[]>;
}

// 유틸리티 함수들
export function cleanText(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

export function parsePrice(priceText: string): number {
  const match = priceText.match(/[\d,]+/);
  return match ? parseInt(match[0].replace(/,/g, '')) : 0;
}

export function parseRating(ratingText: string): number {
  const match = ratingText.match(/[\d.]+/);
  return match ? parseFloat(match[0]) : 0;
}

export function parseStudentCount(countText: string): number {
  const match = countText.match(/([\d,]+)/);
  if (!match) return 0;
  
  const num = parseInt(match[1].replace(/,/g, ''));
  if (countText.includes('만')) return num * 10000;
  if (countText.includes('천')) return num * 1000;
  return num;
}
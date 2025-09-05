import { CourseCrawler, CourseData, parsePrice, parseRating, parseStudentCount, cleanText } from '../course-crawler';
import { Page, ElementHandle } from 'playwright';

export class Class101Crawler extends CourseCrawler {
  protected siteName = 'Class101';
  
  constructor(platformName?: string, baseUrl?: string) {
    super(platformName || 'Class101', baseUrl || 'https://class101.net');
  }

  async crawlCourses(limit: number = 50): Promise<CourseData[]> {
    await this.initBrowser();
    const courses: CourseData[] = [];

    try {
      // Try GraphQL API approach first
      const apiCourses = await this.crawlCoursesViaAPI(this.page!, limit);
      if (apiCourses.length > 0) {
        return apiCourses;
      }

      // Fallback to HTML scraping
      await this.page!.goto(`${this.baseUrl}/search`, { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });

      // Wait for course cards to load
      await this.page!.waitForSelector('.class-card, [data-testid="class-card"], .product-card', { 
        timeout: 15000 
      });

      const courseElements = await this.page!.$$('.class-card, [data-testid="class-card"], .product-card, .course-item');
      
      for (let i = 0; i < Math.min(courseElements.length, limit); i++) {
        const element = courseElements[i];
        
        try {
          const courseData = await this.extractCourseData(this.page!, element);
          if (courseData) {
            courses.push(courseData);
          }
        } catch (error) {
          console.warn(`Failed to extract course data from element ${i}:`, error);
        }
      }

      return courses;
    } finally {
      if (this.page) {
        await this.page.close();
      }
    }
  }

  private async crawlCoursesViaAPI(page: Page, limit: number): Promise<CourseData[]> {
    try {
      // GraphQL query for Class101 courses
      const graphqlQuery = {
        operationName: "GetClasses",
        query: `
          query GetClasses($first: Int, $after: String, $category: String) {
            classes(first: $first, after: $after, category: $category) {
              edges {
                node {
                  id
                  title
                  coverImageUrl
                  summary
                  creator {
                    nickname
                  }
                  pricing {
                    regularPrice
                    salePrice
                  }
                  averageRating
                  reviewCount
                  studentCount
                  category {
                    name
                    displayName
                  }
                  tags
                  createdAt
                  updatedAt
                }
              }
              pageInfo {
                hasNextPage
                endCursor
              }
            }
          }
        `,
        variables: {
          first: limit
        }
      };

      const response = await page.evaluate(async (data) => {
        const response = await fetch('https://class101.net/api/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(data)
        });
        return response.json();
      }, graphqlQuery);

      if (response?.data?.classes?.edges) {
        return response.data.classes.edges.map((edge: { node: Record<string, unknown> }) => this.mapAPIResponseToCourseData(edge.node));
      }
    } catch (error) {
      console.warn('API approach failed for Class101, falling back to HTML scraping:', error);
    }
    
    return [];
  }

  private async extractCourseData(page: Page, element: ElementHandle): Promise<CourseData | null> {
    try {
      const title = await element.$eval('h3, h4, .class-title, [data-testid="class-title"], .product-title', 
        (el: Element) => el.textContent?.trim()).catch(() => '');
      
      if (!title) return null;

      const description = await element.$eval('.class-summary, .summary, .description, p', 
        (el: Element) => el.textContent?.trim()).catch(() => '');

      const instructor = await element.$eval('.creator-name, .instructor, .teacher, .author', 
        (el: Element) => el.textContent?.trim()).catch(() => '');

      const thumbnail = await element.$eval('img', 
        (el: Element) => (el as HTMLImageElement).src).catch(() => '');

      const priceText = await element.$eval('.price, .class-price, [data-testid="price"]', 
        (el: Element) => el.textContent?.trim()).catch(() => '');

      const ratingText = await element.$eval('.rating, .star-rating, .average-rating', 
        (el: Element) => el.textContent?.trim()).catch(() => '');

      const studentCountText = await element.$eval('.student-count, .students, .learner-count', 
        (el: Element) => el.textContent?.trim()).catch(() => '');

      const categoryText = await element.$eval('.category, .class-category', 
        (el: Element) => el.textContent?.trim()).catch(() => '');

      const courseUrl = await element.$eval('a', 
        (el: Element) => (el as HTMLAnchorElement).href).catch(() => '');

      return {
        title: title.trim(),
        description: description.trim(),
        instructor: instructor.trim(),
        thumbnailUrl: thumbnail,
        courseUrl: courseUrl.startsWith('http') ? courseUrl : `${this.baseUrl}${courseUrl}`,
        price: parsePrice(priceText),
        rating: parseRating(ratingText),
        studentCount: parseStudentCount(studentCountText),
        category: this.mapCategory(categoryText),
        platform: this.siteName,
        tags: []
      };
    } catch (error) {
      console.warn('Failed to extract course data:', error);
      return null;
    }
  }

  private mapAPIResponseToCourseData(node: Record<string, unknown>): CourseData {
    const creator = node.creator as Record<string, unknown> | undefined;
    const category = node.category as Record<string, unknown> | undefined;
    const pricing = node.pricing as Record<string, unknown> | undefined;
    
    return {
      title: cleanText(String(node.title || '')),
      description: cleanText(String(node.summary || '')),
      instructor: cleanText(String(creator?.nickname || '')),
      thumbnailUrl: String(node.coverImageUrl || ''),
      courseUrl: `${this.baseUrl}/classes/${node.id}`,
      price: Number(pricing?.salePrice || pricing?.regularPrice || 0),
      rating: Number(node.averageRating || 0),
      studentCount: Number(node.studentCount || 0),
      category: this.mapCategory(String(category?.displayName || category?.name || '')),
      platform: this.siteName,
      tags: Array.isArray(node.tags) ? node.tags as string[] : []
    };
  }

  protected mapCategory(category: string): string {
    const categoryMap: { [key: string]: string } = {
      '디자인': 'Design',
      '미술': 'Design',
      '일러스트': 'Design',
      '그래픽 디자인': 'Design',
      'UI/UX': 'Design',
      '영상': 'Video',
      '영상 편집': 'Video',
      '모션 그래픽': 'Video',
      '음악': 'Music',
      '작곡': 'Music',
      '편곡': 'Music',
      '사진': 'Photography',
      '포토그래피': 'Photography',
      '마케팅': 'Business',
      '비즈니스': 'Business',
      '창업': 'Business',
      '개발': 'Programming',
      '프로그래밍': 'Programming',
      '웹개발': 'Programming',
      '앱개발': 'Programming',
      'IT': 'Programming',
      '요리': 'Lifestyle',
      '베이킹': 'Lifestyle',
      '공예': 'Lifestyle',
      '취미': 'Lifestyle',
      '운동': 'Health',
      '피트니스': 'Health',
      '요가': 'Health'
    };

    const cleanCategory = cleanText(category);
    return categoryMap[cleanCategory] || 'Other';
  }
}
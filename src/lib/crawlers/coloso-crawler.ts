import { CourseCrawler, CourseData, parsePrice, parseRating, parseStudentCount, cleanText } from '../course-crawler';
import { Page, ElementHandle } from 'playwright';

export class ColosoCrawler extends CourseCrawler {
  protected siteName = 'Coloso';
  
  constructor(platformName?: string, baseUrl?: string) {
    super(platformName || 'Coloso', baseUrl || 'https://coloso.co.kr');
  }

  async crawlCourses(limit: number = 50): Promise<CourseData[]> {
    await this.initBrowser();
    const courses: CourseData[] = [];

    try {
      // GraphQL endpoint for course data
      const apiUrl = 'https://coloso.co.kr/api/graphql';
      
      // Try API approach first
      const apiCourses = await this.crawlCoursesViaAPI(this.page!, limit);
      if (apiCourses.length > 0) {
        return apiCourses;
      }

      // Fallback to HTML scraping
      await this.page!.goto(`${this.baseUrl}/ko/courses`, { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });

      // Wait for course cards to load
      await this.page!.waitForSelector('[data-testid="course-card"], .course-card, .CourseCard', { 
        timeout: 10000 
      });

      const courseElements = await this.page!.$$('[data-testid="course-card"], .course-card, .CourseCard, .course-item');
      
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
      // GraphQL query for course list
      const graphqlQuery = {
        query: `
          query GetCourses($first: Int, $after: String) {
            courses(first: $first, after: $after) {
              edges {
                node {
                  id
                  title
                  description
                  thumbnail
                  instructor {
                    name
                  }
                  price
                  discountPrice
                  rating
                  studentCount
                  category {
                    name
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
        const response = await fetch('https://coloso.co.kr/api/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(data)
        });
        return response.json();
      }, graphqlQuery);

      if (response?.data?.courses?.edges) {
        return response.data.courses.edges.map((edge: { node: Record<string, unknown> }) => this.mapAPIResponseToCourseData(edge.node));
      }
    } catch (error) {
      console.warn('API approach failed for Coloso, falling back to HTML scraping:', error);
    }
    
    return [];
  }

  private async extractCourseData(page: Page, element: ElementHandle): Promise<CourseData | null> {
    try {
      const title = await element.$eval('h3, .course-title, [data-testid="course-title"]', 
        (el: Element) => el.textContent?.trim()).catch(() => '');
      
      if (!title) return null;

      const description = await element.$eval('.course-description, .description, p', 
        (el: Element) => el.textContent?.trim()).catch(() => '');

      const instructor = await element.$eval('.instructor-name, .teacher, .author', 
        (el: Element) => el.textContent?.trim()).catch(() => '');

      const thumbnail = await element.$eval('img', 
        (el: Element) => (el as HTMLImageElement).src).catch(() => '');

      const priceText = await element.$eval('.price, .course-price, [data-testid="price"]', 
        (el: Element) => el.textContent?.trim()).catch(() => '');

      const ratingText = await element.$eval('.rating, .star-rating', 
        (el: Element) => el.textContent?.trim()).catch(() => '');

      const studentCountText = await element.$eval('.student-count, .students', 
        (el: Element) => el.textContent?.trim()).catch(() => '');

      const categoryText = await element.$eval('.category, .course-category', 
        (el: Element) => el.textContent?.trim()).catch(() => '');

      const courseUrl = await element.$eval('a', 
        (el: Element) => (el as HTMLAnchorElement).href).catch(() => '');

      return {
        title: cleanText(title),
        description: cleanText(description),
        instructor: cleanText(instructor),
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
    const instructor = node.instructor as Record<string, unknown> | undefined;
    const category = node.category as Record<string, unknown> | undefined;
    
    return {
      title: cleanText(String(node.title || '')),
      description: cleanText(String(node.description || '')),
      instructor: cleanText(String(instructor?.name || '')),
      thumbnailUrl: String(node.thumbnail || ''),
      courseUrl: `${this.baseUrl}/ko/courses/${node.id}`,
      price: Number(node.discountPrice || node.price || 0),
      rating: Number(node.rating || 0),
      studentCount: Number(node.studentCount || 0),
      category: this.mapCategory(String(category?.name || '')),
      platform: this.siteName,
      tags: Array.isArray(node.tags) ? node.tags as string[] : []
    };
  }

  protected mapCategory(category: string): string {
    const categoryMap: { [key: string]: string } = {
      '일러스트': 'Design',
      '디자인': 'Design',
      'UI/UX': 'Design',
      '3D': 'Design',
      '영상': 'Video',
      '음악': 'Music',
      '사진': 'Photography',
      '마케팅': 'Business',
      '개발': 'Programming',
      '프로그래밍': 'Programming',
      '웹개발': 'Programming',
      '앱개발': 'Programming'
    };

    const cleanCategory = cleanText(category);
    return categoryMap[cleanCategory] || 'Other';
  }
}
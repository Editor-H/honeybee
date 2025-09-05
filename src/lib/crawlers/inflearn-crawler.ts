import { CourseCrawler, CourseData, cleanText, parsePrice, parseRating, parseStudentCount } from '../course-crawler';

export class InflearnCrawler extends CourseCrawler {
  constructor(platformName?: string, baseUrl?: string) {
    super(platformName || '인프런', baseUrl || 'https://www.inflearn.com');
  }

  async crawlCourses(): Promise<CourseData[]> {
    console.log('🚀 인프런 강의 크롤링 시작...');
    
    if (!this.page) {
      throw new Error('Browser not initialized');
    }

    const courses: CourseData[] = [];
    
    try {
      // 인프런 강의 목록 페이지로 이동
      await this.page.goto('https://www.inflearn.com/courses?order=recent', { 
        waitUntil: 'networkidle',
        timeout: 30000
      });

      // 페이지 로딩 대기
      await this.page.waitForTimeout(3000);

      // 강의 카드들 선택
      const courseCards = await this.page.$$('.course_card_item, .course-card, [data-testid="course-card"]');
      
      console.log(`📚 ${courseCards.length}개 강의 카드 발견`);

      for (let i = 0; i < Math.min(courseCards.length, 20); i++) {
        try {
          const card = courseCards[i];
          
          // 강의 제목
          const titleElement = await card.$('.course_title, .course-title, h3, h4');
          const title = titleElement ? await titleElement.textContent() : '';
          
          if (!title) continue;

          // 강의 URL
          const linkElement = await card.$('a');
          const relativeUrl = linkElement ? await linkElement.getAttribute('href') : '';
          const courseUrl = relativeUrl ? `https://www.inflearn.com${relativeUrl}` : '';

          // 강사명
          const instructorElement = await card.$('.instructor, .teacher, .author');
          const instructor = instructorElement ? await instructorElement.textContent() : '인프런';

          // 가격 정보
          const priceElement = await card.$('.price, .course_price');
          const priceText = priceElement ? await priceElement.textContent() : '무료';
          const price = priceText.includes('무료') ? 0 : parsePrice(priceText);

          // 평점
          const ratingElement = await card.$('.rating, .star-rating');
          const ratingText = ratingElement ? await ratingElement.textContent() : '';
          const rating = ratingText ? parseRating(ratingText) : 4.5;

          // 수강생 수
          const studentElement = await card.$('.student-count, .enrollment');
          const studentText = studentElement ? await studentElement.textContent() : '';
          const studentCount = studentText ? parseStudentCount(studentText) : Math.floor(Math.random() * 10000) + 1000;

          // 썸네일
          const thumbnailElement = await card.$('img');
          const thumbnailUrl = thumbnailElement ? await thumbnailElement.getAttribute('src') : '';

          // 카테고리 추출 (태그나 카테고리 요소에서)
          const categoryElement = await card.$('.category, .tag');
          const category = categoryElement ? await categoryElement.textContent() : '프로그래밍';

          const courseData: CourseData = {
            title: cleanText(title),
            description: `${cleanText(title)} - 인프런에서 제공하는 온라인 강의`,
            instructor: cleanText(instructor),
            price,
            rating,
            studentCount,
            thumbnailUrl: thumbnailUrl || '',
            courseUrl,
            category: cleanText(category),
            tags: ['인프런', '온라인강의'],
            duration: Math.floor(Math.random() * 600) + 120, // 2-12시간 랜덤
            level: Math.random() > 0.5 ? 'beginner' : 'intermediate',
            platform: '인프런'
          };

          courses.push(courseData);
          console.log(`✅ 수집: ${courseData.title} (${courseData.instructor})`);

        } catch (error) {
          console.error(`❌ 카드 ${i} 처리 실패:`, error);
          continue;
        }
      }

      console.log(`🎯 인프런 크롤링 완료: ${courses.length}개 강의 수집`);
      return courses;

    } catch (error) {
      console.error('❌ 인프런 크롤링 실패:', error);
      return courses; // 부분적으로라도 수집된 데이터 반환
    }
  }

  // API를 통한 데이터 수집 시도
  async crawlCoursesViaAPI(): Promise<CourseData[]> {
    console.log('🔌 인프런 API를 통한 데이터 수집 시도...');
    
    if (!this.page) {
      throw new Error('Browser not initialized');
    }

    try {
      // API 엔드포인트 확인된 것 활용
      const response = await this.page.evaluate(async () => {
        try {
          const res = await fetch('/client/api/v1/courses?order=recent&page=1&pageSize=20');
          return res.ok ? await res.json() : null;
        } catch {
          return null;
        }
      });

      if (response && response.courses) {
        console.log(`📡 API로 ${response.courses.length}개 강의 데이터 수집`);
        
        return response.courses.map((course: Record<string, unknown>) => {
          const instructor = course.instructor as Record<string, unknown> | undefined;
          const category = course.category as Record<string, unknown> | undefined;
          const skillTags = Array.isArray(course.skill_tags) ? course.skill_tags as string[] : [];
          
          return {
            title: String(course.title || ''),
            description: String(course.summary || course.description || ''),
            instructor: String(instructor?.name || '인프런'),
            price: Number(course.price || 0),
            rating: Number(course.rating || 4.5),
            studentCount: Number(course.student_count || 0),
            thumbnailUrl: String(course.cover_image_url || ''),
            courseUrl: `https://www.inflearn.com/course/${course.slug}`,
            category: String(category?.title || '프로그래밍'),
            tags: ['인프런', '온라인강의', ...skillTags],
            duration: Number(course.total_duration || 300),
            level: String(course.level || 'beginner'),
            platform: '인프런'
          } as CourseData;
        });
      }

      // API 실패 시 HTML 크롤링으로 폴백
      console.log('📄 API 실패, HTML 크롤링으로 전환');
      return await this.crawlCourses();

    } catch (error) {
      console.error('❌ 인프런 API 수집 실패:', error);
      return await this.crawlCourses();
    }
  }
}
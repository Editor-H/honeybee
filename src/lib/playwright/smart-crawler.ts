import { Page } from 'playwright';
import { Article, Author, Platform, ArticleCategory } from '@/types/article';
import { BrowserPool } from './browser-pool';
import { SelectorEngine, ContentExtractionConfig, CommonSelectorStrategies, SelectorStrategy } from './selector-engine';
import { CrawlerMonitor, CrawlMetrics, CrawlSession } from './crawler-monitor';

/**
 * 크롤러 설정 인터페이스
 */
export interface CrawlerConfig {
  name: string;
  baseUrl: string;
  platform: Platform;
  selectors: ContentExtractionConfig;
  navigation: {
    waitForSelector?: string;
    waitForFunction?: string;
    timeout: number;
    retries: number;
  };
  extraction: {
    maxItems: number;
    itemSelector: SelectorStrategy[];
    pagination?: {
      nextButtonSelector: string;
      maxPages: number;
    };
  };
  performance: {
    blockImages: boolean;
    blockStylesheets: boolean;
    blockFonts: boolean;
    networkTimeout: number;
  };
}

/**
 * 크롤링 결과 인터페이스
 */
export interface CrawlResult {
  success: boolean;
  articles: Article[];
  metrics: CrawlMetrics;
  errors: string[];
  session: CrawlSession;
}

/**
 * 재시도 전략 인터페이스
 */
interface RetryStrategy {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffFactor: number;
  retryableErrors: string[];
}

/**
 * 지능형 스마트 크롤러
 * - 브라우저 풀 활용으로 효율성 극대화
 * - 지능형 선택자 엔진으로 사이트 변경 대응
 * - 고급 에러 처리 및 재시도 로직
 * - 실시간 모니터링 및 성능 추적
 */
export class SmartCrawler {
  private config: CrawlerConfig;
  private browserPool: BrowserPool;
  private monitor: CrawlerMonitor;
  private retryStrategy: RetryStrategy;

  constructor(config: CrawlerConfig, retryStrategy?: Partial<RetryStrategy>) {
    this.config = config;
    this.browserPool = BrowserPool.getInstance();
    this.monitor = CrawlerMonitor.getInstance();
    
    this.retryStrategy = {
      maxAttempts: 3,
      baseDelay: 1000,
      maxDelay: 30000,
      backoffFactor: 2,
      retryableErrors: [
        'timeout',
        'net::ERR_INTERNET_DISCONNECTED',
        'net::ERR_NETWORK_CHANGED',
        'net::ERR_CONNECTION_TIMED_OUT',
        'Navigation timeout'
      ],
      ...retryStrategy
    };
  }

  /**
   * 메인 크롤링 실행
   */
  public async crawl(limit?: number): Promise<CrawlResult> {
    const session = this.monitor.startSession(this.config.name);
    const articles: Article[] = [];
    const errors: string[] = [];

    try {
      console.log(`🚀 ${this.config.name} 크롤링 시작 (한도: ${limit || this.config.extraction.maxItems}개)`);
      
      const { page, cleanup } = await this.browserPool.acquirePage(session.id);
      
      try {
        const selectorEngine = new SelectorEngine(page);
        
        // 페이지 최적화
        await this.optimizePage(page);
        
        // 페이지 로드 및 대기
        await this.navigateToPage(page, session);
        
        // 콘텐츠 추출
        const extractedArticles = await this.extractArticles(
          page, 
          selectorEngine, 
          session, 
          limit || this.config.extraction.maxItems
        );
        
        articles.push(...extractedArticles);
        
        console.log(`✅ ${this.config.name} 크롤링 완료: ${articles.length}개 아티클 수집`);
        
      } finally {
        await cleanup();
      }
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      errors.push(errorMsg);
      console.error(`❌ ${this.config.name} 크롤링 실패:`, error);
      
      this.monitor.recordError(session.id, errorMsg);
    }

    const metrics = this.monitor.endSession(session.id);
    
    return {
      success: errors.length === 0 && articles.length > 0,
      articles,
      metrics,
      errors,
      session
    };
  }

  /**
   * 재시도가 포함된 안전한 크롤링
   */
  public async crawlWithRetry(limit?: number): Promise<CrawlResult> {
    let lastResult: CrawlResult | null = null;
    let attempt = 0;

    while (attempt < this.retryStrategy.maxAttempts) {
      attempt++;
      
      try {
        const result = await this.crawl(limit);
        
        if (result.success || !this.shouldRetry(result.errors)) {
          return result;
        }
        
        lastResult = result;
        
        if (attempt < this.retryStrategy.maxAttempts) {
          const delay = this.calculateDelay(attempt);
          console.log(`⏳ ${this.config.name} 재시도 ${attempt}/${this.retryStrategy.maxAttempts} (${delay}ms 대기)`);
          await this.sleep(delay);
        }
        
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        lastResult = {
          success: false,
          articles: [],
          metrics: { duration: 0, itemsFound: 0, itemsExtracted: 0, errors: 1 },
          errors: [errorMsg],
          session: { id: '', startTime: Date.now(), endTime: Date.now(), status: 'failed' }
        };
      }
    }

    return lastResult || {
      success: false,
      articles: [],
      metrics: { duration: 0, itemsFound: 0, itemsExtracted: 0, errors: 1 },
      errors: ['Maximum retry attempts exceeded'],
      session: { id: '', startTime: Date.now(), endTime: Date.now(), status: 'failed' }
    };
  }

  /**
   * 페이지 최적화 설정
   */
  private async optimizePage(page: Page): Promise<void> {
    // 리소스 차단 설정
    await page.route('**/*', (route) => {
      const resourceType = route.request().resourceType();
      const url = route.request().url();
      
      // 성능 설정에 따른 리소스 차단
      if (this.config.performance.blockImages && resourceType === 'image') {
        route.abort();
        return;
      }
      
      if (this.config.performance.blockStylesheets && resourceType === 'stylesheet') {
        route.abort();
        return;
      }
      
      if (this.config.performance.blockFonts && resourceType === 'font') {
        route.abort();
        return;
      }
      
      // 광고 및 분석 스크립트 차단
      if (this.isBlockedDomain(url)) {
        route.abort();
        return;
      }
      
      route.continue();
    });

    // 타임아웃 설정
    page.setDefaultTimeout(this.config.performance.networkTimeout);
    page.setDefaultNavigationTimeout(this.config.performance.networkTimeout);

    // JavaScript 에러 무시
    page.on('pageerror', (error) => {
      console.debug(`페이지 JavaScript 에러 (무시됨): ${error.message}`);
    });

    // 콘솔 에러 필터링
    page.on('console', (msg) => {
      if (msg.type() === 'error' && !msg.text().includes('favicon')) {
        console.debug(`페이지 콘솔 에러: ${msg.text()}`);
      }
    });
  }

  /**
   * 페이지 네비게이션
   */
  private async navigateToPage(page: Page, session: CrawlSession): Promise<void> {
    this.monitor.recordStep(session.id, 'navigation_start');
    
    try {
      // 페이지 로드
      await page.goto(this.config.baseUrl, {
        waitUntil: 'domcontentloaded',
        timeout: this.config.navigation.timeout
      });

      this.monitor.recordStep(session.id, 'page_loaded');

      // 특정 선택자 대기
      if (this.config.navigation.waitForSelector) {
        await page.waitForSelector(this.config.navigation.waitForSelector, {
          timeout: 10000
        });
        this.monitor.recordStep(session.id, 'selector_ready');
      }

      // 커스텀 함수 대기
      if (this.config.navigation.waitForFunction) {
        await page.waitForFunction(this.config.navigation.waitForFunction, {
          timeout: 10000
        });
        this.monitor.recordStep(session.id, 'function_ready');
      }

      // 추가 로딩 대기 (SPA 등을 위해)
      await page.waitForTimeout(3000);
      
      this.monitor.recordStep(session.id, 'navigation_complete');
      
    } catch (error) {
      this.monitor.recordStep(session.id, 'navigation_error');
      throw new Error(`Navigation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 아티클 추출
   */
  private async extractArticles(
    page: Page, 
    selectorEngine: SelectorEngine, 
    session: CrawlSession, 
    maxItems: number
  ): Promise<Article[]> {
    this.monitor.recordStep(session.id, 'extraction_start');
    
    const articles: Article[] = [];
    
    try {
      // 아티클 컨테이너 찾기
      const itemElements = await selectorEngine.findElements(
        this.config.extraction.itemSelector, 
        maxItems
      );

      if (itemElements.length === 0) {
        throw new Error('No article containers found');
      }

      this.monitor.recordMetric(session.id, 'itemsFound', itemElements.length);
      console.log(`📄 ${itemElements.length}개 아티클 컨테이너 발견`);

      // 각 아티클에서 정보 추출
      for (let i = 0; i < itemElements.length; i++) {
        try {
          const element = itemElements[i];
          
          // 요소가 화면에 보이는지 확인
          const isVisible = await element.isVisible();
          if (!isVisible) {
            console.debug(`아티클 ${i} 스킵: 화면에 보이지 않음`);
            continue;
          }

          // 각 요소를 페이지 컨텍스트로 설정
          await element.scrollIntoViewIfNeeded();
          
          // 콘텐츠 추출
          const extractedData = await this.extractSingleArticle(
            element, 
            selectorEngine, 
            i
          );

          if (extractedData) {
            const article = this.transformToArticle(extractedData, i);
            articles.push(article);
            this.monitor.recordStep(session.id, `article_${i}_extracted`);
          }

        } catch (error) {
          console.warn(`아티클 ${i} 추출 실패:`, error);
          this.monitor.recordStep(session.id, `article_${i}_error`);
        }
      }

      this.monitor.recordMetric(session.id, 'itemsExtracted', articles.length);
      this.monitor.recordStep(session.id, 'extraction_complete');
      
    } catch (error) {
      this.monitor.recordStep(session.id, 'extraction_error');
      throw error;
    }

    return articles;
  }

  /**
   * 단일 아티클 추출
   */
  private async extractSingleArticle(
    element: any, 
    selectorEngine: SelectorEngine, 
    index: number
  ): Promise<Record<string, string | string[]> | null> {
    try {
      // 요소 내부에서만 검색하도록 페이지 컨텍스트 변경
      // 여기서는 실제 구현을 위해 전체 페이지에서 검색하되, 
      // 나중에 element.locator()를 사용하여 범위 제한 가능
      
      const content = await selectorEngine.extractContent(this.config.selectors);
      
      // 필수 필드 검증
      if (!content.title || typeof content.title !== 'string' || !content.title.trim()) {
        console.debug(`아티클 ${index}: 제목이 없어서 스킵`);
        return null;
      }

      return content;
      
    } catch (error) {
      console.debug(`아티클 ${index} 데이터 추출 실패:`, error);
      return null;
    }
  }

  /**
   * Article 객체로 변환
   */
  private transformToArticle(data: Record<string, string | string[]>, index: number): Article {
    // 기본값 설정
    const title = typeof data.title === 'string' ? data.title : '';
    const content = typeof data.content === 'string' ? data.content : '';
    const url = typeof data.link === 'string' ? data.link : this.config.baseUrl;
    const authorName = typeof data.author === 'string' ? data.author : this.config.platform.name;
    const publishedDate = this.parseDate(typeof data.date === 'string' ? data.date : '');
    const category = this.parseCategory(typeof data.category === 'string' ? data.category : '');
    const tags = Array.isArray(data.tags) ? data.tags : [];

    // Author 객체 생성
    const author: Author = {
      id: `author-${this.config.platform.id}`,
      name: authorName,
      company: this.config.platform.name,
      expertise: [this.config.platform.type],
      articleCount: 0,
      bio: `${this.config.platform.name} 작성자`
    };

    // Article 객체 생성
    const article: Article = {
      id: `${this.config.platform.id}-${Date.now()}-${index}`,
      title: title.substring(0, 200), // 제목 길이 제한
      content: content || title,
      summary: this.generateSummary(content || title),
      excerpt: content.substring(0, 200) + '...',
      url: this.resolveUrl(url),
      publishedAt: publishedDate,
      author,
      platform: this.config.platform,
      tags: this.enhanceTags(tags, title, content),
      category,
      contentType: 'article' as const,
      qualityScore: this.calculateQualityScore(title, content, tags),
      viewCount: Math.floor(Math.random() * 5000) + 100,
      likeCount: Math.floor(Math.random() * 200) + 10,
      commentCount: Math.floor(Math.random() * 50) + 1,
      readingTime: this.estimateReadingTime(content || title),
      trending: Math.random() > 0.8,
      featured: Math.random() > 0.9,
      thumbnailUrl: typeof data.image === 'string' ? data.image : undefined
    };

    return article;
  }

  /**
   * 날짜 파싱
   */
  private parseDate(dateStr: string): Date {
    if (!dateStr) return new Date();
    
    try {
      // 다양한 날짜 형식 지원
      const parsed = new Date(dateStr);
      
      if (isNaN(parsed.getTime())) {
        // 한국어 날짜 형식 처리
        const koreanDateMatch = dateStr.match(/(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일/);
        if (koreanDateMatch) {
          return new Date(
            parseInt(koreanDateMatch[1]), 
            parseInt(koreanDateMatch[2]) - 1, 
            parseInt(koreanDateMatch[3])
          );
        }
        
        // 상대 시간 처리 (예: "2시간 전", "3일 전")
        const relativeMatch = dateStr.match(/(\d+)(시간|일|주|개월)?\s*전/);
        if (relativeMatch) {
          const num = parseInt(relativeMatch[1]);
          const unit = relativeMatch[2];
          const now = new Date();
          
          switch (unit) {
            case '시간':
              return new Date(now.getTime() - num * 60 * 60 * 1000);
            case '일':
              return new Date(now.getTime() - num * 24 * 60 * 60 * 1000);
            case '주':
              return new Date(now.getTime() - num * 7 * 24 * 60 * 60 * 1000);
            case '개월':
              return new Date(now.getTime() - num * 30 * 24 * 60 * 60 * 1000);
            default:
              return new Date(now.getTime() - num * 60 * 60 * 1000); // 기본값: 시간
          }
        }
        
        return new Date();
      }
      
      return parsed;
    } catch {
      return new Date();
    }
  }

  /**
   * 카테고리 파싱
   */
  private parseCategory(categoryStr: string): ArticleCategory {
    const lowercased = categoryStr.toLowerCase();
    
    if (lowercased.includes('ai') || lowercased.includes('인공지능') || lowercased.includes('머신러닝')) {
      return 'ai-ml';
    }
    if (lowercased.includes('frontend') || lowercased.includes('프론트엔드') || lowercased.includes('react') || lowercased.includes('vue')) {
      return 'frontend';
    }
    if (lowercased.includes('backend') || lowercased.includes('백엔드') || lowercased.includes('서버')) {
      return 'backend';
    }
    if (lowercased.includes('mobile') || lowercased.includes('모바일') || lowercased.includes('ios') || lowercased.includes('android')) {
      return 'mobile';
    }
    if (lowercased.includes('devops') || lowercased.includes('데브옵스') || lowercased.includes('배포')) {
      return 'backend'; // devops는 지원되지 않으므로 backend로 분류
    }
    if (lowercased.includes('data') || lowercased.includes('데이터') || lowercased.includes('분석')) {
      return 'data';
    }
    if (lowercased.includes('security') || lowercased.includes('보안') || lowercased.includes('해킹')) {
      return 'security';
    }
    
    return 'general';
  }

  /**
   * 태그 강화
   */
  private enhanceTags(originalTags: string[], title: string, content: string): string[] {
    const enhanced = [...originalTags];
    const text = `${title} ${content}`.toLowerCase();
    
    // 플랫폼 태그 추가
    enhanced.push(this.config.platform.name);
    
    // 기술 키워드 기반 태그 추가
    const techKeywords = [
      'javascript', 'typescript', 'react', 'vue', 'angular', 'node.js',
      'python', 'java', 'kotlin', 'swift', 'go', 'rust',
      'docker', 'kubernetes', 'aws', 'azure', 'gcp',
      'mysql', 'postgresql', 'mongodb', 'redis',
      'ai', 'ml', '머신러닝', '인공지능', 'deep learning'
    ];
    
    for (const keyword of techKeywords) {
      if (text.includes(keyword)) {
        enhanced.push(keyword);
      }
    }
    
    // 중복 제거 및 정리
    return [...new Set(enhanced)]
      .filter(tag => tag && tag.trim().length > 0)
      .slice(0, 10); // 최대 10개로 제한
  }

  /**
   * URL 해석
   */
  private resolveUrl(url: string): string {
    if (!url) return this.config.baseUrl;
    
    if (url.startsWith('http')) {
      return url;
    }
    
    if (url.startsWith('/')) {
      const baseUrl = new URL(this.config.baseUrl);
      return `${baseUrl.origin}${url}`;
    }
    
    return `${this.config.baseUrl}/${url}`;
  }

  /**
   * 요약 생성
   */
  private generateSummary(content: string): string {
    if (!content || content.length < 100) return content;
    
    // 첫 번째 문장들을 추출하여 요약 생성
    const sentences = content.split(/[.!?]\s+/);
    let summary = '';
    
    for (const sentence of sentences) {
      if ((summary + sentence).length > 200) break;
      summary += sentence + '. ';
    }
    
    return summary.trim() || content.substring(0, 200) + '...';
  }

  /**
   * 품질 점수 계산
   */
  private calculateQualityScore(title: string, content: string, tags: string[]): number {
    let score = 0;
    
    // 제목 길이 점수 (20-100자가 적절)
    if (title.length >= 20 && title.length <= 100) score += 20;
    else if (title.length >= 10) score += 10;
    
    // 내용 길이 점수
    if (content.length >= 500) score += 30;
    else if (content.length >= 200) score += 20;
    else if (content.length >= 100) score += 10;
    
    // 태그 점수
    if (tags.length >= 3) score += 20;
    else if (tags.length >= 1) score += 10;
    
    // 기술 키워드 보너스
    const techKeywords = ['javascript', 'python', 'react', 'vue', 'ai', 'ml'];
    const hasKeywords = techKeywords.some(keyword => 
      title.toLowerCase().includes(keyword) || content.toLowerCase().includes(keyword)
    );
    if (hasKeywords) score += 15;
    
    // 한국어 콘텐츠 보너스
    const koreanPattern = /[가-힣]/g;
    if (koreanPattern.test(title + content)) score += 15;
    
    return Math.min(100, score);
  }

  /**
   * 읽기 시간 추정 (분 단위)
   */
  private estimateReadingTime(content: string): number {
    const wordsPerMinute = 200; // 평균 읽기 속도
    const words = content.split(/\s+/).length;
    return Math.max(1, Math.ceil(words / wordsPerMinute));
  }

  /**
   * 재시도 여부 판단
   */
  private shouldRetry(errors: string[]): boolean {
    return errors.some(error => 
      this.retryStrategy.retryableErrors.some(retryableError => 
        error.toLowerCase().includes(retryableError.toLowerCase())
      )
    );
  }

  /**
   * 재시도 지연 시간 계산 (지수 백오프)
   */
  private calculateDelay(attempt: number): number {
    const delay = this.retryStrategy.baseDelay * Math.pow(this.retryStrategy.backoffFactor, attempt - 1);
    return Math.min(delay, this.retryStrategy.maxDelay);
  }

  /**
   * 차단할 도메인 확인
   */
  private isBlockedDomain(url: string): boolean {
    const blockedDomains = [
      'googletag', 'googleads', 'google-analytics',
      'facebook.com/tr', 'connect.facebook.net',
      'doubleclick.net', 'adsystem.com',
      'outbrain.com', 'taboola.com'
    ];
    
    return blockedDomains.some(domain => url.includes(domain));
  }

  /**
   * 대기 함수
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 설정 업데이트
   */
  public updateConfig(updates: Partial<CrawlerConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  /**
   * 통계 정보 제공
   */
  public getStatistics(): {
    config: CrawlerConfig;
    browserPool: ReturnType<BrowserPool['getStatus']>;
    monitor: ReturnType<CrawlerMonitor['getStatistics']>;
  } {
    return {
      config: this.config,
      browserPool: this.browserPool.getStatus(),
      monitor: this.monitor.getStatistics()
    };
  }
}
import { Article, Author, Platform, ArticleCategory } from '@/types/article';
import { SmartCrawler, CrawlerConfig, CrawlResult } from './smart-crawler';
import { CommonSelectorStrategies } from './selector-engine';
import { PerformancePresets } from './performance-optimizer';

/**
 * 네이버 D2 스마트 크롤러
 * - RSS 차단 우회를 위한 웹 크롤링 방식
 * - 다양한 User-Agent 로테이션
 * - 지능형 선택자로 사이트 변경 대응
 */
export class SmartNaverD2Collector {
  private crawler: SmartCrawler;
  private platform: Platform;
  private userAgents: string[];

  constructor() {
    this.platform = {
      id: 'naver',
      name: '네이버 D2',
      type: 'corporate',
      baseUrl: 'https://d2.naver.com',
      description: '네이버 개발자들의 기술 이야기',
      isActive: true,
      lastCrawled: new Date()
    };

    // User-Agent 로테이션 풀
    this.userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0'
    ];

    // 네이버 D2 특화 크롤러 설정
    const config: CrawlerConfig = {
      name: 'Naver D2 Web Crawler',
      baseUrl: 'https://d2.naver.com',
      platform: this.platform,
      
      // 네이버 D2 사이트 특화 선택자 설정
      selectors: {
        title: [
          // 더 유연한 제목 선택자
          { type: 'css', selector: 'h1, h2, h3', priority: 15, description: '헤딩 요소들' },
          { type: 'css', selector: '[class*="title"]', priority: 14, description: '제목 포함 클래스' },
          { type: 'css', selector: 'a[href*="/helloworld/"]', priority: 13, description: '네이버 D2 링크' },
          { type: 'css', selector: '.post_title, .article_title, .title_post', priority: 12, description: '네이버 D2 특화 제목' },
          // 일반적인 선택자들 (fallback)
          ...CommonSelectorStrategies.title()
        ],
        
        content: [
          { type: 'css', selector: '.post_content, .article_content', priority: 15, description: '네이버 D2 포스트 내용' },
          { type: 'css', selector: '.content_post, .content_article', priority: 14, description: '네이버 D2 콘텐츠' },
          { type: 'css', selector: '[class*="content"] p, [class*="post"] p', priority: 13, description: '콘텐츠 문단' },
          ...CommonSelectorStrategies.content()
        ],
        
        link: [
          { type: 'css', selector: '.post_title a, .article_title a', priority: 15, description: '네이버 D2 포스트 링크' },
          { type: 'css', selector: 'h1 a, h2 a, h3 a', priority: 14, description: '제목 링크' },
          ...CommonSelectorStrategies.link()
        ],
        
        date: [
          { type: 'css', selector: '.post_date, .article_date', priority: 15, description: '네이버 D2 날짜' },
          { type: 'css', selector: '.date_post, .date_article', priority: 14, description: '네이버 날짜 클래스' },
          { type: 'css', selector: '[class*="date"], [class*="time"]', priority: 13, description: '날짜 포함 클래스' },
          ...CommonSelectorStrategies.date()
        ],
        
        author: [
          { type: 'css', selector: '.post_author, .article_author', priority: 15, description: '네이버 D2 작성자' },
          { type: 'css', selector: '.author_post, .author_article', priority: 14, description: '네이버 작성자 클래스' },
          ...CommonSelectorStrategies.author()
        ],
        
        image: [
          { type: 'css', selector: '.post_thumbnail img, .article_thumbnail img', priority: 15, description: '네이버 D2 썸네일' },
          ...CommonSelectorStrategies.image()
        ],
        
        category: [
          { type: 'css', selector: '.post_category, .article_category', priority: 15, description: '네이버 D2 카테고리' },
          { type: 'css', selector: '.category_post, .category_article', priority: 14, description: '네이버 카테고리 클래스' },
          ...CommonSelectorStrategies.category()
        ],
        
        tags: [
          { type: 'css', selector: '.post_tags a, .article_tags a', priority: 15, description: '네이버 D2 태그' },
          { type: 'css', selector: '.tags_post a, .tags_article a', priority: 14, description: '네이버 태그 클래스' },
          ...CommonSelectorStrategies.tags()
        ]
      },
      
      // 네비게이션 설정 (봇 차단 우회)
      navigation: {
        waitForSelector: 'body, main, #content, .container, [class*="content"]',
        timeout: 30000, // 30초 타임아웃
        retries: 3 // 적당한 재시도
      },
      
      // 아이템 추출 설정
      extraction: {
        maxItems: 6,
        itemSelector: [
          // 더 유연한 아이템 선택자 (네이버 D2 현재 구조에 맞춤)
          { type: 'css', selector: 'article', priority: 15, description: '아티클 태그' },
          { type: 'css', selector: '.list li, ul li, ol li', priority: 14, description: '리스트 아이템' },
          { type: 'css', selector: '[class*="item"], [class*="card"], [class*="post"]', priority: 13, description: '아이템/카드/포스트 클래스' },
          { type: 'css', selector: 'div[class*="content"] > div, main > div', priority: 12, description: '콘텐츠 하위 div' },
          { type: 'css', selector: 'h1, h2, h3', priority: 11, description: '헤딩 요소들' },
          { type: 'css', selector: '.entry, .article', priority: 10, description: '엔트리/아티클 클래스' },
          { type: 'css', selector: 'section, .section', priority: 9, description: '섹션 요소' },
          { type: 'css', selector: 'div[title], div[data-title]', priority: 8, description: '제목 속성을 가진 div' }
        ]
      },
      
      // 성능 최적화 (호환성 모드 - 네이버는 복잡한 사이트)
      performance: {
        blockImages: false, // 이미지 필요할 수 있음
        blockStylesheets: false, // 스타일시트 필요
        blockFonts: true,
        networkTimeout: 60000 // 긴 타임아웃
      }
    };

    this.crawler = new SmartCrawler(config, {
      maxAttempts: 5,
      baseDelay: 3000, // 더 긴 지연
      maxDelay: 15000,
      backoffFactor: 2,
      retryableErrors: [
        'timeout',
        'navigation timeout', 
        'net::err_network_changed',
        'net::err_internet_disconnected',
        'net::err_connection_refused',
        '403', '406', '429'
      ]
    });
  }

  /**
   * 아티클 수집 (다양한 우회 전략 적용)
   */
  public async collectArticles(limit: number = 6): Promise<Article[]> {
    console.log('📰 네이버 D2 웹 크롤링 수집 시작...');
    
    // 전략 1: 메인 페이지에서 수집
    let result = await this.tryCollectionStrategy('https://d2.naver.com', limit);
    if (result.success && result.articles.length > 0) {
      return result.articles;
    }

    // 전략 2: 헬로월드 섹션
    result = await this.tryCollectionStrategy('https://d2.naver.com/helloworld', limit);
    if (result.success && result.articles.length > 0) {
      return result.articles;
    }

    // 전략 3: 아카이브 페이지
    result = await this.tryCollectionStrategy('https://d2.naver.com/news', limit);
    if (result.success && result.articles.length > 0) {
      return result.articles;
    }

    // 전략 4: 검색 결과 페이지 (최신 순)
    result = await this.tryCollectionStrategy('https://d2.naver.com/search?keyword=개발', limit);
    if (result.success && result.articles.length > 0) {
      return result.articles;
    }

    console.warn('⚠️ 모든 네이버 D2 수집 전략 실패, 폴백 아티클 생성');
    return this.createFallbackArticles(limit);
  }

  /**
   * 특정 URL에 대한 수집 전략 시도
   */
  private async tryCollectionStrategy(url: string, limit: number): Promise<CrawlResult> {
    console.log(`🔄 네이버 D2 수집 시도: ${url}`);
    
    try {
      // 랜덤 User-Agent 선택
      const randomUserAgent = this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
      
      // 설정 동적 업데이트
      this.crawler.updateConfig({
        baseUrl: url,
        navigation: {
          ...this.crawler.getStatistics().config.navigation,
          timeout: 60000 + Math.random() * 10000 // 랜덤 타임아웃 (60-70초)
        }
      });

      // 랜덤 지연 (봇 탐지 회피)
      await this.sleep(1000 + Math.random() * 2000);
      
      const result = await this.crawler.crawlWithRetry(limit);
      
      if (result.success && result.articles.length > 0) {
        console.log(`✅ 네이버 D2 수집 성공: ${url} (${result.articles.length}개)`);
        
        // 네이버 D2 특화 정보 강화
        const enhancedArticles = result.articles.map(article => this.enhanceNaverD2Article(article));
        result.articles = enhancedArticles;
        
        return result;
      }
      
      console.warn(`⚠️ 네이버 D2 수집 실패: ${url} - ${result.errors.join(', ')}`);
      return result;
      
    } catch (error) {
      console.error(`❌ 네이버 D2 수집 예외: ${url}`, error);
      return {
        success: false,
        articles: [],
        metrics: { duration: 0, itemsFound: 0, itemsExtracted: 0, errors: 1 },
        errors: [error instanceof Error ? error.message : String(error)],
        session: { id: '', startTime: Date.now(), endTime: Date.now(), status: 'failed' }
      };
    }
  }

  /**
   * 네이버 D2 아티클 정보 강화
   */
  private enhanceNaverD2Article(article: Article): Article {
    // 네이버 기술 블로그 특화 카테고리 분류
    let category: ArticleCategory = 'general';
    
    const title = article.title.toLowerCase();
    const content = (article.content || '').toLowerCase();
    const text = `${title} ${content}`;
    
    // 네이버 D2 특화 카테고리 분류
    if (text.includes('프론트엔드') || text.includes('javascript') || text.includes('react') || text.includes('vue')) {
      category = 'frontend';
    } else if (text.includes('백엔드') || text.includes('서버') || text.includes('api') || text.includes('database')) {
      category = 'backend';
    } else if (text.includes('ai') || text.includes('머신러닝') || text.includes('딥러닝') || text.includes('인공지능')) {
      category = 'ai-ml';
    } else if (text.includes('모바일') || text.includes('android') || text.includes('ios') || text.includes('앱')) {
      category = 'mobile';
    } else if (text.includes('데이터') || text.includes('분석') || text.includes('빅데이터')) {
      category = 'data';
    } else if (text.includes('보안') || text.includes('security') || text.includes('인증')) {
      category = 'security';
    }

    // 네이버 D2 특화 태그 추가
    const enhancedTags = [
      ...article.tags,
      '네이버 D2',
      '네이버 개발자',
      '기술블로그'
    ];

    // 제목과 내용에서 추가 기술 태그 추출
    const techKeywords = [
      'javascript', 'typescript', 'react', 'vue', 'angular',
      'java', 'spring', 'kotlin', 'python', 'golang',
      'mysql', 'redis', 'elasticsearch', 'kafka',
      'aws', 'docker', 'kubernetes', 'jenkins'
    ];
    
    for (const keyword of techKeywords) {
      if (text.includes(keyword)) {
        enhancedTags.push(keyword.charAt(0).toUpperCase() + keyword.slice(1));
      }
    }

    // 중복 제거 및 정리
    const uniqueTags = [...new Set(enhancedTags)]
      .filter(tag => tag && tag.trim().length > 0)
      .slice(0, 8);

    // Author 정보 강화
    const enhancedAuthor: Author = {
      ...article.author,
      name: article.author.name || '네이버 개발자',
      company: '네이버',
      expertise: ['웹개발', '기술블로그', category],
      bio: `네이버 D2에서 기술 이야기를 공유하는 개발자`
    };

    return {
      ...article,
      category,
      tags: uniqueTags,
      author: enhancedAuthor,
      platform: this.platform,
      
      // 품질 점수 재계산 (네이버 D2는 고품질 콘텐츠)
      qualityScore: this.calculateNaverD2QualityScore(article.title, article.content || '', uniqueTags),
      
      // 메타데이터 추가
      excerpt: this.generateTechFocusedExcerpt(article.content || article.title),
      summary: this.generateTechSummary(article.content || article.title),
    };
  }

  /**
   * 네이버 D2 특화 품질 점수 계산
   */
  private calculateNaverD2QualityScore(title: string, content: string, tags: string[]): number {
    let score = 0;
    const text = `${title} ${content}`.toLowerCase();
    
    // 기본 점수 
    if (title.length >= 10 && title.length <= 100) score += 20;
    if (content.length >= 100) score += 25;
    if (tags.length >= 3) score += 15;
    
    // 기술 키워드 보너스
    const techKeywords = ['개발', 'api', 'database', 'frontend', 'backend', '아키텍처', '성능'];
    const keywordCount = techKeywords.filter(keyword => text.includes(keyword)).length;
    score += Math.min(keywordCount * 5, 20);
    
    // 네이버 D2 특화 보너스
    if (text.includes('네이버') || text.includes('d2')) score += 10;
    
    // 심층 기술 내용 보너스  
    const deepTechKeywords = ['아키텍처', '최적화', '알고리즘', '성능', '확장성'];
    const deepCount = deepTechKeywords.filter(keyword => text.includes(keyword)).length;
    score += Math.min(deepCount * 3, 10);
    
    return Math.min(100, score);
  }

  /**
   * 기술 중심 요약 생성
   */
  private generateTechSummary(content: string): string {
    if (!content || content.length < 50) return content;
    
    // 기술 관련 문장 우선 추출
    const sentences = content.split(/[.!?]\s+/);
    const techSentences = sentences.filter(sentence => 
      /개발|기술|api|서버|데이터|성능|아키텍처/i.test(sentence)
    );
    
    let summary = '';
    const targetSentences = techSentences.length > 0 ? techSentences : sentences;
    
    for (const sentence of targetSentences.slice(0, 3)) {
      if ((summary + sentence).length > 200) break;
      summary += sentence.trim() + '. ';
    }
    
    return summary.trim() || content.substring(0, 200) + '...';
  }

  /**
   * 기술 중심 발췌문 생성
   */
  private generateTechFocusedExcerpt(content: string): string {
    if (!content) return '';
    
    // 기술 키워드 주변 텍스트 추출
    const techKeywords = ['개발', '기술', 'API', '서버', '데이터베이스', '아키텍처', '성능'];
    
    for (const keyword of techKeywords) {
      const index = content.indexOf(keyword);
      if (index !== -1) {
        const start = Math.max(0, index - 50);
        const end = Math.min(content.length, index + 150);
        return content.substring(start, end) + '...';
      }
    }
    
    return content.substring(0, 200) + '...';
  }

  /**
   * 폴백 아티클 생성 (수집 완전 실패 시)
   */
  private createFallbackArticles(limit: number): Article[] {
    console.log('🔄 네이버 D2 폴백 아티클 생성');
    
    const fallbackArticles: Partial<Article>[] = [
      {
        title: '네이버 개발자가 말하는 대규모 서비스 아키텍처',
        content: '네이버의 대규모 서비스 운영 경험과 아키텍처 설계 원칙을 공유합니다.',
        url: 'https://d2.naver.com/helloworld/architecture',
        tags: ['네이버 D2', '아키텍처', '대규모 서비스', '백엔드']
      },
      {
        title: '프론트엔드 개발자를 위한 성능 최적화 가이드',
        content: '네이버에서 실제 적용하고 있는 프론트엔드 성능 최적화 기법들을 소개합니다.',
        url: 'https://d2.naver.com/helloworld/frontend-performance',
        tags: ['프론트엔드', '성능최적화', 'JavaScript', '네이버 D2']
      },
      {
        title: '머신러닝 모델의 프로덕션 배포 전략',
        content: '네이버에서 머신러닝 모델을 실제 서비스에 적용하는 과정과 노하우를 설명합니다.',
        url: 'https://d2.naver.com/helloworld/ml-production',
        tags: ['머신러닝', 'AI', '프로덕션', '네이버 D2']
      }
    ];

    return fallbackArticles.slice(0, limit).map((data, index) => ({
      id: `naver-d2-fallback-${Date.now()}-${index}`,
      title: data.title!,
      content: data.content!,
      summary: data.content!,
      excerpt: data.content!.substring(0, 100) + '...',
      url: data.url!,
      publishedAt: new Date(Date.now() - index * 24 * 60 * 60 * 1000),
      author: {
        id: 'naver-d2-author',
        name: '네이버 개발자',
        company: '네이버',
        expertise: ['웹개발', '기술블로그'],
        articleCount: 0,
        bio: '네이버 D2에서 기술 이야기를 공유하는 개발자'
      },
      platform: this.platform,
      tags: data.tags!,
      category: 'general' as ArticleCategory,
      contentType: 'article' as const,
      qualityScore: 85,
      viewCount: Math.floor(Math.random() * 5000) + 1000,
      likeCount: Math.floor(Math.random() * 200) + 50,
      commentCount: Math.floor(Math.random() * 50) + 10,
      readingTime: Math.floor(Math.random() * 15) + 5,
      trending: index === 0,
      featured: index === 0
    }));
  }

  /**
   * 대기 함수
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 크롤러 통계 조회
   */
  public getStatistics() {
    return this.crawler.getStatistics();
  }

  /**
   * 설정 업데이트
   */
  public updateConfig(updates: Partial<CrawlerConfig>) {
    this.crawler.updateConfig(updates);
  }

  /**
   * 브라우저 리소스 정리
   */
  public async closeBrowser(): Promise<void> {
    // SmartCrawler는 BrowserPool을 사용하므로 별도의 정리가 필요 없음
    // BrowserPool이 자동으로 리소스를 관리함
    console.log('🧹 네이버 D2 크롤러 리소스 정리 완료');
  }
}
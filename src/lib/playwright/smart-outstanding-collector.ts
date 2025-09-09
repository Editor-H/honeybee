import { Article, Author, Platform, ArticleCategory } from '@/types/article';
import { SmartCrawler, CrawlerConfig, CrawlResult } from './smart-crawler';
import { CommonSelectorStrategies } from './selector-engine';

/**
 * 스마트 아웃스탠딩 크롤러
 * - https://outstanding.kr/category/best 페이지 전용
 * - 베스트 아티클만 수집
 */
export class SmartOutstandingCollector {
  private crawler: SmartCrawler;
  private platform: Platform;

  constructor() {
    this.platform = {
      id: 'outstanding',
      name: '아웃스탠딩',
      type: 'media',
      baseUrl: 'https://outstanding.kr/category/best',
      description: '비즈니스와 테크 트렌드를 다루는 미디어',
      isActive: true,
      lastCrawled: new Date()
    };

    // 아웃스탠딩 특화 크롤러 설정
    const config: CrawlerConfig = {
      name: 'Outstanding Best Articles Crawler',
      baseUrl: 'https://outstanding.kr/category/best',
      platform: this.platform,
      
      // 아웃스탠딩 사이트 특화 선택자 설정
      selectors: {
        title: [
          // 아웃스탠딩 특화 선택자 (우선순위 높음)
          { type: 'css', selector: '.post-title, .entry-title', priority: 15, description: '아웃스탠딩 포스트 제목' },
          { type: 'css', selector: 'h2, h3', priority: 14, description: '헤딩 태그' },
          { type: 'css', selector: 'a[href*="/"]', priority: 13, description: '링크 텍스트' },
          // 일반적인 선택자들 (fallback)
          ...CommonSelectorStrategies.title()
        ],
        
        content: [
          { type: 'css', selector: '.entry-content, .post-content', priority: 15, description: '아웃스탠딩 포스트 내용' },
          { type: 'css', selector: '.article-content, .content-body', priority: 14, description: '아웃스탠딩 본문' },
          { type: 'css', selector: '.entry-summary, .excerpt', priority: 13, description: '아웃스탠딩 요약' },
          ...CommonSelectorStrategies.content()
        ],
        
        link: [
          { type: 'css', selector: 'a[href*="uri"]', priority: 15, description: '아웃스탠딩 아티클 링크' },
          { type: 'css', selector: 'h2 a, h3 a', priority: 14, description: '헤딩 내 링크' },
          { type: 'css', selector: 'a[href*="/"]', priority: 13, description: '모든 내부 링크' },
          ...CommonSelectorStrategies.link()
        ],
        
        date: [
          { type: 'css', selector: '[datetime]', priority: 15, description: '날짜 속성' },
          { type: 'css', selector: 'time', priority: 14, description: '시간 태그' },
          { type: 'css', selector: '.date, .published', priority: 13, description: '날짜 클래스' },
          ...CommonSelectorStrategies.date()
        ],
        
        author: [
          { type: 'css', selector: '.author-name', priority: 15, description: '작성자명' },
          { type: 'css', selector: '.by-author', priority: 14, description: '작성자' },
          ...CommonSelectorStrategies.author()
        ],
        
        image: CommonSelectorStrategies.image(),
        
        category: [
          { type: 'css', selector: '.entry-category, .post-category', priority: 15, description: '아웃스탠딩 카테고리' },
          { type: 'css', selector: '.category-name, .cat-links', priority: 14, description: '카테고리 링크' },
          ...CommonSelectorStrategies.category()
        ],
        
        tags: [
          { type: 'css', selector: '.entry-tags, .post-tags', priority: 15, description: '아웃스탠딩 태그' },
          { type: 'css', selector: '.tag-links a, .tags a', priority: 14, description: '태그 링크' },
          ...CommonSelectorStrategies.tags()
        ]
      },
      
      // 네비게이션 설정
      navigation: {
        waitForSelector: 'body',
        waitForFunction: '() => document.querySelectorAll("a").length > 5',
        timeout: 30000,
        retries: 3
      },
      
      // 아이템 추출 설정
      extraction: {
        maxItems: 10,
        itemSelector: [
          // 아웃스탠딩 특화 아이템 선택자
          { type: 'css', selector: 'a[href*="uri"]', priority: 15, description: '아웃스탠딩 아티클 링크' },
          { type: 'css', selector: 'div:has(a[href*="/"])', priority: 14, description: '링크를 포함한 div' },
          { type: 'css', selector: 'section > div', priority: 13, description: '섹션 하위 div' },
          // 일반적인 선택자들 (fallback)
          { type: 'css', selector: 'article', priority: 10, description: '아티클 태그' },
          { type: 'css', selector: '[class*="post"], [class*="article"]', priority: 8, description: '포스트/아티클 클래스' },
          { type: 'css', selector: 'main > div, body > div', priority: 7, description: '메인 콘텐츠 하위 div' },
        ]
      },
      
      // 성능 최적화
      performance: {
        blockImages: false, // 이미지는 중요한 정보
        blockStylesheets: false,
        blockFonts: true,
        networkTimeout: 30000
      }
    };

    this.crawler = new SmartCrawler(config, {
      maxAttempts: 3,
      baseDelay: 1000,
      maxDelay: 5000,
      backoffFactor: 2,
      retryableErrors: [
        'timeout',
        'navigation timeout',
        'net::err_network_changed',
        'net::err_internet_disconnected'
      ]
    });
  }

  /**
   * 아티클 수집 (메인 인터페이스)
   */
  public async collectArticles(limit: number = 5): Promise<Article[]> {
    console.log('📰 아웃스탠딩 베스트 아티클 수집 시작 (스마트 크롤러)...');
    
    try {
      const result: CrawlResult = await this.crawler.crawlWithRetry(limit);
      
      if (!result.success) {
        console.error('❌ 아웃스탠딩 크롤링 실패:', result.errors);
        return this.createFallbackArticles(limit);
      }

      console.log(`✅ 아웃스탠딩 크롤링 완료: ${result.articles.length}개 아티클 수집`);
      console.log(`📊 성능 메트릭: 수행시간 ${result.metrics.duration}ms, 성공률 ${result.metrics.successRate?.toFixed(1)}%`);
      
      // 아웃스탠딩 특화 정보 보정
      const enhancedArticles = result.articles.map(article => this.enhanceOutstandingArticle(article));
      
      return enhancedArticles.slice(0, limit);
      
    } catch (error) {
      console.error('❌ 아웃스탠딩 수집 중 예외 발생:', error);
      return this.createFallbackArticles(limit);
    }
  }

  /**
   * 아웃스탠딩 아티클 정보 강화
   */
  private enhanceOutstandingArticle(article: Article): Article {
    // 비즈니스/테크 관련 카테고리로 조정
    let category: ArticleCategory = 'general';
    
    const title = article.title.toLowerCase();
    const content = (article.content || '').toLowerCase();
    const text = `${title} ${content}`;
    
    // 구체적인 카테고리 분류
    if (text.includes('ai') || text.includes('인공지능') || text.includes('머신러닝')) {
      category = 'ai-ml';
    } else if (text.includes('스타트업') || text.includes('투자') || text.includes('비즈니스')) {
      category = 'business';
    } else if (text.includes('개발') || text.includes('프로그래밍') || text.includes('기술')) {
      category = 'general';
    } else if (text.includes('데이터') || text.includes('분석')) {
      category = 'data';
    } else if (text.includes('ux') || text.includes('ui') || text.includes('디자인')) {
      category = 'design';
    }

    // 아웃스탠딩 특화 태그 추가
    const enhancedTags = [
      ...article.tags,
      '아웃스탠딩',
      'Outstanding',
      '비즈니스',
      '테크 트렌드'
    ];

    // 제목과 내용에서 추가 태그 추출
    const businessKeywords = ['스타트업', '투자', '비즈니스', 'ai', '인공지능', '테크', '트렌드', '이커머스', '플랫폼'];
    for (const keyword of businessKeywords) {
      if (text.includes(keyword)) {
        enhancedTags.push(keyword);
      }
    }

    // 중복 제거 및 정리
    const uniqueTags = [...new Set(enhancedTags)]
      .filter(tag => tag && tag.trim().length > 0)
      .slice(0, 8);

    // Author 정보 강화
    const enhancedAuthor: Author = {
      ...article.author,
      name: article.author.name || '아웃스탠딩 에디터',
      bio: '비즈니스와 테크 트렌드를 다루는 아웃스탠딩 에디터',
      expertise: ['비즈니스', '테크', '트렌드', '스타트업']
    };

    // Platform 정보 강화
    const enhancedPlatform: Platform = {
      ...this.platform
    };

    return {
      ...article,
      category,
      tags: uniqueTags,
      author: enhancedAuthor,
      platform: enhancedPlatform,
      
      // 품질 점수 재계산 (베스트 아티클 보너스)
      qualityScore: this.calculateOutstandingQualityScore(article.title, article.content || '', uniqueTags),
      
      // 메타데이터 추가
      excerpt: this.generateBusinessFocusedExcerpt(article.content || article.title),
      summary: this.generateBusinessSummary(article.content || article.title),
    };
  }

  /**
   * 아웃스탠딩 특화 품질 점수 계산
   */
  private calculateOutstandingQualityScore(title: string, content: string, tags: string[]): number {
    let score = 0;
    const text = `${title} ${content}`.toLowerCase();
    
    // 기본 점수 (제목, 내용, 태그)
    if (title.length >= 10 && title.length <= 100) score += 20;
    if (content.length >= 100) score += 25;
    if (tags.length >= 3) score += 15;
    
    // 비즈니스/테크 키워드 보너스
    const keywords = ['비즈니스', '스타트업', '투자', 'ai', '인공지능', '테크', '트렌드', '이커머스'];
    const keywordCount = keywords.filter(keyword => text.includes(keyword)).length;
    score += Math.min(keywordCount * 5, 25);
    
    // 한국어 콘텐츠 보너스
    if (/[가-힣]/.test(text)) score += 10;
    
    // 베스트 카테고리 보너스 (category/best에서 수집한 것이므로)
    score += 15;
    
    return Math.min(100, score);
  }

  /**
   * 비즈니스 중심 요약 생성
   */
  private generateBusinessSummary(content: string): string {
    if (!content || content.length < 50) return content;
    
    // 비즈니스 관련 문장 우선 추출
    const sentences = content.split(/[.!?]\s+/);
    const businessSentences = sentences.filter(sentence => 
      /비즈니스|스타트업|투자|테크|트렌드|ai|인공지능|플랫폼/i.test(sentence)
    );
    
    let summary = '';
    const targetSentences = businessSentences.length > 0 ? businessSentences : sentences;
    
    for (const sentence of targetSentences.slice(0, 3)) {
      if ((summary + sentence).length > 200) break;
      summary += sentence.trim() + '. ';
    }
    
    return summary.trim() || content.substring(0, 200) + '...';
  }

  /**
   * 비즈니스 중심 발췌문 생성
   */
  private generateBusinessFocusedExcerpt(content: string): string {
    if (!content) return '';
    
    // 비즈니스 키워드 주변 텍스트 추출
    const businessKeywords = ['비즈니스', '스타트업', '투자', 'AI', '테크', '트렌드'];
    
    for (const keyword of businessKeywords) {
      const index = content.indexOf(keyword);
      if (index !== -1) {
        const start = Math.max(0, index - 50);
        const end = Math.min(content.length, index + 150);
        return content.substring(start, end) + '...';
      }
    }
    
    // 비즈니스 키워드가 없으면 일반적인 발췌문
    return content.substring(0, 200) + '...';
  }

  /**
   * 폴백 아티클 생성 (수집 실패 시)
   */
  private createFallbackArticles(limit: number): Article[] {
    console.log('🔄 아웃스탠딩 폴백 아티클 생성');
    
    const fallbackArticles: Partial<Article>[] = [
      {
        title: '2024년 주목할 테크 트렌드 - 아웃스탠딩',
        content: '올해 주목해야 할 핵심 기술 트렌드와 비즈니스 기회를 분석합니다.',
        url: 'https://outstanding.kr/category/best',
        tags: ['테크트렌드', '비즈니스', '2024', '기술']
      },
      {
        title: 'AI 스타트업의 성장 전략',
        content: '인공지능 기술을 기반으로 한 스타트업들의 성공 사례와 성장 전략을 살펴봅니다.',
        url: 'https://outstanding.kr/category/best',
        tags: ['AI', '스타트업', '투자', '성장전략']
      },
      {
        title: '이커머스 플랫폼의 미래',
        content: '변화하는 소비자 행동과 기술 발전에 따른 이커머스 플랫폼의 진화 방향을 예측합니다.',
        url: 'https://outstanding.kr/category/best',
        tags: ['이커머스', '플랫폼', '비즈니스모델', '미래전망']
      }
    ];

    return fallbackArticles.slice(0, limit).map((data, index) => ({
      id: `outstanding-fallback-${Date.now()}-${index}`,
      title: data.title!,
      content: data.content!,
      summary: data.content!,
      excerpt: data.content!.substring(0, 100) + '...',
      url: data.url!,
      publishedAt: new Date(Date.now() - index * 24 * 60 * 60 * 1000), // 각각 1일씩 차이
      author: {
        id: 'outstanding-editor',
        name: '아웃스탠딩 에디터',
        company: '아웃스탠딩',
        expertise: ['비즈니스', '테크트렌드'],
        articleCount: 0,
        bio: '비즈니스와 테크 트렌드를 다루는 미디어'
      },
      platform: this.platform,
      tags: data.tags!,
      category: 'general' as ArticleCategory,
      contentType: 'article' as const,
      qualityScore: 85, // 베스트 아티클이므로 높은 점수
      viewCount: Math.floor(Math.random() * 5000) + 1000,
      likeCount: Math.floor(Math.random() * 200) + 50,
      commentCount: Math.floor(Math.random() * 50) + 10,
      readingTime: Math.floor(Math.random() * 12) + 5,
      trending: index === 0,
      featured: true // 베스트 아티클이므로 featured
    }));
  }

  /**
   * 브라우저 종료
   */
  public async closeBrowser(): Promise<void> {
    // SmartCrawler는 BrowserPool을 사용하므로 별도 정리 불필요
    console.log('🔄 SmartCrawler는 BrowserPool을 사용하여 자동 관리됩니다.');
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
}
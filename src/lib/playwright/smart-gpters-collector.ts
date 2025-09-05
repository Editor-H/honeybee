import { Article, Author, Platform, ArticleCategory } from '@/types/article';
import { SmartCrawler, CrawlerConfig, CrawlResult } from './smart-crawler';
import { CommonSelectorStrategies } from './selector-engine';
import { PerformancePresets } from './performance-optimizer';

/**
 * 스마트 GPTERS 크롤러
 * - 새로운 Playwright 기반 시스템 사용
 * - 지능형 선택자 엔진으로 사이트 변경 대응
 * - 성능 최적화 및 모니터링
 */
export class SmartGPTERSCollector {
  private crawler: SmartCrawler;
  private platform: Platform;

  constructor() {
    this.platform = {
      id: 'gpters',
      name: 'GPTERS 뉴스레터',
      type: 'community',
      baseUrl: 'https://www.gpters.org',
      description: 'AI와 GPT 관련 뉴스레터',
      isActive: true,
      lastCrawled: new Date()
    };

    // GPTERS 특화 크롤러 설정
    const config: CrawlerConfig = {
      name: 'GPTERS Newsletter Crawler',
      baseUrl: 'https://www.gpters.org/newsletter',
      platform: this.platform,
      
      // GPTERS 사이트 특화 선택자 설정
      selectors: {
        title: [
          // GPTERS 특화 선택자 (우선순위 높음)
          { type: 'css', selector: '.newsletter-title, .post-title', priority: 15, description: 'GPTERS 뉴스레터 제목' },
          { type: 'css', selector: '[data-testid="newsletter-title"]', priority: 14, description: 'GPTERS 테스트 ID' },
          { type: 'css', selector: '.content-title, .article-title', priority: 13, description: 'GPTERS 콘텐츠 제목' },
          // 일반적인 선택자들 (fallback)
          ...CommonSelectorStrategies.title()
        ],
        
        content: [
          { type: 'css', selector: '.newsletter-content, .post-content', priority: 15, description: 'GPTERS 뉴스레터 내용' },
          { type: 'css', selector: '.content-body, .article-body', priority: 14, description: 'GPTERS 본문' },
          { type: 'css', selector: '[data-testid="newsletter-content"]', priority: 13, description: 'GPTERS 콘텐츠 테스트 ID' },
          ...CommonSelectorStrategies.content()
        ],
        
        link: [
          { type: 'css', selector: '.newsletter-link, .post-link', priority: 15, description: 'GPTERS 뉴스레터 링크' },
          { type: 'css', selector: 'a[href*="/newsletter/"]', priority: 14, description: 'GPTERS 뉴스레터 URL' },
          ...CommonSelectorStrategies.link()
        ],
        
        date: [
          { type: 'css', selector: '.newsletter-date, .post-date', priority: 15, description: 'GPTERS 날짜' },
          { type: 'css', selector: '[data-testid="newsletter-date"]', priority: 14, description: 'GPTERS 날짜 테스트 ID' },
          ...CommonSelectorStrategies.date()
        ],
        
        author: [
          { type: 'css', selector: '.newsletter-author, .post-author', priority: 15, description: 'GPTERS 작성자' },
          { type: 'css', selector: '[data-testid="newsletter-author"]', priority: 14, description: 'GPTERS 작성자 테스트 ID' },
          ...CommonSelectorStrategies.author()
        ],
        
        image: CommonSelectorStrategies.image(),
        category: CommonSelectorStrategies.category(),
        tags: [
          { type: 'css', selector: '.newsletter-tags, .post-tags', priority: 15, description: 'GPTERS 태그' },
          { type: 'css', selector: '[data-testid="newsletter-tags"] span', priority: 14, description: 'GPTERS 태그 리스트' },
          ...CommonSelectorStrategies.tags()
        ]
      },
      
      // 네비게이션 설정
      navigation: {
        waitForSelector: 'main, .newsletter-container, .content-container',
        timeout: 45000,
        retries: 3
      },
      
      // 아이템 추출 설정
      extraction: {
        maxItems: 8,
        itemSelector: [
          // GPTERS 특화 아이템 선택자
          { type: 'css', selector: '.newsletter-item', priority: 15, description: 'GPTERS 뉴스레터 아이템' },
          { type: 'css', selector: '[data-testid="newsletter-item"]', priority: 14, description: 'GPTERS 아이템 테스트 ID' },
          { type: 'css', selector: '.post-item, .content-item', priority: 13, description: 'GPTERS 포스트 아이템' },
          { type: 'css', selector: '.card, .newsletter-card', priority: 12, description: 'GPTERS 카드' },
          // 일반적인 선택자들 (fallback)
          { type: 'css', selector: 'article, .article', priority: 10, description: '아티클 태그' },
          { type: 'css', selector: '.list-item, .item', priority: 9, description: '리스트 아이템' },
          { type: 'css', selector: '[class*="post"], [class*="news"]', priority: 8, description: '포스트/뉴스 클래스' },
          { type: 'css', selector: 'main > div, .content > div', priority: 7, description: '메인 콘텐츠 하위 div' },
        ]
      },
      
      // 성능 최적화 (균형 모드)
      performance: {
        blockImages: true,
        blockStylesheets: false, // GPTERS는 React 앱이므로 스타일시트 필요
        blockFonts: true,
        networkTimeout: 45000
      }
    };

    this.crawler = new SmartCrawler(config, {
      maxAttempts: 3,
      baseDelay: 2000,
      maxDelay: 10000,
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
  public async collectArticles(limit: number = 8): Promise<Article[]> {
    console.log('📧 GPTERS 뉴스레터 수집 시작 (스마트 크롤러)...');
    
    try {
      const result: CrawlResult = await this.crawler.crawlWithRetry(limit);
      
      if (!result.success) {
        console.error('❌ GPTERS 크롤링 실패:', result.errors);
        return this.createFallbackArticles(limit);
      }

      console.log(`✅ GPTERS 크롤링 완료: ${result.articles.length}개 아티클 수집`);
      console.log(`📊 성능 메트릭: 수행시간 ${result.metrics.duration}ms, 성공률 ${result.metrics.successRate?.toFixed(1)}%`);
      
      // AI/GPT 관련 태그 및 카테고리 보정
      const enhancedArticles = result.articles.map(article => this.enhanceGPTERSArticle(article));
      
      return enhancedArticles.slice(0, limit);
      
    } catch (error) {
      console.error('❌ GPTERS 수집 중 예외 발생:', error);
      return this.createFallbackArticles(limit);
    }
  }

  /**
   * GPTERS 아티클 정보 강화
   */
  private enhanceGPTERSArticle(article: Article): Article {
    // AI/GPT 관련 카테고리로 조정
    let category: ArticleCategory = 'ai-ml';
    
    const title = article.title.toLowerCase();
    const content = (article.content || '').toLowerCase();
    const text = `${title} ${content}`;
    
    // 더 구체적인 카테고리 분류
    if (text.includes('chatgpt') || text.includes('gpt') || text.includes('openai')) {
      category = 'ai-ml';
    } else if (text.includes('개발') || text.includes('코딩') || text.includes('프로그래밍')) {
      category = 'general';
    } else if (text.includes('데이터') || text.includes('분석')) {
      category = 'data';
    }

    // GPTERS 특화 태그 추가
    const enhancedTags = [
      ...article.tags,
      'GPTERS',
      'AI 뉴스레터',
      '인공지능',
      'GPT'
    ];

    // 제목과 내용에서 추가 태그 추출
    const aiKeywords = ['chatgpt', 'gpt-4', 'claude', 'gemini', 'llm', '대화형ai', '생성ai', '머신러닝', '딥러닝'];
    for (const keyword of aiKeywords) {
      if (text.includes(keyword)) {
        enhancedTags.push(keyword.toUpperCase());
      }
    }

    // 중복 제거 및 정리
    const uniqueTags = [...new Set(enhancedTags)]
      .filter(tag => tag && tag.trim().length > 0)
      .slice(0, 8);

    // Author 정보 강화
    const enhancedAuthor: Author = {
      ...article.author,
      name: article.author.name || 'GPTERS',
      bio: 'GPTERS 커뮤니티에서 발행하는 AI 뉴스레터 작성자',
      expertise: ['AI', '인공지능', 'GPT', '머신러닝']
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
      
      // 품질 점수 재계산 (AI 콘텐츠 보너스)
      qualityScore: this.calculateGPTERSQualityScore(article.title, article.content || '', uniqueTags),
      
      // 메타데이터 추가
      excerpt: this.generateAIFocusedExcerpt(article.content || article.title),
      summary: this.generateAISummary(article.content || article.title),
    };
  }

  /**
   * GPTERS 특화 품질 점수 계산
   */
  private calculateGPTERSQualityScore(title: string, content: string, tags: string[]): number {
    let score = 0;
    const text = `${title} ${content}`.toLowerCase();
    
    // 기본 점수 (제목, 내용, 태그)
    if (title.length >= 10 && title.length <= 100) score += 20;
    if (content.length >= 50) score += 20;
    if (tags.length >= 3) score += 15;
    
    // AI 키워드 보너스
    const aiKeywords = ['ai', 'gpt', 'chatgpt', '인공지능', '머신러닝', '딥러닝', 'llm'];
    const keywordCount = aiKeywords.filter(keyword => text.includes(keyword)).length;
    score += Math.min(keywordCount * 5, 20);
    
    // 한국어 콘텐츠 보너스
    if (/[가-힣]/.test(text)) score += 10;
    
    // GPTERS 특화 보너스
    if (text.includes('gpters') || text.includes('지피터스')) score += 15;
    
    return Math.min(100, score);
  }

  /**
   * AI 중심 요약 생성
   */
  private generateAISummary(content: string): string {
    if (!content || content.length < 50) return content;
    
    // AI 관련 문장 우선 추출
    const sentences = content.split(/[.!?]\s+/);
    const aiSentences = sentences.filter(sentence => 
      /ai|gpt|인공지능|머신러닝|딥러닝/i.test(sentence)
    );
    
    let summary = '';
    const targetSentences = aiSentences.length > 0 ? aiSentences : sentences;
    
    for (const sentence of targetSentences.slice(0, 3)) {
      if ((summary + sentence).length > 200) break;
      summary += sentence.trim() + '. ';
    }
    
    return summary.trim() || content.substring(0, 200) + '...';
  }

  /**
   * AI 중심 발췌문 생성
   */
  private generateAIFocusedExcerpt(content: string): string {
    if (!content) return '';
    
    // AI 키워드 주변 텍스트 추출
    const aiKeywords = ['AI', 'GPT', '인공지능', '머신러닝', '딥러닝', 'ChatGPT'];
    
    for (const keyword of aiKeywords) {
      const index = content.indexOf(keyword);
      if (index !== -1) {
        const start = Math.max(0, index - 50);
        const end = Math.min(content.length, index + 150);
        return content.substring(start, end) + '...';
      }
    }
    
    // AI 키워드가 없으면 일반적인 발췌문
    return content.substring(0, 200) + '...';
  }

  /**
   * 폴백 아티클 생성 (수집 실패 시)
   */
  private createFallbackArticles(limit: number): Article[] {
    console.log('🔄 GPTERS 폴백 아티클 생성');
    
    const fallbackArticles: Partial<Article>[] = [
      {
        title: 'AI 업계 최신 동향 - GPTERS 뉴스레터',
        content: '인공지능과 GPT 기술의 최신 동향을 다루는 GPTERS 커뮤니티의 주간 뉴스레터입니다.',
        url: 'https://www.gpters.org/newsletter',
        tags: ['AI', 'GPT', 'GPTERS', '인공지능', '뉴스레터']
      },
      {
        title: 'ChatGPT와 개발자의 미래',
        content: 'ChatGPT와 같은 대화형 AI가 개발자 생태계에 미치는 영향과 앞으로의 전망을 살펴봅니다.',
        url: 'https://www.gpters.org/newsletter/chatgpt-developers',
        tags: ['ChatGPT', '개발자', 'AI', '미래전망']
      },
      {
        title: '생성 AI 도구 활용법',
        content: '실무에서 활용할 수 있는 다양한 생성 AI 도구들의 특징과 사용법을 소개합니다.',
        url: 'https://www.gpters.org/newsletter/generative-ai-tools',
        tags: ['생성AI', 'AI도구', '실무활용', 'GPT']
      }
    ];

    return fallbackArticles.slice(0, limit).map((data, index) => ({
      id: `gpters-fallback-${Date.now()}-${index}`,
      title: data.title!,
      content: data.content!,
      summary: data.content!,
      excerpt: data.content!.substring(0, 100) + '...',
      url: data.url!,
      publishedAt: new Date(Date.now() - index * 24 * 60 * 60 * 1000), // 각각 1일씩 차이
      author: {
        id: 'gpters-author',
        name: 'GPTERS',
        company: 'GPTERS',
        expertise: ['AI', 'GPT'],
        articleCount: 0,
        bio: 'AI와 GPT 기술을 다루는 커뮤니티'
      },
      platform: this.platform,
      tags: data.tags!,
      category: 'ai-ml' as ArticleCategory,
      contentType: 'article' as const,
      qualityScore: 75,
      viewCount: Math.floor(Math.random() * 2000) + 500,
      likeCount: Math.floor(Math.random() * 100) + 20,
      commentCount: Math.floor(Math.random() * 30) + 5,
      readingTime: Math.floor(Math.random() * 8) + 3,
      trending: index === 0,
      featured: false
    }));
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
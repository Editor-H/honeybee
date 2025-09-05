import { Page, Locator } from 'playwright';

/**
 * 선택자 타입 정의
 */
export type SelectorType = 'css' | 'xpath' | 'text' | 'role' | 'testid' | 'placeholder';

/**
 * 선택자 전략 인터페이스
 */
export interface SelectorStrategy {
  type: SelectorType;
  selector: string;
  priority: number; // 높을수록 우선순위
  fallback?: boolean; // 다른 선택자 실패 시 대체용
  timeout?: number;
  description?: string;
}

/**
 * 요소 찾기 결과
 */
export interface ElementSearchResult {
  success: boolean;
  locator?: Locator;
  strategy?: SelectorStrategy;
  error?: string;
  attempts: number;
  duration: number;
}

/**
 * 콘텐츠 추출 설정
 */
export interface ContentExtractionConfig {
  title: SelectorStrategy[];
  content: SelectorStrategy[];
  link: SelectorStrategy[];
  image: SelectorStrategy[];
  date: SelectorStrategy[];
  author: SelectorStrategy[];
  category: SelectorStrategy[];
  tags: SelectorStrategy[];
}

/**
 * 지능형 선택자 엔진
 * - 다중 선택자 전략으로 사이트 변경에 강력한 내성
 * - 동적 학습 및 성공 패턴 기록
 * - 우선순위 기반 선택자 선택
 */
export class SelectorEngine {
  private page: Page;
  private successHistory: Map<string, { strategy: SelectorStrategy; count: number; lastUsed: number }> = new Map();
  private failureHistory: Map<string, number> = new Map();

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * 요소 찾기 (다중 전략 적용)
   */
  public async findElement(strategies: SelectorStrategy[]): Promise<ElementSearchResult> {
    const startTime = Date.now();
    let attempts = 0;
    
    // 우선순위와 성공 이력을 기반으로 정렬
    const sortedStrategies = this.sortStrategiesByPriority(strategies);

    for (const strategy of sortedStrategies) {
      attempts++;
      
      try {
        const locator = await this.createLocator(strategy);
        
        // 요소 존재 확인
        const isVisible = await locator.isVisible({ timeout: strategy.timeout || 5000 });
        
        if (isVisible) {
          // 성공 기록
          this.recordSuccess(strategy);
          
          return {
            success: true,
            locator,
            strategy,
            attempts,
            duration: Date.now() - startTime
          };
        }
        
      } catch (error) {
        // 실패 기록
        this.recordFailure(strategy);
        console.debug(`선택자 실패: ${strategy.selector} (${strategy.type})`, error);
      }
    }

    return {
      success: false,
      error: 'No matching elements found with any strategy',
      attempts,
      duration: Date.now() - startTime
    };
  }

  /**
   * 여러 요소 찾기
   */
  public async findElements(strategies: SelectorStrategy[], limit?: number): Promise<Locator[]> {
    const result = await this.findElement(strategies);
    
    if (!result.success || !result.locator) {
      return [];
    }

    try {
      const count = await result.locator.count();
      const elements: Locator[] = [];
      
      const maxElements = limit ? Math.min(count, limit) : count;
      
      for (let i = 0; i < maxElements; i++) {
        elements.push(result.locator.nth(i));
      }
      
      return elements;
    } catch (error) {
      console.error('여러 요소 추출 실패:', error);
      return [];
    }
  }

  /**
   * 콘텐츠 추출
   */
  public async extractContent(config: ContentExtractionConfig): Promise<Record<string, string | string[]>> {
    const results: Record<string, string | string[]> = {};

    // 각 필드별로 콘텐츠 추출
    for (const [fieldName, strategies] of Object.entries(config)) {
      try {
        if (fieldName === 'tags') {
          // 태그는 배열로 추출
          results[fieldName] = await this.extractTextArray(strategies);
        } else {
          // 나머지는 단일 텍스트로 추출
          results[fieldName] = await this.extractSingleText(strategies);
        }
      } catch (error) {
        console.debug(`${fieldName} 추출 실패:`, error);
        results[fieldName] = fieldName === 'tags' ? [] : '';
      }
    }

    return results;
  }

  /**
   * 단일 텍스트 추출
   */
  private async extractSingleText(strategies: SelectorStrategy[]): Promise<string> {
    const result = await this.findElement(strategies);
    
    if (!result.success || !result.locator) {
      return '';
    }

    try {
      // 다양한 속성에서 텍스트 추출 시도
      const extractMethods = [
        () => result.locator!.textContent(),
        () => result.locator!.getAttribute('title'),
        () => result.locator!.getAttribute('alt'),
        () => result.locator!.getAttribute('data-title'),
        () => result.locator!.getAttribute('aria-label'),
        () => result.locator!.innerText()
      ];

      for (const method of extractMethods) {
        try {
          const text = await method();
          if (text && text.trim()) {
            return text.trim();
          }
        } catch {
          continue;
        }
      }

      return '';
    } catch (error) {
      console.debug('텍스트 추출 실패:', error);
      return '';
    }
  }

  /**
   * 텍스트 배열 추출
   */
  private async extractTextArray(strategies: SelectorStrategy[]): Promise<string[]> {
    const elements = await this.findElements(strategies, 10); // 최대 10개
    const texts: string[] = [];

    for (const element of elements) {
      try {
        const text = await element.textContent();
        if (text && text.trim()) {
          texts.push(text.trim());
        }
      } catch (error) {
        console.debug('배열 요소 추출 실패:', error);
      }
    }

    return texts;
  }

  /**
   * 선택자 생성
   */
  private async createLocator(strategy: SelectorStrategy): Promise<Locator> {
    switch (strategy.type) {
      case 'css':
        return this.page.locator(strategy.selector);
        
      case 'xpath':
        return this.page.locator(`xpath=${strategy.selector}`);
        
      case 'text':
        return this.page.getByText(strategy.selector, { exact: false });
        
      case 'role':
        const [role, options] = strategy.selector.split('|');
        return this.page.getByRole(role as any, options ? JSON.parse(options) : {});
        
      case 'testid':
        return this.page.getByTestId(strategy.selector);
        
      case 'placeholder':
        return this.page.getByPlaceholder(strategy.selector);
        
      default:
        throw new Error(`Unsupported selector type: ${strategy.type}`);
    }
  }

  /**
   * 전략 우선순위 정렬
   */
  private sortStrategiesByPriority(strategies: SelectorStrategy[]): SelectorStrategy[] {
    return strategies.sort((a, b) => {
      // 성공 이력이 있는 전략을 우선 순위로
      const aHistory = this.successHistory.get(this.getStrategyKey(a));
      const bHistory = this.successHistory.get(this.getStrategyKey(b));
      
      if (aHistory && !bHistory) return -1;
      if (!aHistory && bHistory) return 1;
      
      if (aHistory && bHistory) {
        // 성공 횟수와 최근 사용 시간을 고려
        const aScore = aHistory.count * (aHistory.lastUsed / Date.now());
        const bScore = bHistory.count * (bHistory.lastUsed / Date.now());
        
        if (aScore !== bScore) {
          return bScore - aScore;
        }
      }
      
      // 기본 우선순위
      return b.priority - a.priority;
    });
  }

  /**
   * 성공 기록
   */
  private recordSuccess(strategy: SelectorStrategy): void {
    const key = this.getStrategyKey(strategy);
    const existing = this.successHistory.get(key);
    
    if (existing) {
      existing.count++;
      existing.lastUsed = Date.now();
    } else {
      this.successHistory.set(key, {
        strategy,
        count: 1,
        lastUsed: Date.now()
      });
    }
  }

  /**
   * 실패 기록
   */
  private recordFailure(strategy: SelectorStrategy): void {
    const key = this.getStrategyKey(strategy);
    const current = this.failureHistory.get(key) || 0;
    this.failureHistory.set(key, current + 1);
  }

  /**
   * 전략 키 생성
   */
  private getStrategyKey(strategy: SelectorStrategy): string {
    return `${strategy.type}:${strategy.selector}`;
  }

  /**
   * 성공률 통계
   */
  public getStatistics(): {
    totalAttempts: number;
    successfulStrategies: number;
    topStrategies: Array<{ strategy: SelectorStrategy; successRate: number; count: number }>;
  } {
    const successCount = Array.from(this.successHistory.values()).reduce((sum, h) => sum + h.count, 0);
    const failureCount = Array.from(this.failureHistory.values()).reduce((sum, count) => sum + count, 0);
    
    const topStrategies = Array.from(this.successHistory.entries())
      .map(([key, history]) => {
        const failures = this.failureHistory.get(key) || 0;
        const total = history.count + failures;
        const successRate = total > 0 ? history.count / total : 0;
        
        return {
          strategy: history.strategy,
          successRate,
          count: history.count
        };
      })
      .sort((a, b) => b.successRate - a.successRate)
      .slice(0, 10);

    return {
      totalAttempts: successCount + failureCount,
      successfulStrategies: this.successHistory.size,
      topStrategies
    };
  }

  /**
   * 이력 초기화
   */
  public clearHistory(): void {
    this.successHistory.clear();
    this.failureHistory.clear();
  }
}

/**
 * 일반적인 웹사이트 패턴을 위한 선택자 전략 팩토리
 */
export class CommonSelectorStrategies {
  /**
   * 제목 선택자 전략들
   */
  static title(): SelectorStrategy[] {
    return [
      { type: 'css', selector: 'h1, h2, h3', priority: 10, description: '헤딩 태그' },
      { type: 'css', selector: '.title, .headline, .subject', priority: 9, description: '제목 클래스' },
      { type: 'css', selector: '[class*="title"], [class*="headline"]', priority: 8, description: '제목 포함 클래스' },
      { type: 'css', selector: 'article header h1, article header h2', priority: 7, description: '아티클 헤더' },
      { type: 'xpath', selector: '//h1 | //h2 | //h3', priority: 6, description: '헤딩 XPath' },
      { type: 'css', selector: '[data-testid*="title"], [data-cy*="title"]', priority: 5, description: '테스트 ID' }
    ];
  }

  /**
   * 콘텐츠 선택자 전략들
   */
  static content(): SelectorStrategy[] {
    return [
      { type: 'css', selector: '.content, .description, .summary, .excerpt', priority: 10, description: '콘텐츠 클래스' },
      { type: 'css', selector: 'article p, .article p', priority: 9, description: '아티클 문단' },
      { type: 'css', selector: '[class*="content"], [class*="description"]', priority: 8, description: '콘텐츠 포함 클래스' },
      { type: 'css', selector: '.post-content, .entry-content', priority: 7, description: '포스트 콘텐츠' },
      { type: 'css', selector: 'p:not([class])', priority: 6, description: '일반 문단' }
    ];
  }

  /**
   * 링크 선택자 전략들
   */
  static link(): SelectorStrategy[] {
    return [
      { type: 'css', selector: 'a[href]', priority: 10, description: '링크 태그' },
      { type: 'css', selector: '.link, .url', priority: 9, description: '링크 클래스' },
      { type: 'xpath', selector: '//a[@href and text()]', priority: 8, description: '텍스트가 있는 링크' }
    ];
  }

  /**
   * 이미지 선택자 전략들
   */
  static image(): SelectorStrategy[] {
    return [
      { type: 'css', selector: 'img[src]', priority: 10, description: '이미지 태그' },
      { type: 'css', selector: '.thumbnail img, .image img', priority: 9, description: '썸네일 이미지' },
      { type: 'css', selector: '[style*="background-image"]', priority: 7, description: '배경 이미지' }
    ];
  }

  /**
   * 날짜 선택자 전략들
   */
  static date(): SelectorStrategy[] {
    return [
      { type: 'css', selector: 'time[datetime]', priority: 10, description: '시간 태그' },
      { type: 'css', selector: '.date, .published, .created, .time', priority: 9, description: '날짜 클래스' },
      { type: 'css', selector: '[class*="date"], [class*="time"]', priority: 8, description: '날짜 포함 클래스' },
      { type: 'xpath', selector: '//time | //*[contains(@class, "date")]', priority: 7, description: '날짜 XPath' }
    ];
  }

  /**
   * 저자 선택자 전략들
   */
  static author(): SelectorStrategy[] {
    return [
      { type: 'css', selector: '.author, .writer, .by', priority: 10, description: '저자 클래스' },
      { type: 'css', selector: '[class*="author"], [class*="writer"]', priority: 9, description: '저자 포함 클래스' },
      { type: 'css', selector: '.byline, .attribution', priority: 8, description: '저작자 표시' },
      { type: 'xpath', selector: '//*[contains(text(), "by ") or contains(text(), "작성자")]', priority: 7, description: '저자 텍스트' }
    ];
  }

  /**
   * 카테고리 선택자 전략들
   */
  static category(): SelectorStrategy[] {
    return [
      { type: 'css', selector: '.category, .section, .topic', priority: 10, description: '카테고리 클래스' },
      { type: 'css', selector: '[class*="category"], [class*="section"]', priority: 9, description: '카테고리 포함 클래스' },
      { type: 'css', selector: 'nav a, .breadcrumb a', priority: 8, description: '네비게이션 링크' }
    ];
  }

  /**
   * 태그 선택자 전략들
   */
  static tags(): SelectorStrategy[] {
    return [
      { type: 'css', selector: '.tag, .label, .badge', priority: 10, description: '태그 클래스' },
      { type: 'css', selector: '[class*="tag"], [class*="label"]', priority: 9, description: '태그 포함 클래스' },
      { type: 'css', selector: '.keywords, .topics', priority: 8, description: '키워드 클래스' }
    ];
  }

  /**
   * 플랫폼별 맞춤 전략 (확장 가능)
   */
  static forPlatform(platform: string): ContentExtractionConfig {
    const baseConfig: ContentExtractionConfig = {
      title: this.title(),
      content: this.content(),
      link: this.link(),
      image: this.image(),
      date: this.date(),
      author: this.author(),
      category: this.category(),
      tags: this.tags()
    };

    // 플랫폼별 특화 전략 추가
    switch (platform.toLowerCase()) {
      case 'medium':
        baseConfig.title.unshift(
          { type: 'css', selector: 'article h1', priority: 15, description: 'Medium 제목' }
        );
        baseConfig.author.unshift(
          { type: 'css', selector: '[data-testid="authorName"]', priority: 15, description: 'Medium 저자' }
        );
        break;

      case 'github':
        baseConfig.title.unshift(
          { type: 'css', selector: '.js-issue-title', priority: 15, description: 'GitHub 이슈 제목' }
        );
        break;

      case 'stackoverflow':
        baseConfig.title.unshift(
          { type: 'css', selector: '.question-hyperlink', priority: 15, description: 'StackOverflow 질문' }
        );
        break;
    }

    return baseConfig;
  }
}
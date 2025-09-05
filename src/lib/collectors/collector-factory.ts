import { Article } from '@/types/article';
import { EOCollector } from '../eo-collector';
import { GPTERSCollector } from '../gpters-collector';
import { InflearnCrawler } from '../crawlers/inflearn-crawler';
import { Class101Crawler } from '../crawlers/class101-crawler';
import { ColosoCrawler } from '../crawlers/coloso-crawler';

// 크롤러 인터페이스 정의
export interface ContentCollector {
  collectArticles?: (limit: number) => Promise<Article[]>;
  collectCourses?: (limit: number) => Promise<Article[]>;
  closeBrowser?: () => Promise<void>;
}

// 크롤러 타입별 팩토리
export class CollectorFactory {
  private static collectors: Record<string, () => ContentCollector> = {
    eo: () => new EOCollector(),
    gpters: () => new GPTERSCollector(),
    inflearn: () => new InflearnCrawler(),
    class101: () => new Class101Crawler(),
    coloso: () => new ColosoCrawler()
  };

  private static methods: Record<string, 'collectArticles' | 'collectCourses'> = {
    eo: 'collectArticles',
    gpters: 'collectArticles', 
    inflearn: 'collectCourses',
    class101: 'collectCourses',
    coloso: 'collectCourses'
  };

  static createCollector(crawlerType: string): ContentCollector | null {
    const factory = this.collectors[crawlerType];
    return factory ? factory() : null;
  }

  static getCollectionMethod(crawlerType: string): 'collectArticles' | 'collectCourses' | null {
    return this.methods[crawlerType] || null;
  }

  static async collectWithRetry(
    collector: ContentCollector,
    method: 'collectArticles' | 'collectCourses',
    limit: number,
    maxRetries = 3
  ): Promise<Article[]> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const collectFunction = collector[method];
        if (!collectFunction) {
          throw new Error(`Method ${method} not found on collector`);
        }
        
        const results = await collectFunction.call(collector, limit);
        return results;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        if (attempt === maxRetries) {
          console.error(`❌ 최대 재시도 횟수(${maxRetries}) 초과:`, lastError.message);
          break;
        }
        
        const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
        console.log(`⏳ 재시도 ${attempt}/${maxRetries}, ${delay}ms 후 다시 시도...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    return [];
  }

  static registerCollector(
    crawlerType: string,
    factory: () => ContentCollector,
    method: 'collectArticles' | 'collectCourses'
  ): void {
    this.collectors[crawlerType] = factory;
    this.methods[crawlerType] = method;
  }

  static getSupportedCrawlers(): string[] {
    return Object.keys(this.collectors);
  }
}

// 편의 함수들
export async function collectFromCrawler(
  crawlerType: string,
  limit: number,
  retries = 3
): Promise<{ articles: Article[], success: boolean, error?: string }> {
  const collector = CollectorFactory.createCollector(crawlerType);
  const method = CollectorFactory.getCollectionMethod(crawlerType);

  if (!collector || !method) {
    return {
      articles: [],
      success: false,
      error: `지원되지 않는 크롤러 타입: ${crawlerType}`
    };
  }

  try {
    const articles = await CollectorFactory.collectWithRetry(collector, method, limit, retries);
    
    // 리소스 정리
    if (collector.closeBrowser) {
      await collector.closeBrowser();
    }

    return {
      articles,
      success: true
    };
  } catch (error) {
    return {
      articles: [],
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}
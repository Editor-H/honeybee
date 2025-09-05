import Parser from 'rss-parser';
import { Article } from '@/types/article';
import { PlatformConfig } from '@/config/platforms';
import { collectFromCrawler } from './collector-factory';
import { stripHtmlAndClean } from '../utils/text-utils';
import { enhanceArticleWithProfile } from '../article-profile-enhancer';

export interface CollectionResult {
  platformId: string;
  platformName: string;
  articles: Article[];
  success: boolean;
  error?: string;
  duration: number;
  method: string;
}

export class PlatformCollector {
  private parser = new Parser();

  async collectFromPlatform(platform: PlatformConfig): Promise<CollectionResult> {
    const startTime = Date.now();
    console.log(`🔄 ${platform.name} 수집 시작`);

    try {
      let articles: Article[] = [];
      const method = platform.collectionMethod;

      switch (platform.collectionMethod) {
        case 'rss':
          articles = await this.collectFromRSS(platform);
          break;
        
        case 'crawler':
          if (!platform.crawlerType) {
            throw new Error('크롤러 타입이 지정되지 않았습니다');
          }
          const result = await collectFromCrawler(platform.crawlerType, platform.limit);
          if (!result.success) {
            throw new Error(result.error);
          }
          // 크롤러로 수집된 아티클에도 프로필 정보 적용
          articles = result.articles.map(article => enhanceArticleWithProfile(article));
          break;

        case 'api':
          // 향후 API 기반 수집을 위한 확장점
          throw new Error('API 수집은 아직 구현되지 않았습니다');

        default:
          throw new Error(`지원되지 않는 수집 방법: ${platform.collectionMethod}`);
      }

      const duration = Date.now() - startTime;
      console.log(`✅ ${platform.name}: ${articles.length}개 수집 완료 (${duration}ms)`);

      return {
        platformId: platform.id,
        platformName: platform.name,
        articles,
        success: true,
        duration,
        method
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`❌ ${platform.name} 수집 실패: ${errorMessage}`);

      return {
        platformId: platform.id,
        platformName: platform.name,
        articles: [],
        success: false,
        error: errorMessage,
        duration,
        method: platform.collectionMethod
      };
    }
  }

  private async collectFromRSS(platform: PlatformConfig): Promise<Article[]> {
    if (!platform.rssUrl) {
      throw new Error('RSS URL이 지정되지 않았습니다');
    }

    const timeout = platform.timeout || 12000;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      // 플랫폼별 특수 처리
      let parser = this.parser;
      if (platform.id === 'naver') {
        parser = new Parser({
          requestOptions: {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              'Accept': 'application/rss+xml, application/xml, text/xml, */*',
              'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
              'Accept-Encoding': 'gzip, deflate, br',
              'Cache-Control': 'no-cache'
            }
          }
        });
      }

      const feed = await parser.parseURL(platform.rssUrl);
      const items = (feed.items || []).slice(0, platform.limit);

      const articles: Article[] = items.map((item, index) => {
        const article = this.transformRSSItemToArticle(item, platform, index);
        // 프로필 정보로 아티클 강화
        return enhanceArticleWithProfile(article);
      });

      return articles;

    } finally {
      clearTimeout(timeoutId);
    }
  }

  private transformRSSItemToArticle(item: Parser.Item, platform: PlatformConfig, index: number): Article {
    const logDisplayName = platform.channelName 
      ? `${platform.name} • ${platform.channelName}` 
      : platform.name;

    return {
      id: `${platform.id}-${Date.now()}-${index}`,
      title: item.title || 'Untitled',
      content: stripHtmlAndClean(item.contentSnippet || item.content || item.summary || ''),
      summary: this.generateExcerpt(item.contentSnippet || item.content || item.summary || ''),
      url: item.link || '',
      publishedAt: new Date(item.pubDate || item.isoDate || Date.now()),
      author: {
        id: `${platform.id}-author`,
        name: (item as Parser.Item & { creator?: string; author?: string }).creator || 
              (item as Parser.Item & { creator?: string; author?: string }).author || 
              logDisplayName,
        company: logDisplayName,
        expertise: ['Tech'],
        articleCount: 0
      },
      platform: {
        id: platform.id,
        name: logDisplayName,
        type: platform.type,
        rssUrl: platform.rssUrl,
        baseUrl: platform.baseUrl,
        isActive: platform.isActive,
        description: platform.description,
        lastCrawled: new Date()
      },
      tags: this.extractTags(item, platform),
      category: this.categorizeContent(item, platform),
      contentType: this.determineContentType(platform),
      excerpt: this.generateExcerpt(item.contentSnippet || item.content || item.summary || ''),
      featured: false,
      trending: false,
      likeCount: 0,
      viewCount: 0,
      commentCount: 0,
      readingTime: Math.ceil((item.contentSnippet || '').length / 200) || 1,
      thumbnailUrl: item.enclosure?.url || undefined
    };
  }

  private generateExcerpt(content: string, maxLength: number = 200): string {
    const cleanText = stripHtmlAndClean(content);
    if (!cleanText || cleanText.length <= maxLength) return cleanText;
    
    const truncated = cleanText.substring(0, maxLength);
    const lastSentenceEnd = Math.max(
      truncated.lastIndexOf('.'),
      truncated.lastIndexOf('!'),
      truncated.lastIndexOf('?'),
      truncated.lastIndexOf('。')
    );
    
    if (lastSentenceEnd > maxLength * 0.6) {
      return truncated.substring(0, lastSentenceEnd + 1);
    }
    
    const lastSpace = truncated.lastIndexOf(' ');
    if (lastSpace > maxLength * 0.8) {
      return truncated.substring(0, lastSpace) + '...';
    }
    
    return truncated + '...';
  }

  private extractTags(item: Parser.Item, platform: PlatformConfig): string[] {
    const tags: string[] = [];
    
    // RSS 아이템의 태그/카테고리 추출
    if (item.categories) {
      tags.push(...item.categories);
    }
    
    // 플랫폼 타입별 기본 태그
    if (platform.type === 'educational') {
      tags.push('교육', 'Learning');
    }
    if (platform.channelName) {
      tags.push('YouTube', 'Video');
    }
    
    return [...new Set(tags)];
  }

  private categorizeContent(item: Parser.Item, platform: PlatformConfig): import('@/types/article').ArticleCategory {
    const text = `${item.title} ${item.contentSnippet}`.toLowerCase();
    
    if (platform.type === 'educational') {
      return 'lecture';
    }
    
    if (text.includes('ai') || text.includes('artificial intelligence') || text.includes('인공지능')) {
      return 'ai-ml';
    }
    if (text.includes('frontend') || text.includes('react') || text.includes('vue')) {
      return 'frontend';
    }
    if (text.includes('backend') || text.includes('server') || text.includes('database')) {
      return 'backend';
    }
    if (text.includes('design') || text.includes('ux') || text.includes('ui')) {
      return 'design';
    }
    if (text.includes('devops') || text.includes('deployment') || text.includes('docker')) {
      return 'cloud-infra';
    }
    
    return 'general';
  }

  private determineContentType(platform: PlatformConfig): 'article' | 'video' | 'lecture' {
    if (platform.channelName) {
      return 'video';
    }
    if (platform.type === 'educational' && platform.collectionMethod === 'crawler') {
      return 'lecture';
    }
    return 'article';
  }
}
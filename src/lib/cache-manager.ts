import { Article } from '@/types/article';

const MAX_CACHED_ARTICLES = 300; // 최신 300개 아티클만 캐시 유지

interface CacheData {
  articles: Article[];
  lastUpdated: number;
}

// 메모리 캐시 (Serverless 환경에서 사용)
let memoryCache: CacheData | null = null;

export class CacheManager {
  static async getCachedArticles(): Promise<Article[] | null> {
    try {
      // 메모리 캐시만 사용 (간단하고 빠름)
      if (memoryCache) {
        const hoursAgo = Math.floor((Date.now() - memoryCache.lastUpdated) / (1000 * 60 * 60));
        console.log(`✅ 메모리 캐시 사용 (${hoursAgo}시간 전 수집, ${memoryCache.articles.length}개 아티클)`);
        return memoryCache.articles.map(article => ({
          ...article,
          publishedAt: new Date(article.publishedAt)
        }));
      }

      console.log('❌ 메모리 캐시가 비어있습니다');
      return null;
    } catch (error) {
      console.log('캐시 읽기 실패:', error);
      return null;
    }
  }

  static async setCachedArticles(articles: Article[]): Promise<void> {
    try {
      // 최신 날짜순으로 정렬 후 최대 개수만 유지
      const sortedArticles = articles
        .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
        .slice(0, MAX_CACHED_ARTICLES);
      
      const cacheData: CacheData = {
        articles: sortedArticles,
        lastUpdated: Date.now()
      };

      // 메모리 캐시에 저장 (즉시 사용 가능)
      memoryCache = cacheData;
      
      console.log(`✅ ${sortedArticles.length}개 기사를 메모리 캐시에 저장했습니다 (전체 ${articles.length}개 중 최신순 선별)`);
      
    } catch (error) {
      console.error('캐시 저장 중 오류:', error);
      throw error;
    }
  }

  static async clearCache(): Promise<void> {
    try {
      // 메모리 캐시 삭제
      memoryCache = null;
      console.log('✅ 메모리 캐시가 삭제되었습니다');
    } catch (error) {
      console.error('캐시 삭제 중 오류:', error);
    }
  }

  static async getCacheInfo(): Promise<{ lastUpdated: Date | null; hoursAgo: number | null }> {
    try {
      // 메모리 캐시 정보 반환
      if (memoryCache) {
        const hoursAgo = Math.floor((Date.now() - memoryCache.lastUpdated) / (1000 * 60 * 60));
        return {
          lastUpdated: new Date(memoryCache.lastUpdated),
          hoursAgo
        };
      }

      return { lastUpdated: null, hoursAgo: null };
    } catch (error) {
      console.error('캐시 정보 가져오기 실패:', error);
      return { lastUpdated: null, hoursAgo: null };
    }
  }
}
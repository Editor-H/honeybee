import fs from 'fs/promises';
import path from 'path';
import { Article } from '@/types/article';
import { ArticleService } from './article-service';

const CACHE_DIR = path.join(process.cwd(), '.cache');
const ARTICLES_CACHE_FILE = path.join(CACHE_DIR, 'articles.json');
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24시간 (밀리초)
const MAX_CACHED_ARTICLES = 300; // 최신 300개 아티클만 캐시 유지

interface CacheData {
  articles: Article[];
  lastUpdated: number;
}

export class CacheManager {
  private static async ensureCacheDir() {
    try {
      await fs.access(CACHE_DIR);
    } catch {
      await fs.mkdir(CACHE_DIR, { recursive: true });
    }
  }

  static async getCachedArticles(): Promise<Article[] | null> {
    try {
      await this.ensureCacheDir();
      const data = await fs.readFile(ARTICLES_CACHE_FILE, 'utf-8');
      const cacheData: CacheData = JSON.parse(data);
      
      // 캐시 사용 전용 모드: 만료 여부와 관계없이 항상 캐시된 데이터 반환
      const now = Date.now();
      const timeDiff = now - cacheData.lastUpdated;
      const hoursAgo = Math.floor(timeDiff / (1000 * 60 * 60));
      
      console.log(`캐시된 데이터 사용 (${hoursAgo}시간 전 수집, 만료 여부 무시)`);
      return cacheData.articles.map(article => ({
        ...article,
        publishedAt: new Date(article.publishedAt)
      }));
    } catch (error) {
      console.log('캐시 파일이 없거나 읽기 실패:', error);
      return null;
    }
  }

  static async setCachedArticles(articles: Article[]): Promise<void> {
    try {
      await this.ensureCacheDir();
      
      // 최신 날짜순으로 정렬 후 최대 개수만 유지 (빠른 접근용 캐시)
      const sortedArticles = articles
        .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
        .slice(0, MAX_CACHED_ARTICLES);
      
      const cacheData: CacheData = {
        articles: sortedArticles,
        lastUpdated: Date.now()
      };
      
      // 1. 로컬 캐시 저장 (빠른 접근용)
      await fs.writeFile(
        ARTICLES_CACHE_FILE, 
        JSON.stringify(cacheData, null, 2), 
        'utf-8'
      );
      
      // 2. 데이터베이스에 전체 아티클 저장 (영구 저장용)
      try {
        await ArticleService.upsertArticles(articles);
        console.log(`${sortedArticles.length}개 기사를 캐시에 저장, ${articles.length}개를 데이터베이스에 저장했습니다`);
      } catch (dbError) {
        console.error('데이터베이스 저장 실패, 캐시만 사용:', dbError);
        console.log(`${sortedArticles.length}개 기사를 캐시에만 저장했습니다 (전체 ${articles.length}개 중 최신순 선별)`);
      }
      
    } catch (error) {
      console.error('캐시 저장 실패:', error);
    }
  }

  static async getCacheInfo(): Promise<{ lastUpdated: Date | null, hoursAgo: number | null }> {
    try {
      await this.ensureCacheDir();
      const data = await fs.readFile(ARTICLES_CACHE_FILE, 'utf-8');
      const cacheData: CacheData = JSON.parse(data);
      
      const lastUpdated = new Date(cacheData.lastUpdated);
      const hoursAgo = Math.floor((Date.now() - cacheData.lastUpdated) / (1000 * 60 * 60));
      
      return { lastUpdated, hoursAgo };
    } catch {
      return { lastUpdated: null, hoursAgo: null };
    }
  }

  static async clearCache(): Promise<void> {
    try {
      await fs.unlink(ARTICLES_CACHE_FILE);
      console.log('캐시가 삭제되었습니다');
    } catch (error) {
      console.log('캐시 삭제 실패 또는 캐시 파일이 없음:', error);
    }
  }
}
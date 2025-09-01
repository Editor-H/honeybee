import { Article } from '@/types/article';
import { supabase } from './supabase';

// const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24시간 (밀리초) - 현재 미사용
const MAX_CACHED_ARTICLES = 300; // 최신 300개 아티클만 캐시 유지

interface CacheData {
  articles: Article[];
  lastUpdated: number;
}

// 메모리 캐시 (Serverless 환경에서 임시 사용)
let memoryCache: CacheData | null = null;

export class CacheManager {
  static async getCachedArticles(): Promise<Article[] | null> {
    try {
      // 1. 메모리 캐시 확인 (가장 빠름)
      if (memoryCache) {
        const hoursAgo = Math.floor((Date.now() - memoryCache.lastUpdated) / (1000 * 60 * 60));
        console.log(`메모리 캐시 사용 (${hoursAgo}시간 전 수집)`);
        return memoryCache.articles.map(article => ({
          ...article,
          publishedAt: new Date(article.publishedAt)
        }));
      }

      // 2. Supabase에서 캐시 데이터 가져오기
      const { data: cacheRow, error } = await supabase
        .from('cache_data')
        .select('*')
        .eq('cache_key', 'articles')
        .single();

      if (error || !cacheRow) {
        console.log('Supabase 캐시가 없거나 읽기 실패:', error);
        return null;
      }

      const cacheData: CacheData = JSON.parse(cacheRow.cache_value);
      const hoursAgo = Math.floor((Date.now() - cacheData.lastUpdated) / (1000 * 60 * 60));
      
      // 메모리 캐시에도 저장
      memoryCache = cacheData;
      
      console.log(`Supabase 캐시 사용 (${hoursAgo}시간 전 수집)`);
      return cacheData.articles.map(article => ({
        ...article,
        publishedAt: new Date(article.publishedAt)
      }));
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

      // 1. 메모리 캐시에 저장 (즉시 접근용)
      memoryCache = cacheData;
      
      // 2. Supabase에 캐시 저장 (영구 보존용)
      const { error } = await supabase
        .from('cache_data')
        .upsert({
          cache_key: 'articles',
          cache_value: JSON.stringify(cacheData),
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Supabase 캐시 저장 실패:', error);
        console.log('메모리 캐시만 사용합니다');
      } else {
        console.log(`✅ ${sortedArticles.length}개 기사를 캐시에 저장했습니다 (전체 ${articles.length}개 중 최신순 선별)`);
      }
      
    } catch (error) {
      console.error('캐시 저장 중 오류:', error);
      throw error;
    }
  }

  static async clearCache(): Promise<void> {
    try {
      // 1. 메모리 캐시 삭제
      memoryCache = null;
      
      // 2. Supabase 캐시 삭제
      const { error } = await supabase
        .from('cache_data')
        .delete()
        .eq('cache_key', 'articles');

      if (error) {
        console.error('Supabase 캐시 삭제 실패:', error);
      }
      
      console.log('캐시가 삭제되었습니다');
    } catch (error) {
      console.error('캐시 삭제 중 오류:', error);
    }
  }

  static async getCacheInfo(): Promise<{ lastUpdated: Date | null; hoursAgo: number | null }> {
    try {
      // 메모리 캐시 우선 확인
      if (memoryCache) {
        const hoursAgo = Math.floor((Date.now() - memoryCache.lastUpdated) / (1000 * 60 * 60));
        return {
          lastUpdated: new Date(memoryCache.lastUpdated),
          hoursAgo
        };
      }

      // Supabase에서 캐시 정보 가져오기
      const { data: cacheRow } = await supabase
        .from('cache_data')
        .select('cache_value')
        .eq('cache_key', 'articles')
        .single();

      if (!cacheRow) {
        return { lastUpdated: null, hoursAgo: null };
      }

      const cacheData: CacheData = JSON.parse(cacheRow.cache_value);
      const hoursAgo = Math.floor((Date.now() - cacheData.lastUpdated) / (1000 * 60 * 60));
      
      return {
        lastUpdated: new Date(cacheData.lastUpdated),
        hoursAgo
      };
    } catch (error) {
      console.error('캐시 정보 가져오기 실패:', error);
      return { lastUpdated: null, hoursAgo: null };
    }
  }
}
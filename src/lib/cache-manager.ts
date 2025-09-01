import { Article } from '@/types/article';
import { supabaseServer } from '@/lib/supabase-server';

const MAX_CACHED_ARTICLES = 50000; // 최대한 많은 아티클 캐시 유지

interface CacheData {
  articles: Article[];
  lastUpdated: number;
}

export class CacheManager {
  static async getCachedArticles(): Promise<Article[] | null> {
    try {
      console.log('🔍 DB 캐시 조회 시작...');
      const { data: cacheEntry, error } = await supabaseServer
        .from('cache')
        .select('data')
        .eq('key', 'articles')
        .single();
      
      if (error) {
        console.error('❌ DB 캐시 조회 에러:', error);
        return null;
      }
      
      console.log('📋 DB 응답:', { cacheEntry });
      
      if (cacheEntry?.data) {
        const cacheData: CacheData = cacheEntry.data;
        const hoursAgo = Math.floor((Date.now() - cacheData.lastUpdated) / (1000 * 60 * 60));
        console.log(`✅ DB 캐시 사용 (${hoursAgo}시간 전 수집, ${cacheData.articles.length}개 아티클)`);
        return cacheData.articles.map(article => ({
          ...article,
          publishedAt: new Date(article.publishedAt)
        }));
      }
      
      console.log('❌ DB 캐시가 비어있습니다 - cacheEntry:', cacheEntry);
      return null;
    } catch (error) {
      console.error('캐시 읽기 실패:', error);
      return null;
    }
  }

  static async setCachedArticles(articles: Article[]): Promise<void> {
    try {
      // 기존 캐시된 아티클 가져오기
      const existingArticles = await this.getCachedArticles() || [];
      
      // URL 기준으로 중복 제거하여 새 아티클만 추가
      const existingUrls = new Set(existingArticles.map(article => article.url));
      const newArticles = articles.filter(article => !existingUrls.has(article.url));
      
      // 기존 + 새 아티클 합치기
      const allArticles = [...existingArticles, ...newArticles];
      
      // 최신 날짜순으로 정렬 후 최대 개수만 유지
      const sortedArticles = allArticles
        .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
        .slice(0, MAX_CACHED_ARTICLES);
      
      const cacheData: CacheData = {
        articles: sortedArticles,
        lastUpdated: Date.now()
      };
      
      // DB 캐시에 저장 (upsert)
      const { error } = await supabaseServer
        .from('cache')
        .upsert({
          key: 'articles',
          data: cacheData,
          updated_at: new Date().toISOString()
        });
      
      if (error) {
        console.error('DB 캐시 저장 실패:', error);
        throw error;
      }
      
      console.log(`✅ ${sortedArticles.length}개 기사를 DB 캐시에 저장했습니다 (새로 추가: ${newArticles.length}개, 전체: ${allArticles.length}개 중 최신순 선별)`);
      
    } catch (error) {
      console.error('캐시 저장 실패:', error);
    }
  }

  static async getCacheInfo(): Promise<{ lastUpdated: Date | null, hoursAgo: number | null }> {
    try {
      const { data: cacheEntry } = await supabaseServer
        .from('cache')
        .select('data')
        .eq('key', 'articles')
        .single();
      
      if (cacheEntry?.data) {
        const cacheData: CacheData = cacheEntry.data;
        const lastUpdated = new Date(cacheData.lastUpdated);
        const hoursAgo = Math.floor((Date.now() - cacheData.lastUpdated) / (1000 * 60 * 60));
        return { lastUpdated, hoursAgo };
      }
      return { lastUpdated: null, hoursAgo: null };
    } catch {
      return { lastUpdated: null, hoursAgo: null };
    }
  }

  static async clearCache(): Promise<void> {
    try {
      await supabaseServer
        .from('cache')
        .delete()
        .eq('key', 'articles');
      console.log('DB 캐시가 삭제되었습니다');
    } catch (error) {
      console.log('캐시 삭제 실패:', error);
    }
  }
}
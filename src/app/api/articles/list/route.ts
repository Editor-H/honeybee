import { NextRequest, NextResponse } from 'next/server';
import { ArticleService, ArticleFilters } from '@/lib/article-service';
import { CacheManager } from '@/lib/cache-manager';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // 쿼리 파라미터 파싱
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const platform_id = searchParams.get('platform_id') || undefined;
    const category = searchParams.get('category') || undefined;
    const content_type = searchParams.get('content_type') as 'article' | 'video' || undefined;
    const trending = searchParams.get('trending') === 'true' ? true : undefined;
    const search = searchParams.get('search') || undefined;
    const tags = searchParams.get('tags')?.split(',').filter(Boolean) || undefined;
    const date_from = searchParams.get('date_from') || undefined;
    const date_to = searchParams.get('date_to') || undefined;
    const useCache = searchParams.get('cache') !== 'false'; // 기본적으로 캐시 사용
    
    // 필터 객체 구성
    const filters: ArticleFilters = {
      platform_id,
      category,
      content_type,
      trending,
      search,
      tags,
      date_from,
      date_to
    };
    
    // 첫 페이지이고 필터가 없으면 캐시 우선 사용
    if (useCache && page === 1 && !Object.values(filters).some(v => v !== undefined)) {
      try {
        const cachedArticles = await CacheManager.getCachedArticles();
        if (cachedArticles && cachedArticles.length > 0) {
          const startIndex = 0;
          const endIndex = limit;
          const articles = cachedArticles.slice(startIndex, endIndex);
          
          return NextResponse.json({
            success: true,
            data: {
              articles,
              total: cachedArticles.length,
              page,
              limit,
              hasMore: endIndex < cachedArticles.length,
              source: 'cache'
            }
          });
        }
      } catch (cacheError) {
        console.log('캐시 조회 실패, 데이터베이스에서 조회:', cacheError);
      }
    }
    
    // 데이터베이스에서 조회
    const result = await ArticleService.getArticles(filters, { page, limit });
    
    return NextResponse.json({
      success: true,
      data: {
        ...result,
        source: 'database'
      }
    });
    
  } catch (error) {
    console.error('아티클 목록 조회 실패:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '아티클 조회 중 오류가 발생했습니다'
    }, { status: 500 });
  }
}
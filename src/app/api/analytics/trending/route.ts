import { NextResponse } from 'next/server';
import { ArticleService } from '@/lib/article-service';
import { CacheManager } from '@/lib/cache-manager';

export async function GET() {
  try {
    // 캐시된 데이터 우선 사용 (데이터베이스가 설정되지 않은 경우를 대비)
    const cachedArticles = await CacheManager.getCachedArticles();
    
    if (!cachedArticles || cachedArticles.length === 0) {
      // 캐시가 없으면 빈 응답 반환
      return NextResponse.json({
        success: true,
        data: {
          trendingArticles: [],
          topTags: [],
          topPlatforms: [],
          totalArticles: 0,
          recentArticles: 0,
          contentTypeDistribution: { article: 0, video: 0 },
          lastUpdated: new Date().toISOString(),
          period: '최근 7일'
        }
      });
    }

    // 태그 빈도 분석
    const tagFrequency: Record<string, number> = {};
    const allArticlesForTags = cachedArticles;
    
    allArticlesForTags.forEach(article => {
      article.tags.forEach(tag => {
        tagFrequency[tag] = (tagFrequency[tag] || 0) + 1;
      });
    });

    // 상위 20개 태그
    const topTags = Object.entries(tagFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 20)
      .map(([tag, count]) => ({ tag, count }));

    // 플랫폼별 아티클 수
    const platformStats: Record<string, number> = {};
    allArticlesForTags.forEach(article => {
      const platform = article.platform.name;
      platformStats[platform] = (platformStats[platform] || 0) + 1;
    });

    const topPlatforms = Object.entries(platformStats)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([platform, count]) => ({ platform, count }));

    // 최근 7일간 아티클 통계
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const recentCount = allArticlesForTags.filter(article => 
      new Date(article.publishedAt) >= sevenDaysAgo
    ).length;

    // 콘텐츠 타입별 분포
    const contentTypeStats = {
      article: allArticlesForTags.filter(a => a.contentType === 'article').length,
      video: allArticlesForTags.filter(a => a.contentType === 'video').length
    };

    // 트렌딩 아티클 선별 (조회수나 트렌딩 마크 기준)
    const trendingArticlesList = allArticlesForTags
      .filter(article => article.trending || (article.viewCount && article.viewCount > 1000))
      .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
      .slice(0, 10);

    return NextResponse.json({
      success: true,
      data: {
        // 트렌딩 아티클
        trendingArticles: trendingArticlesList,
        
        // 인기 태그
        topTags,
        
        // 플랫폼 통계
        topPlatforms,
        
        // 전체 통계
        totalArticles: allArticlesForTags.length,
        recentArticles: recentCount,
        
        // 콘텐츠 타입 분포
        contentTypeDistribution: contentTypeStats,
        
        // 메타데이터
        lastUpdated: new Date().toISOString(),
        period: '최근 7일'
      }
    });

  } catch (error) {
    console.error('트렌딩 분석 데이터 조회 실패:', error);
    return NextResponse.json({
      success: false,
      error: '트렌딩 분석 데이터를 불러올 수 없습니다'
    }, { status: 500 });
  }
}
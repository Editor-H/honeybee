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

    // 트렌딩 아티클 선별 (더 관대한 기준으로 변경)
    const trendingArticlesList = allArticlesForTags
      .filter(article => {
        // 1. 트렌딩 마크가 있거나
        if (article.trending) return true;
        
        // 2. 조회수가 있고 100 이상이거나 
        if (article.viewCount && article.viewCount > 100) return true;
        
        // 3. 최근 3일 내의 아티클이거나
        const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
        if (new Date(article.publishedAt) >= threeDaysAgo) return true;
        
        // 4. 특정 인기 태그를 포함하고 있거나
        const hotTags = ['React', 'AI', 'ChatGPT', 'JavaScript', 'TypeScript', '개발', '기술'];
        if (article.tags.some(tag => hotTags.includes(tag))) return true;
        
        return false;
      })
      .sort((a, b) => {
        // 복합 점수로 정렬: 최신성(40%) + 조회수(30%) + 태그 점수(30%)
        const getScore = (article: Article) => {
          const daysSincePublished = Math.max(0, 7 - Math.floor((now.getTime() - new Date(article.publishedAt).getTime()) / (24 * 60 * 60 * 1000)));
          const recentScore = daysSincePublished * 40; // 최신성 점수
          const viewScore = Math.min(30, (article.viewCount || 0) / 100); // 조회수 점수
          const hotTags = ['React', 'AI', 'ChatGPT', 'JavaScript', 'TypeScript'];
          const tagScore = article.tags.filter((tag: string) => hotTags.includes(tag)).length * 10;
          
          return recentScore + viewScore + tagScore;
        };
        
        return getScore(b) - getScore(a);
      })
      .slice(0, 12); // 12개로 증가

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
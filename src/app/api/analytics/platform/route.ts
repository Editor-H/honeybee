import { NextResponse } from 'next/server';
import { ArticleService } from '@/lib/article-service';
import { CacheManager } from '@/lib/cache-manager';

export async function GET() {
  try {
    // 캐시된 데이터 우선 사용
    const cachedArticles = await CacheManager.getCachedArticles();

    if (!cachedArticles || cachedArticles.length === 0) {
      // 캐시가 없으면 빈 응답 반환
      return NextResponse.json({
        success: true,
        data: {
          platforms: [],
          overview: {
            totalPlatforms: 0,
            activePlatforms: 0,
            totalArticles: 0,
            totalVideos: 0,
            mostActiveplatform: 'N/A',
            avgArticlesPerPlatform: 0
          },
          activityPattern: {
            hourlyDistribution: new Array(24).fill(0),
            peakHour: 12,
            peakHourLabel: '12:00'
          },
          lastUpdated: new Date().toISOString(),
          analysisDate: new Date().toISOString().split('T')[0],
          totalAnalyzedArticles: 0
        }
      });
    }

    const articles = cachedArticles;
    
    // 플랫폼별 상세 통계
    const platformAnalysis: Record<string, {
      name: string;
      totalArticles: number;
      recentArticles: number;
      videoCount: number;
      textCount: number;
      avgViewCount: number;
      topTags: string[];
      lastArticle?: Date;
      productivity: string; // 높음, 보통, 낮음
    }> = {};

    // 최근 7일 기준
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    articles.forEach(article => {
      const platformName = article.platform.name;
      const isRecent = new Date(article.publishedAt) >= sevenDaysAgo;
      
      if (!platformAnalysis[platformName]) {
        platformAnalysis[platformName] = {
          name: platformName,
          totalArticles: 0,
          recentArticles: 0,
          videoCount: 0,
          textCount: 0,
          avgViewCount: 0,
          topTags: [],
          productivity: '보통'
        };
      }

      const platform = platformAnalysis[platformName];
      platform.totalArticles++;
      
      if (isRecent) {
        platform.recentArticles++;
      }
      
      if (article.contentType === 'video') {
        platform.videoCount++;
      } else {
        platform.textCount++;
      }

      platform.avgViewCount = (platform.avgViewCount + (article.viewCount || 0)) / platform.totalArticles;
      
      if (!platform.lastArticle || new Date(article.publishedAt) > platform.lastArticle) {
        platform.lastArticle = new Date(article.publishedAt);
      }
    });

    // 플랫폼별 태그 분석 및 생산성 계산
    Object.values(platformAnalysis).forEach(platform => {
      // 태그 수집
      const tagCount: Record<string, number> = {};
      articles
        .filter(article => article.platform.name === platform.name)
        .forEach(article => {
          article.tags.forEach(tag => {
            tagCount[tag] = (tagCount[tag] || 0) + 1;
          });
        });
      
      platform.topTags = Object.entries(tagCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([tag]) => tag);

      // 생산성 계산 (최근 7일 기준)
      if (platform.recentArticles >= 3) {
        platform.productivity = '높음';
      } else if (platform.recentArticles >= 1) {
        platform.productivity = '보통';
      } else {
        platform.productivity = '낮음';
      }
    });

    // 정렬된 플랫폼 목록
    const sortedPlatforms = Object.values(platformAnalysis)
      .sort((a, b) => b.totalArticles - a.totalArticles);

    // 전체 통계
    const totalStats = {
      totalPlatforms: sortedPlatforms.length,
      activePlatforms: sortedPlatforms.filter(p => p.recentArticles > 0).length,
      totalArticles: articles.length,
      totalVideos: articles.filter(a => a.contentType === 'video').length,
      mostActiveplatform: sortedPlatforms[0]?.name || 'N/A',
      avgArticlesPerPlatform: Math.round(articles.length / sortedPlatforms.length)
    };

    // 시간대별 활동 패턴 (간단 버전)
    const hourlyActivity: number[] = new Array(24).fill(0);
    articles.forEach(article => {
      const hour = new Date(article.publishedAt).getHours();
      hourlyActivity[hour]++;
    });

    const peakHour = hourlyActivity.indexOf(Math.max(...hourlyActivity));

    return NextResponse.json({
      success: true,
      data: {
        // 플랫폼별 상세 분석
        platforms: sortedPlatforms,
        
        // 전체 통계
        overview: totalStats,
        
        // 활동 패턴
        activityPattern: {
          hourlyDistribution: hourlyActivity,
          peakHour: peakHour,
          peakHourLabel: `${peakHour}:00`
        },
        
        // 메타데이터
        lastUpdated: new Date().toISOString(),
        analysisDate: now.toISOString().split('T')[0],
        totalAnalyzedArticles: articles.length
      }
    });

  } catch (error) {
    console.error('플랫폼 분석 데이터 조회 실패:', error);
    return NextResponse.json({
      success: false,
      error: '플랫폼 분석 데이터를 불러올 수 없습니다'
    }, { status: 500 });
  }
}
import { NextResponse } from 'next/server';
import { SmartGPTERSCollector } from '@/lib/playwright/smart-gpters-collector';
import { BrowserPool } from '@/lib/playwright/browser-pool';
import { CrawlerMonitor } from '@/lib/playwright/crawler-monitor';

/**
 * 스마트 크롤러 시스템 테스트 API
 * - 새로운 Playwright 기반 크롤러 테스트
 * - 성능 메트릭 및 모니터링 확인
 * - 기존 크롤러와 비교
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '5');
  const testLegacy = searchParams.get('legacy') === 'true';

  console.log('🧪 스마트 크롤러 테스트 시작...');
  
  const startTime = Date.now();
  let smartResults: Record<string, unknown> | null = null;
  let legacyResults: Record<string, unknown> | null = null;
  let browserPoolStatus: Record<string, unknown> | null = null;
  let monitorStats: Record<string, unknown> | null = null;

  try {
    // 스마트 크롤러 테스트
    console.log('🚀 스마트 GPTERS 크롤러 테스트 중...');
    const smartCollector = new SmartGPTERSCollector();
    
    const smartStartTime = Date.now();
    const smartArticles = await smartCollector.collectArticles(limit);
    const smartEndTime = Date.now();
    
    smartResults = {
      success: smartArticles.length > 0,
      articleCount: smartArticles.length,
      duration: smartEndTime - smartStartTime,
      articles: smartArticles.map(article => ({
        id: article.id,
        title: article.title.substring(0, 100),
        url: article.url,
        category: article.category,
        tags: article.tags,
        qualityScore: article.qualityScore,
        publishedAt: article.publishedAt
      })),
      statistics: smartCollector.getStatistics()
    };

    // 기존 크롤러와 비교 (옵션)
    if (testLegacy) {
      try {
        console.log('🔄 레거시 크롤러 비교 테스트 중...');
        const { GPTERSCollector } = await import('@/lib/gpters-collector');
        const legacyCollector = new GPTERSCollector();
        
        const legacyStartTime = Date.now();
        const legacyArticles = await legacyCollector.collectArticles(limit);
        const legacyEndTime = Date.now();
        
        legacyResults = {
          success: legacyArticles.length > 0,
          articleCount: legacyArticles.length,
          duration: legacyEndTime - legacyStartTime,
          articles: legacyArticles.map(article => ({
            id: article.id,
            title: article.title.substring(0, 100),
            url: article.url,
            category: article.category,
            tags: article.tags,
            qualityScore: article.qualityScore
          }))
        };
      } catch (legacyError) {
        legacyResults = {
          success: false,
          error: legacyError instanceof Error ? legacyError.message : String(legacyError)
        };
      }
    }

    // 브라우저 풀 상태 확인
    const browserPool = BrowserPool.getInstance();
    browserPoolStatus = browserPool.getStatus();

    // 모니터링 통계 확인
    const monitor = CrawlerMonitor.getInstance();
    monitorStats = monitor.getStatistics() as unknown as Record<string, unknown>;

    const totalDuration = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      testResults: {
        smart: smartResults,
        legacy: legacyResults,
        comparison: legacyResults ? {
          speedImprovement: typeof legacyResults === 'object' && legacyResults !== null && 'duration' in legacyResults && 
            typeof smartResults === 'object' && smartResults !== null && 'duration' in smartResults &&
            typeof (legacyResults as { duration: unknown }).duration === 'number' && (legacyResults as { duration: number }).duration > 0 ? 
            (((legacyResults as { duration: number }).duration - (smartResults as { duration: number }).duration) / (legacyResults as { duration: number }).duration * 100).toFixed(1) + '%' 
            : 'N/A',
          qualityImprovement: calculateQualityImprovement(
            typeof smartResults === 'object' && smartResults !== null && 'articles' in smartResults && Array.isArray((smartResults as { articles: unknown }).articles) ? 
              (smartResults as { articles: Record<string, unknown>[] }).articles : [],
            typeof legacyResults === 'object' && legacyResults !== null && 'articles' in legacyResults && Array.isArray((legacyResults as { articles: unknown }).articles) ? 
              (legacyResults as { articles: Record<string, unknown>[] }).articles : []
          ),
          reliabilityImprovement: (
            typeof smartResults === 'object' && smartResults !== null && 'success' in smartResults && (smartResults as { success: boolean }).success && 
            typeof legacyResults === 'object' && legacyResults !== null && 'success' in legacyResults && !(legacyResults as { success: boolean }).success
          ) ? 'Improved' : 'Same'
        } : null
      },
      systemStatus: {
        browserPool: browserPoolStatus,
        monitor: monitorStats,
        totalTestDuration: totalDuration
      },
      recommendations: generateRecommendations(smartResults, legacyResults, browserPoolStatus),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ 스마트 크롤러 테스트 실패:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      systemStatus: {
        browserPool: browserPoolStatus,
        monitor: monitorStats
      },
      duration: Date.now() - startTime,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

/**
 * 품질 개선도 계산
 */
function calculateQualityImprovement(smartArticles: Record<string, unknown>[], legacyArticles?: Record<string, unknown>[]): string {
  if (!legacyArticles || legacyArticles.length === 0) return 'N/A';
  
  const smartAvgQuality = smartArticles.reduce((sum, a) => sum + (typeof a.qualityScore === 'number' ? a.qualityScore : 0), 0) / smartArticles.length;
  const legacyAvgQuality = legacyArticles.reduce((sum, a) => sum + (typeof a.qualityScore === 'number' ? a.qualityScore : 0), 0) / legacyArticles.length;
  
  if (legacyAvgQuality === 0) return 'N/A';
  
  const improvement = ((smartAvgQuality - legacyAvgQuality) / legacyAvgQuality * 100);
  return improvement > 0 ? `+${improvement.toFixed(1)}%` : `${improvement.toFixed(1)}%`;
}

/**
 * 추천사항 생성
 */
function generateRecommendations(smartResults: Record<string, unknown>, legacyResults: Record<string, unknown> | null, browserPoolStatus: Record<string, unknown>): string[] {
  const recommendations: string[] = [];
  
  // 성능 기반 추천
  if (typeof smartResults === 'object' && smartResults !== null && 'duration' in smartResults && 
      typeof (smartResults as { duration: unknown }).duration === 'number' && 
      (smartResults as { duration: number }).duration > 30000) {
    recommendations.push('크롤링 시간이 30초를 초과합니다. 성능 최적화 설정을 검토해보세요.');
  }
  
  // 메모리 기반 추천
  if (typeof browserPoolStatus === 'object' && browserPoolStatus !== null && 'memoryUsage' in browserPoolStatus &&
      typeof (browserPoolStatus as { memoryUsage: unknown }).memoryUsage === 'object' && 
      (browserPoolStatus as { memoryUsage: unknown }).memoryUsage !== null &&
      'heapUsed' in (browserPoolStatus as { memoryUsage: { heapUsed: unknown } }).memoryUsage &&
      typeof ((browserPoolStatus as { memoryUsage: { heapUsed: unknown } }).memoryUsage.heapUsed) === 'number' &&
      ((browserPoolStatus as { memoryUsage: { heapUsed: number } }).memoryUsage.heapUsed) > 500 * 1024 * 1024) { // 500MB
    recommendations.push('높은 메모리 사용량이 감지되었습니다. 브라우저 풀 정리를 고려해보세요.');
  }
  
  // 성공률 기반 추천
  if (typeof smartResults === 'object' && smartResults !== null && 'success' in smartResults && 
      !(smartResults as { success: boolean }).success) {
    recommendations.push('크롤링이 실패했습니다. 네트워크 연결 또는 사이트 구조 변경을 확인해보세요.');
  } else if (typeof smartResults === 'object' && smartResults !== null && 'articleCount' in smartResults &&
             typeof (smartResults as { articleCount: unknown }).articleCount === 'number' &&
             (smartResults as { articleCount: number }).articleCount === 0) {
    recommendations.push('아티클을 수집하지 못했습니다. 선택자 전략을 업데이트해야 할 수 있습니다.');
  }
  
  // 비교 기반 추천
  if (legacyResults && 
      typeof smartResults === 'object' && smartResults !== null && 'success' in smartResults && (smartResults as { success: boolean }).success &&
      typeof legacyResults === 'object' && legacyResults !== null && 'success' in legacyResults && (legacyResults as { success: boolean }).success) {
    if (typeof smartResults === 'object' && smartResults !== null && 'articleCount' in smartResults &&
        typeof legacyResults === 'object' && legacyResults !== null && 'articleCount' in legacyResults &&
        typeof (smartResults as { articleCount: unknown }).articleCount === 'number' &&
        typeof (legacyResults as { articleCount: unknown }).articleCount === 'number' &&
        (smartResults as { articleCount: number }).articleCount < (legacyResults as { articleCount: number }).articleCount * 0.8) {
      recommendations.push('스마트 크롤러의 수집량이 기존 대비 20% 이상 감소했습니다. 선택자 설정을 확인해보세요.');
    }
  }
  
  // 브라우저 풀 기반 추천
  if (typeof browserPoolStatus === 'object' && browserPoolStatus !== null && 'totalBrowsers' in browserPoolStatus &&
      typeof (browserPoolStatus as { totalBrowsers: unknown }).totalBrowsers === 'number' &&
      (browserPoolStatus as { totalBrowsers: number }).totalBrowsers > 5) {
    recommendations.push('브라우저 인스턴스가 너무 많습니다. 풀 크기를 줄이는 것을 고려해보세요.');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('모든 시스템이 정상적으로 작동하고 있습니다. 성능이 우수합니다.');
  }
  
  return recommendations;
}

/**
 * 브라우저 풀 정리 엔드포인트
 */
export async function DELETE() {
  try {
    console.log('🧹 브라우저 풀 정리 시작...');
    
    const browserPool = BrowserPool.getInstance();
    const beforeStatus = browserPool.getStatus();
    
    await browserPool.shutdown();
    
    // 새 인스턴스 생성으로 초기화
    const newPool = BrowserPool.getInstance();
    const afterStatus = newPool.getStatus();
    
    return NextResponse.json({
      success: true,
      message: '브라우저 풀이 성공적으로 정리되었습니다.',
      before: beforeStatus,
      after: afterStatus,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ 브라우저 풀 정리 실패:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

/**
 * 시스템 상태 조회 엔드포인트
 */
export async function POST(request: Request) {
  try {
    const { action } = await request.json();
    
    switch (action) {
      case 'status':
        const browserPool = BrowserPool.getInstance();
        const monitor = CrawlerMonitor.getInstance();
        
        return NextResponse.json({
          success: true,
          status: {
            browserPool: browserPool.getStatus(),
            monitor: {
              general: monitor.getStatistics(),
              crawlerStats: monitor.getCrawlerStatistics(),
              recentErrors: monitor.getRecentErrors(10)
            },
            memory: process.memoryUsage(),
            uptime: process.uptime()
          },
          timestamp: new Date().toISOString()
        });
        
      case 'performance':
        const performanceTrends = CrawlerMonitor.getInstance().getPerformanceTrends(24);
        
        return NextResponse.json({
          success: true,
          performance: performanceTrends,
          timestamp: new Date().toISOString()
        });
        
      default:
        return NextResponse.json({
          success: false,
          error: 'Unknown action. Available actions: status, performance'
        }, { status: 400 });
    }
    
  } catch (error) {
    console.error('❌ 시스템 상태 조회 실패:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
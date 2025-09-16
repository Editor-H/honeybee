import { NextResponse } from 'next/server';
import { ContentCollectionService } from '@/lib/rss-collector-refactored';
import { CacheManager } from '@/lib/cache-manager';

// Vercel Deploy Hook을 사용한 배포 트리거
async function triggerVercelDeployment() {
  const deployHookUrl = process.env.VERCEL_DEPLOY_HOOK_URL;
  
  if (!deployHookUrl) {
    throw new Error('VERCEL_DEPLOY_HOOK_URL 환경 변수가 설정되지 않았습니다');
  }
  
  console.log('🔄 Vercel 배포 훅 호출 중...');
  
  const response = await fetch(deployHookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      reason: 'Auto-deploy after content collection',
      timestamp: new Date().toISOString()
    })
  });
  
  if (!response.ok) {
    throw new Error(`배포 훅 요청 실패: ${response.status} ${response.statusText}`);
  }
  
  const result = await response.json();
  
  return {
    success: true,
    method: 'vercel-hook',
    deploymentId: result.id || 'unknown',
    status: response.status,
    timestamp: new Date().toISOString()
  };
}

// GitHub Actions를 사용한 배포 트리거
async function triggerGitHubActions() {
  const githubToken = process.env.GITHUB_TOKEN;
  const githubRepo = process.env.GITHUB_REPOSITORY; // 예: "username/honeybee"
  
  if (!githubToken || !githubRepo) {
    throw new Error('GITHUB_TOKEN 또는 GITHUB_REPOSITORY 환경 변수가 설정되지 않았습니다');
  }
  
  console.log('🔄 GitHub Actions 워크플로우 트리거 중...');
  
  const response = await fetch(`https://api.github.com/repos/${githubRepo}/dispatches`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${githubToken}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      event_type: 'content-updated',
      client_payload: {
        reason: 'Auto-deploy after content collection',
        timestamp: new Date().toISOString(),
        source: 'cron-job'
      }
    })
  });
  
  if (!response.ok) {
    throw new Error(`GitHub Actions 트리거 실패: ${response.status} ${response.statusText}`);
  }
  
  return {
    success: true,
    method: 'github-actions',
    status: response.status,
    timestamp: new Date().toISOString()
  };
}

// 통합 배포 트리거 함수
async function triggerDeployment() {
  // 1순위: Vercel Deploy Hook 시도
  if (process.env.VERCEL_DEPLOY_HOOK_URL) {
    try {
      return await triggerVercelDeployment();
    } catch (error) {
      console.warn('⚠️ Vercel 배포 훅 실패, GitHub Actions로 fallback:', error);
    }
  }
  
  // 2순위: GitHub Actions 시도
  if (process.env.GITHUB_TOKEN && process.env.GITHUB_REPOSITORY) {
    try {
      return await triggerGitHubActions();
    } catch (error) {
      console.warn('⚠️ GitHub Actions 트리거 실패:', error);
      throw error;
    }
  }
  
  throw new Error('배포 트리거를 위한 환경 변수가 설정되지 않았습니다 (VERCEL_DEPLOY_HOOK_URL 또는 GITHUB_TOKEN/GITHUB_REPOSITORY)');
}

// Vercel Cron에서만 호출되는 API
export async function GET(request: Request) {
  try {
    // Vercel Cron 요청인지 확인 (보안)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      console.log('⚠️ 비인가 cron 요청 차단:', authHeader);
      return NextResponse.json({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 });
    }

    console.log('🕔 자동 콘텐츠 수집 시작 - 매일 오전 5시 (KST)');
    const startTime = Date.now();
    
    // 기존 캐시 정보 확인
    const { lastUpdated, hoursAgo } = await CacheManager.getCacheInfo();
    console.log(`이전 수집: ${lastUpdated ? lastUpdated.toLocaleString('ko-KR') : '없음'} (${hoursAgo}시간 전)`);
    
    // 누적 수집을 위해 캐시 삭제 제거
    console.log('📚 기존 아티클에 새로운 콘텐츠 누적 추가');
    
    // 새로운 콘텐츠 수집 (리팩토링된 통합 시스템)
    const collectionService = new ContentCollectionService();
    const articles = await collectionService.collectAllContent();
    
    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);
    
    console.log(`✅ 자동 콘텐츠 수집 완료: ${articles.length}개 아티클 (${duration}초 소요)`);
    
    // 수집 결과 요약 생성  
    const platformStats = articles.reduce((acc, article) => {
      const platformName = article.platform.name;
      acc[platformName] = (acc[platformName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // 플랫폼 통계 정보 추가
    const collectionStats = collectionService.getCollectionStats();
    
    const summary = {
      timestamp: new Date().toISOString(),
      kstTime: new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }),
      totalArticles: articles.length,
      duration: `${duration}초`,
      platforms: Object.keys(platformStats).length,
      activePlatforms: collectionStats.activePlatforms,
      platformBreakdown: platformStats,
      platformsByType: collectionStats.platformsByType,
      platformsByMethod: collectionStats.platformsByMethod,
      previousUpdate: lastUpdated?.toLocaleString('ko-KR') || '없음',
      hoursAgo: hoursAgo
    };
    
    console.log('📊 수집 요약:', JSON.stringify(summary, null, 2));
    
    // 자동 배포 트리거 (새 콘텐츠가 있을 때만)
    let deployResult: {
      success: boolean;
      method?: string;
      deploymentId?: string;
      status?: number;
      timestamp?: string;
      error?: string;
    } | null = null;
    if (articles.length > 0) {
      try {
        console.log('🚀 새 콘텐츠 감지 - 자동 배포 시작');
        deployResult = await triggerDeployment();
        console.log('✅ 배포 트리거 성공:', deployResult);
      } catch (deployError) {
        console.error('❌ 배포 트리거 실패:', deployError);
        deployResult = { 
          success: false, 
          error: deployError instanceof Error ? deployError.message : 'Deployment trigger failed' 
        };
      }
    }
    
    return NextResponse.json({
      success: true,
      message: '자동 콘텐츠 수집이 성공적으로 완료되었습니다',
      summary,
      deployment: deployResult
    });
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ 자동 콘텐츠 수집 실패:', error);
    
    // 에러 발생 시에도 기본 정보는 응답
    return NextResponse.json({
      success: false,
      error: '자동 콘텐츠 수집에 실패했습니다',
      details: errorMessage,
      timestamp: new Date().toISOString(),
      kstTime: new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })
    }, { status: 500 });
  }
}

// POST 메소드는 수동 테스트용으로 남겨둠
export async function POST() {
  return NextResponse.json({
    success: false,
    error: 'POST 메소드는 지원되지 않습니다. 이 엔드포인트는 Vercel Cron 전용입니다.'
  }, { status: 405 });
}
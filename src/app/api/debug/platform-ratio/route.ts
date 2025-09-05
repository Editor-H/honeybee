import { NextResponse } from 'next/server';
import { collectAllFeedsOptimized } from '@/lib/rss-collector-optimized';

export async function GET() {
  try {
    console.log('📊 플랫폼별 수집 비율 분석 시작...');
    
    const articles = await collectAllFeedsOptimized();
    
    // 플랫폼별 통계
    const platformStats: Record<string, {
      count: number;
      platform: string;
      language: 'Korean' | 'English' | 'Mixed';
      contentTypes: string[];
    }> = {};

    articles.forEach(article => {
      const platformName = article.platform.name;
      if (!platformStats[platformName]) {
        platformStats[platformName] = {
          count: 0,
          platform: platformName,
          language: getLanguageType(platformName),
          contentTypes: []
        };
      }
      platformStats[platformName].count++;
      
      if (!platformStats[platformName].contentTypes.includes(article.contentType)) {
        platformStats[platformName].contentTypes.push(article.contentType);
      }
    });

    // 언어별 통계
    const koreanCount = Object.values(platformStats)
      .filter(stat => stat.language === 'Korean')
      .reduce((sum, stat) => sum + stat.count, 0);
      
    const englishCount = Object.values(platformStats)
      .filter(stat => stat.language === 'English')
      .reduce((sum, stat) => sum + stat.count, 0);
      
    const mixedCount = Object.values(platformStats)
      .filter(stat => stat.language === 'Mixed')
      .reduce((sum, stat) => sum + stat.count, 0);

    const totalArticles = articles.length;
    const koreanRatio = Math.round((koreanCount / totalArticles) * 100);
    const englishRatio = Math.round((englishCount / totalArticles) * 100);
    const mixedRatio = Math.round((mixedCount / totalArticles) * 100);

    // 플랫폼별 정렬 (많은 순)
    const sortedPlatforms = Object.values(platformStats)
      .sort((a, b) => b.count - a.count);

    console.log('✅ 플랫폼별 수집 비율 분석 완료');

    return NextResponse.json({
      success: true,
      summary: {
        totalArticles,
        languageRatio: {
          korean: `${koreanRatio}% (${koreanCount}개)`,
          english: `${englishRatio}% (${englishCount}개)`,
          mixed: `${mixedRatio}% (${mixedCount}개)`
        },
        targetGoal: '한국어 90%, 영어 10%',
        isGoalMet: englishRatio <= 12 // 약간의 여유
      },
      platformBreakdown: sortedPlatforms,
      recommendations: englishRatio > 12 ? [
        '영어 플랫폼 아티클 수를 더 줄여야 함',
        '한국어 플랫폼 비중을 늘려야 함'
      ] : [
        '목표 언어 비율에 근접함',
        '현재 설정 유지 권장'
      ],
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ 플랫폼 비율 분석 실패:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

function getLanguageType(platformName: string): 'Korean' | 'English' | 'Mixed' {
  const koreanPlatforms = [
    '토스 기술블로그', '당근마켓 기술블로그', '카카오 기술블로그', 
    '네이버 D2', '우아한형제들', '요즘IT', '아웃스탠딩',
    '인프런', '콜로소', '클래스101', '브런치'
  ];
  
  const englishPlatforms = [
    'Medium', 'Hacker News', 'DEV Community', 'freeCodeCamp',
    'UX Planet', 'UX Collective', 'Product Coalition'
  ];
  
  const mixedPlatforms = [
    'Velog', 'YouTube' // 한국어/영어 혼재
  ];
  
  if (koreanPlatforms.includes(platformName)) return 'Korean';
  if (englishPlatforms.includes(platformName)) return 'English';
  return 'Mixed';
}
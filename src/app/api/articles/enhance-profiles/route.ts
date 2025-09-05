import { NextResponse } from 'next/server';
import { Article } from '@/types/article';
import { CacheManager } from '@/lib/cache-manager';
import { enhanceArticlesWithProfiles, generateEnhancedPlatformStats } from '@/lib/article-profile-enhancer';

/**
 * 기존 아티클들에 플랫폼 프로필 정보를 적용하는 API
 */
export async function POST() {
  try {
    console.log('🔄 기존 아티클에 프로필 정보 적용 시작...');
    const startTime = Date.now();

    // 기존 캐시된 아티클들 가져오기
    const existingArticles = await CacheManager.getCachedArticles();
    
    if (!existingArticles || existingArticles.length === 0) {
      return NextResponse.json({
        success: false,
        message: '캐시된 아티클이 없습니다',
        articlesProcessed: 0
      });
    }

    console.log(`📚 ${existingArticles.length}개 아티클에 프로필 정보 적용 중...`);

    // 모든 아티클에 프로필 정보 강화 적용
    const enhancedArticles = enhanceArticlesWithProfiles(existingArticles);
    

    // 강화된 통계 생성
    const enhancedStats = generateEnhancedPlatformStats(enhancedArticles);

    // 업데이트된 아티클을 캐시에 다시 저장 (교체)
    await CacheManager.replaceCachedArticles(enhancedArticles);

    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);

    console.log(`✅ 프로필 정보 적용 완료: ${enhancedArticles.length}개 아티클 (${duration}초 소요)`);

    // 개선사항 분석
    const improvementAnalysis = analyzeImprovements(existingArticles, enhancedArticles);

    return NextResponse.json({
      success: true,
      message: `${enhancedArticles.length}개 아티클에 프로필 정보 적용 완료`,
      articlesProcessed: enhancedArticles.length,
      duration: `${duration}초`,
      platformStats: enhancedStats,
      improvements: improvementAnalysis,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ 프로필 정보 적용 실패:', error);
    
    return NextResponse.json({
      success: false,
      error: '프로필 정보 적용에 실패했습니다',
      details: errorMessage
    }, { status: 500 });
  }
}

/**
 * 개선사항 분석 함수
 */
function analyzeImprovements(originalArticles: Article[], enhancedArticles: Article[]) {
  let enhancedAuthors = 0;
  let enhancedPlatforms = 0;
  let improvedCategories = 0;
  let addedTags = 0;
  let qualityScoresAdded = 0;

  enhancedArticles.forEach((enhanced, index) => {
    const original = originalArticles[index];
    
    // 작성자 정보 개선 확인
    if ((enhanced.author.bio && !original.author.bio) ||
        (enhanced.author.socialLinks && !original.author.socialLinks)) {
      enhancedAuthors++;
    }
    
    // 플랫폼 메타데이터 추가 확인
    if (enhanced.platform.metadata && !original.platform.metadata) {
      enhancedPlatforms++;
    }
    
    // 카테고리 개선 확인
    if (enhanced.category !== original.category && enhanced.category !== 'general') {
      improvedCategories++;
    }
    
    // 태그 추가 확인
    if (enhanced.tags.length > original.tags.length) {
      addedTags += enhanced.tags.length - original.tags.length;
    }
    
    // 품질 점수 추가 확인
    if (enhanced.qualityScore && !original.qualityScore) {
      qualityScoresAdded++;
    }
  });

  return {
    enhancedAuthors,
    enhancedPlatforms,
    improvedCategories,
    addedTags,
    qualityScoresAdded,
    enhancementRate: Math.round((enhancedPlatforms / enhancedArticles.length) * 100)
  };
}

/**
 * GET 요청으로 현재 프로필 적용 상태 조회
 */
export async function GET() {
  try {
    const articles = await CacheManager.getCachedArticles();
    
    if (!articles || articles.length === 0) {
      return NextResponse.json({
        success: true,
        hasArticles: false,
        message: '캐시된 아티클이 없습니다'
      });
    }

    // 프로필 적용 상태 분석 (디버깅 정보 추가)
    let articlesWithProfiles = 0;
    let articlesWithMetadata = 0;
    let articlesWithQualityScores = 0;
    let articlesWithEnhancedTags = 0;
    let articlesWithBio = 0;
    const debugInfo = [];

    // 샘플 아티클 3개 디버깅 (참조용)
    // const sampleArticles = articles.slice(0, 3);
    
    articles.forEach((article, index) => {
      // 플랫폼 메타데이터 확인
      if (article.platform.metadata) {
        articlesWithProfiles++;
        
        // 회사 정보나 기술 스택이 있는지 확인  
        if (article.platform.metadata.company || article.platform.metadata.techStack) {
          articlesWithMetadata++;
        }
      }
      
      // 품질 점수 확인 (숫자 형태만 지원)
      if (article.qualityScore && typeof article.qualityScore === 'number' && article.qualityScore > 0) {
        articlesWithQualityScores++;
      }
      
      // 향상된 태그 수 확인 (3개 이상이면 향상된 것으로 간주)
      if (article.tags && article.tags.length > 3) {
        articlesWithEnhancedTags++;
      }
      
      // 작성자 bio 확인
      if (article.author?.bio) {
        articlesWithBio++;
      }
      
      // 첫 3개 아티클의 디버깅 정보 수집
      if (index < 3) {
        debugInfo.push({
          id: article.id,
          title: article.title.substring(0, 50),
          platformId: article.platform.id,
          hasMetadata: !!article.platform.metadata,
          metadataKeys: article.platform.metadata ? Object.keys(article.platform.metadata) : [],
          hasCompany: !!article.platform.metadata?.company,
          hasTechStack: !!article.platform.metadata?.techStack,
          qualityScore: article.qualityScore,
          tagsCount: article.tags?.length || 0,
          category: article.category,
          hasAuthorBio: !!article.author?.bio
        });
      }
    });

    const profileCoverage = Math.round((articlesWithProfiles / articles.length) * 100);
    const metadataCoverage = Math.round((articlesWithMetadata / articles.length) * 100);
    const qualityCoverage = Math.round((articlesWithQualityScores / articles.length) * 100);
    const enhancedTagsCoverage = Math.round((articlesWithEnhancedTags / articles.length) * 100);
    const bioCoverage = Math.round((articlesWithBio / articles.length) * 100);

    return NextResponse.json({
      success: true,
      hasArticles: true,
      totalArticles: articles.length,
      coverage: {
        profiles: `${profileCoverage}% (${articlesWithProfiles}/${articles.length})`,
        metadata: `${metadataCoverage}% (${articlesWithMetadata}/${articles.length})`,
        qualityScores: `${qualityCoverage}% (${articlesWithQualityScores}/${articles.length})`,
        enhancedTags: `${enhancedTagsCoverage}% (${articlesWithEnhancedTags}/${articles.length})`,
        authorBios: `${bioCoverage}% (${articlesWithBio}/${articles.length})`
      },
      needsEnhancement: profileCoverage < 90,
      lastCacheUpdate: await CacheManager.getCacheInfo(),
      debugSample: debugInfo
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: '상태 조회에 실패했습니다',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
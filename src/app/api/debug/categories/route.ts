import { NextResponse } from 'next/server';
import { collectAllFeedsOptimized } from '@/lib/rss-collector-optimized';
import { isArticleInSubcategory, getMainCategoryForSubcategory, mainCategoryMapping, getMatchingSubcategories } from '@/lib/category-mapping';

export async function GET() {
  try {
    // 모든 아티클 가져오기
    const articles = await collectAllFeedsOptimized();
    
    // 카테고리별 통계 생성
    const stats = {
      totalArticles: articles.length,
      lastUpdated: new Date().toISOString(),
      categories: {} as Record<string, {count: number, percentage: string}>,
      subcategories: {} as Record<string, {mainCategory: string, count: number, percentage: string, sampleTitles: string[]}>,
      validation: {
        duplicateCheck: [] as string[],
        unmatchedArticles: [] as {title: string, category: string, tags: string[], platform: string}[]
      }
    };

    // 메인 카테고리별 통계
    for (const [mainCat, articleCat] of Object.entries(mainCategoryMapping)) {
      const categoryArticles = articles.filter(article => article.category === articleCat);
      stats.categories[mainCat] = {
        count: categoryArticles.length,
        percentage: ((categoryArticles.length / articles.length) * 100).toFixed(1)
      };
    }

    // 하위 카테고리별 통계
    const subcategories = [
      // 프론트엔드
      'react', 'vue', 'angular', 'javascript',
      // 백엔드  
      'nodejs', 'python', 'java', 'golang',
      // AI/ML
      'machine-learning', 'deep-learning', 'nlp', 'computer-vision',
      // 클라우드
      'aws', 'azure', 'gcp', 'kubernetes',
      // 모바일
      'ios', 'android', 'react-native', 'flutter',
      // 데이터
      'analytics', 'database', 'bigdata', 'visualization',
      // UX/UI
      'ui-design', 'ux-research', 'prototyping', 'design-system',
      // 프로덕트
      'product-management', 'product-strategy', 'service-planning', 'growth-hacking',
      // 게임
      'unity', 'unreal', 'game-dev', 'game-design',
      // 그래픽
      'webgl', 'threejs', 'computer-graphics', 'shader',
      // 강의
      'programming-lecture', 'design-lecture', 'data-lecture', 'business-lecture'
    ];

    for (const subcategoryId of subcategories) {
      const mainCategory = getMainCategoryForSubcategory(subcategoryId);
      if (!mainCategory) continue;

      const articleMainCategory = mainCategoryMapping[mainCategory];
      const subcategoryArticles = articles.filter(article => {
        const belongsToMainCategory = article.category === articleMainCategory;
        const belongsToSubcategory = isArticleInSubcategory(article, subcategoryId);
        return belongsToMainCategory && belongsToSubcategory;
      });

      stats.subcategories[subcategoryId] = {
        mainCategory,
        count: subcategoryArticles.length,
        percentage: subcategoryArticles.length > 0 ? 
          ((subcategoryArticles.length / stats.categories[mainCategory].count) * 100).toFixed(1) : '0.0',
        sampleTitles: subcategoryArticles.slice(0, 3).map(a => a.title)
      };
    }

    // 다중 카테고리 매칭 검증
    const multiCategoryArticles = articles.map(article => {
      const matchingSubcategories = getMatchingSubcategories(article);
      return {
        title: article.title,
        mainCategory: article.category,
        matchingSubcategories,
        multipleMatches: matchingSubcategories.length > 1
      };
    }).filter(item => item.multipleMatches);

    stats.validation.duplicateCheck = multiCategoryArticles.map(item => 
      `"${item.title}" matches: ${item.matchingSubcategories.join(', ')}`
    );

    // 카테고리가 매칭되지 않는 아티클들
    const unmatchedArticles = articles.filter(article => {
      const matchingSubcategories = getMatchingSubcategories(article);
      return matchingSubcategories.length === 0 && article.category !== 'general' && article.category !== 'events';
    });

    stats.validation.unmatchedArticles = unmatchedArticles.slice(0, 10).map(article => ({
      title: article.title,
      category: article.category,
      tags: article.tags,
      platform: article.platform.name
    }));

    return NextResponse.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Category debug error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
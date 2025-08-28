import { NextRequest, NextResponse } from 'next/server';
import { collectAllFeeds } from '@/lib/rss-collector';
import { Article } from '@/types/article';

interface SearchFilters {
  category?: string;
  platform?: string;
  author?: string;
  sortBy?: 'relevance' | 'date' | 'views' | 'likes';
}

function calculateRelevanceScore(article: Article, query: string): number {
  const queryLower = query.toLowerCase();
  let score = 0;
  
  // 제목에서 매칭 (가중치 3)
  const titleMatches = (article.title.toLowerCase().match(new RegExp(queryLower, 'g')) || []).length;
  score += titleMatches * 3;
  
  // 내용에서 매칭 (가중치 1)
  const contentMatches = (article.content.toLowerCase().match(new RegExp(queryLower, 'g')) || []).length;
  score += contentMatches * 1;
  
  // 태그에서 매칭 (가중치 2)
  const tagMatches = article.tags.filter(tag => tag.toLowerCase().includes(queryLower)).length;
  score += tagMatches * 2;
  
  // 작가명에서 매칭 (가중치 2)
  if (article.author.name.toLowerCase().includes(queryLower)) {
    score += 2;
  }
  
  // 플랫폼명에서 매칭 (가중치 1)
  if (article.platform.name.toLowerCase().includes(queryLower)) {
    score += 1;
  }
  
  return score;
}

function searchArticles(articles: Article[], query: string, filters: SearchFilters = {}): Article[] {
  if (!query.trim()) {
    return [];
  }
  
  let results = articles.filter(article => {
    const queryLower = query.toLowerCase();
    
    // 텍스트 매칭
    const titleMatch = article.title.toLowerCase().includes(queryLower);
    const contentMatch = article.content.toLowerCase().includes(queryLower);
    const tagMatch = article.tags.some(tag => tag.toLowerCase().includes(queryLower));
    const authorMatch = article.author.name.toLowerCase().includes(queryLower);
    const platformMatch = article.platform.name.toLowerCase().includes(queryLower);
    
    const textMatch = titleMatch || contentMatch || tagMatch || authorMatch || platformMatch;
    
    // 필터 적용
    const categoryMatch = !filters.category || article.category === filters.category;
    const platformFilter = !filters.platform || article.platform.id === filters.platform;
    const authorFilter = !filters.author || article.author.name.includes(filters.author);
    
    return textMatch && categoryMatch && platformFilter && authorFilter;
  });
  
  // 정렬
  switch (filters.sortBy) {
    case 'date':
      results.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
      break;
    case 'views':
      results.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
      break;
    case 'likes':
      results.sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0));
      break;
    case 'relevance':
    default:
      // 관련성 점수로 정렬
      results = results.map(article => ({
        ...article,
        relevanceScore: calculateRelevanceScore(article, query)
      })).sort((a: any, b: any) => b.relevanceScore - a.relevanceScore);
      break;
  }
  
  return results;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const category = searchParams.get('category') || undefined;
    const platform = searchParams.get('platform') || undefined;
    const author = searchParams.get('author') || undefined;
    const sortBy = (searchParams.get('sortBy') as SearchFilters['sortBy']) || 'relevance';
    const limit = parseInt(searchParams.get('limit') || '50');
    
    if (!query.trim()) {
      return NextResponse.json({
        success: false,
        message: '검색어를 입력해주세요',
        results: [],
        total: 0
      });
    }
    
    // 모든 기사 데이터 가져오기
    const allArticles = await collectAllFeeds();
    
    // 검색 실행
    const results = searchArticles(allArticles, query, {
      category,
      platform,
      author,
      sortBy
    });
    
    // 결과 제한
    const limitedResults = results.slice(0, limit);
    
    // Date 객체를 문자열로 변환
    const serializedResults = limitedResults.map(article => ({
      ...article,
      publishedAt: article.publishedAt.toISOString()
    }));

    return NextResponse.json({
      success: true,
      query,
      results: serializedResults,
      total: results.length,
      filters: {
        category,
        platform,
        author,
        sortBy
      },
      suggestions: generateSearchSuggestions(allArticles, query)
    });
    
  } catch (error) {
    console.error('검색 오류:', error);
    
    return NextResponse.json({
      success: false,
      error: '검색 중 오류가 발생했습니다',
      results: [],
      total: 0
    }, { status: 500 });
  }
}

function generateSearchSuggestions(articles: Article[], query: string): string[] {
  if (query.length < 2) return [];
  
  const queryLower = query.toLowerCase();
  const suggestions = new Set<string>();
  
  // 태그에서 제안
  articles.forEach(article => {
    article.tags.forEach(tag => {
      if (tag.toLowerCase().includes(queryLower) && tag.toLowerCase() !== queryLower) {
        suggestions.add(tag);
      }
    });
  });
  
  // 작가명에서 제안
  articles.forEach(article => {
    if (article.author.name.toLowerCase().includes(queryLower) && 
        article.author.name.toLowerCase() !== queryLower) {
      suggestions.add(article.author.name);
    }
  });
  
  // 플랫폼명에서 제안
  articles.forEach(article => {
    if (article.platform.name.toLowerCase().includes(queryLower) && 
        article.platform.name.toLowerCase() !== queryLower) {
      suggestions.add(article.platform.name);
    }
  });
  
  return Array.from(suggestions).slice(0, 5);
}
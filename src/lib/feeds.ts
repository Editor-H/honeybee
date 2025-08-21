import { Article } from '@/types/article';

export interface FeedResponse {
  success: boolean;
  totalArticles?: number;
  articles?: Article[];
  errors?: string[];
  lastUpdated: string;
  platforms?: string[];
}

// 모든 피드 가져오기
export async function getAllFeeds(): Promise<FeedResponse> {
  try {
    // 서버 사이드에서는 절대 URL 사용
    const baseUrl = typeof window === 'undefined' 
      ? process.env.VERCEL_URL 
        ? `https://${process.env.VERCEL_URL}`
        : 'http://localhost:3000'
      : '';
      
    const response = await fetch(`${baseUrl}/api/feeds/all`, {
      cache: 'no-store', // 항상 최신 데이터 가져오기
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('피드 가져오기 실패:', error);
    return {
      success: false,
      lastUpdated: new Date().toISOString(),
      errors: ['피드 데이터를 가져오는데 실패했습니다.']
    };
  }
}

// 특정 플랫폼 피드 가져오기
export async function getPlatformFeed(platform: 'toss' | 'daangn' | 'naver-d2'): Promise<FeedResponse> {
  try {
    const response = await fetch(`/api/feeds/${platform}`, {
      cache: 'no-store',
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`${platform} 피드 가져오기 실패:`, error);
    return {
      success: false,
      lastUpdated: new Date().toISOString(),
      errors: [`${platform} 피드 데이터를 가져오는데 실패했습니다.`]
    };
  }
}

// 캐시된 데이터와 함께 피드 가져오기 (fallback용)
export async function getFeedsWithFallback(): Promise<Article[]> {
  const feedResponse = await getAllFeeds();
  
  if (feedResponse.success && feedResponse.articles) {
    return feedResponse.articles;
  }
  
  // RSS 수집 실패 시 기존 mock 데이터를 fallback으로 사용
  const { getRecentArticles } = await import('@/data/mock-data');
  console.warn('RSS 수집 실패, mock 데이터 사용:', feedResponse.errors);
  return getRecentArticles(12);
}
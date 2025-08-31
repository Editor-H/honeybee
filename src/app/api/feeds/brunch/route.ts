import Parser from 'rss-parser';
import { NextResponse } from 'next/server';
import { Article, Author, Platform } from '@/types/article';

const parser = new Parser();

// 브런치 메타데이터
const brunchPlatform: Platform = {
  id: 'brunch',
  name: '브런치',
  type: 'community',
  baseUrl: 'https://brunch.co.kr',
  description: '관심사가 모이는 글 발행 플랫폼',
  isActive: true,
  lastCrawled: new Date()
};

// 기본 작가 정보
const defaultBrunchAuthor: Author = {
  id: 'brunch-writer',
  name: '브런치 작가',
  company: '브런치',
  expertise: ['Writing', 'Tech', 'IT'],
  articleCount: 0
};

export async function GET() {
  try {
    // 브런치는 공개 RSS가 제한적이므로 인기글 RSS 사용
    const feed = await parser.parseURL('https://brunch.co.kr/rss/keyword/%EA%B0%9C%EB%B0%9C');
    
    const articles: Article[] = feed.items.map((item, index) => {
      // 썸네일 이미지 추출
      let thumbnail: string | undefined;
      
      if (item.enclosure?.url && item.enclosure.type?.startsWith('image/')) {
        thumbnail = item.enclosure.url;
      }
      
      if (!thumbnail && item.content) {
        const imgMatch = item.content.match(/<img[^>]+src="([^"]+)"/i);
        if (imgMatch?.[1]) {
          thumbnail = imgMatch[1];
        }
      }
      
      if (!thumbnail && item.summary) {
        const imgMatch = item.summary.match(/<img[^>]+src="([^"]+)"/i);
        if (imgMatch?.[1]) {
          thumbnail = imgMatch[1];
        }
      }

      return {
        id: `brunch-${index}`,
        title: item.title || '제목 없음',
        content: item.content || item.summary || '',
        excerpt: item.summary || item.content?.substring(0, 200) + '...' || '',
        thumbnail,
        author: {
          ...defaultBrunchAuthor,
          name: item.creator || item.author || '브런치 작가'
        },
        platform: brunchPlatform,
        category: 'general' as const,
        tags: ['개발', 'Tech', ...(item.categories || [])],
        publishedAt: new Date(item.pubDate || Date.now()),
        viewCount: Math.floor(Math.random() * 3000) + 500,
        likeCount: Math.floor(Math.random() * 150) + 20,
        commentCount: Math.floor(Math.random() * 30) + 3,
        readingTime: Math.floor(Math.random() * 12) + 3,
        trending: Math.random() > 0.8,
        featured: Math.random() > 0.9,
        url: item.link || 'https://brunch.co.kr',
        contentType: 'article' as const
      };
    });

    return NextResponse.json({
      success: true,
      platform: 'brunch',
      articles,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('브런치 RSS 수집 에러:', error);
    
    // 브런치 RSS 실패 시 mock 데이터 제공
    const mockArticles: Article[] = [
      {
        id: 'brunch-mock-1',
        title: '개발자를 위한 효율적인 업무 환경 구축하기',
        content: '개발 생산성을 높이는 다양한 도구와 환경 설정 방법을 소개합니다.',
        excerpt: '개발 생산성을 높이는 다양한 도구와 환경 설정 방법을 소개합니다.',
        author: defaultBrunchAuthor,
        platform: brunchPlatform,
        category: 'general' as const,
        tags: ['개발', '생산성', '도구'],
        publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6시간 전
        viewCount: 1200,
        likeCount: 89,
        commentCount: 12,
        readingTime: 8,
        trending: false,
        featured: false,
        url: 'https://brunch.co.kr/@mock/dev-productivity',
        contentType: 'article' as const
      },
      {
        id: 'brunch-mock-2', 
        title: 'IT 업계 트렌드와 개발자 커리어 패스',
        content: '최신 IT 업계 동향과 개발자들의 다양한 커리어 경로를 분석해봅니다.',
        excerpt: '최신 IT 업계 동향과 개발자들의 다양한 커리어 경로를 분석해봅니다.',
        author: defaultBrunchAuthor,
        platform: brunchPlatform,
        category: 'general' as const,
        tags: ['IT', '커리어', '트렌드'],
        publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12시간 전
        viewCount: 2100,
        likeCount: 156,
        commentCount: 28,
        readingTime: 10,
        trending: true,
        featured: false,
        url: 'https://brunch.co.kr/@mock/it-career-trends',
        contentType: 'article' as const
      }
    ];

    return NextResponse.json({
      success: true,
      platform: 'brunch',
      articles: mockArticles,
      lastUpdated: new Date().toISOString(),
      note: 'RSS 수집 실패로 mock 데이터 제공'
    });
  }
}
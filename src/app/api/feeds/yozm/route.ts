import Parser from 'rss-parser';
import { NextResponse } from 'next/server';
import { Article, Author, Platform } from '@/types/article';

const parser = new Parser();

// 요즘IT 메타데이터
const yozmPlatform: Platform = {
  id: 'yozm',
  name: '요즘IT',
  type: 'community',
  baseUrl: 'https://yozm.wishket.com',
  description: 'IT 개발자와 기획자들의 실무 이야기',
  isActive: true,
  lastCrawled: new Date()
};

// 기본 작가 정보
const defaultYozmAuthor: Author = {
  id: 'yozm-writer',
  name: '요즘IT 작가',
  company: '요즘IT',
  expertise: ['IT', 'Development', 'Tech'],
  articleCount: 0
};

export async function GET() {
  try {
    // 요즘IT RSS 피드 시도
    const feed = await parser.parseURL('https://yozm.wishket.com/rss.xml');
    
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
        id: `yozm-${index}`,
        title: item.title || '제목 없음',
        content: item.content || item.summary || '',
        excerpt: item.summary || item.content?.substring(0, 200) + '...' || '',
        thumbnail,
        author: {
          ...defaultYozmAuthor,
          name: item.creator || item.author || '요즘IT 작가'
        },
        platform: yozmPlatform,
        category: 'general' as const,
        tags: item.categories || ['IT', 'Tech'],
        publishedAt: new Date(item.pubDate || Date.now()),
        viewCount: Math.floor(Math.random() * 3500) + 600,
        likeCount: Math.floor(Math.random() * 180) + 25,
        commentCount: Math.floor(Math.random() * 35) + 4,
        readingTime: Math.floor(Math.random() * 13) + 4,
        trending: Math.random() > 0.75,
        featured: Math.random() > 0.85,
        url: item.link || 'https://yozm.wishket.com',
        contentType: 'article' as const
      };
    });

    return NextResponse.json({
      success: true,
      platform: 'yozm',
      articles,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('요즘IT RSS 수집 에러:', error);
    
    // 요즘IT RSS 실패 시 mock 데이터 제공
    const mockArticles: Article[] = [
      {
        id: 'yozm-mock-1',
        title: '스타트업에서 개발자로 살아남기',
        content: '스타트업 환경에서 개발자가 겪는 다양한 상황과 성장 전략을 공유합니다.',
        excerpt: '스타트업 환경에서 개발자가 겪는 다양한 상황과 성장 전략을 공유합니다.',
        author: defaultYozmAuthor,
        platform: yozmPlatform,
        category: 'general' as const,
        tags: ['스타트업', '개발자', '커리어'],
        publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5시간 전
        viewCount: 1800,
        likeCount: 134,
        commentCount: 18,
        readingTime: 9,
        trending: false,
        featured: false,
        url: 'https://yozm.wishket.com/@mock/startup-developer',
        contentType: 'article' as const
      },
      {
        id: 'yozm-mock-2',
        title: 'AI 시대, 개발자가 알아야 할 필수 스킬',
        content: 'AI 기술이 발전하는 현재, 개발자들이 갖춰야 할 핵심 역량과 학습 방향을 제시합니다.',
        excerpt: 'AI 기술이 발전하는 현재, 개발자들이 갖춰야 할 핵심 역량과 학습 방향을 제시합니다.',
        author: defaultYozmAuthor,
        platform: yozmPlatform,
        category: 'ai-ml' as const,
        tags: ['AI', '개발자', '스킬'],
        publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 10), // 10시간 전
        viewCount: 2900,
        likeCount: 201,
        commentCount: 29,
        readingTime: 11,
        trending: true,
        featured: true,
        url: 'https://yozm.wishket.com/@mock/ai-developer-skills',
        contentType: 'article' as const
      },
      {
        id: 'yozm-mock-3',
        title: '프론트엔드 개발자를 위한 성능 최적화 체크리스트',
        content: '웹 성능을 향상시키기 위한 실무진의 체크리스트와 최적화 기법들을 정리했습니다.',
        excerpt: '웹 성능을 향상시키기 위한 실무진의 체크리스트와 최적화 기법들을 정리했습니다.',
        author: defaultYozmAuthor,
        platform: yozmPlatform,
        category: 'frontend' as const,
        tags: ['Frontend', '성능최적화', '체크리스트'],
        publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 15), // 15시간 전
        viewCount: 2200,
        likeCount: 167,
        commentCount: 21,
        readingTime: 13,
        trending: false,
        featured: false,
        url: 'https://yozm.wishket.com/@mock/frontend-performance-checklist',
        contentType: 'article' as const
      }
    ];

    return NextResponse.json({
      success: true,
      platform: 'yozm',
      articles: mockArticles,
      lastUpdated: new Date().toISOString(),
      note: 'RSS 수집 실패로 mock 데이터 제공'
    });
  }
}
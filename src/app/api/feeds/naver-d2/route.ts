import Parser from 'rss-parser';
import { NextResponse } from 'next/server';
import { Article, Author, Platform } from '@/types/article';

const parser = new Parser();

// 네이버 D2 메타데이터
const naverD2Platform: Platform = {
  id: 'naver-d2',
  name: 'NAVER D2',
  type: 'corporate',
  baseUrl: 'https://d2.naver.com',
  description: '네이버 개발자를 위한 기술 정보 공유',
  isActive: true,
  lastCrawled: new Date()
};

// 기본 작가 정보
const defaultNaverAuthor: Author = {
  id: 'naver-team',
  name: '네이버 개발팀',
  company: '네이버',
  expertise: ['AI', 'Search', 'Cloud', 'Frontend'],
  articleCount: 0
};

export async function GET() {
  try {
    const feed = await parser.parseURL('https://d2.naver.com/d2.atom');
    
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
      id: `naver-d2-${index}`,
      title: item.title || '제목 없음',
      content: item.content || item.summary || '',
      excerpt: item.summary || item.content?.substring(0, 200) + '...' || '',
      thumbnail,
      author: {
        ...defaultNaverAuthor,
        name: item.creator || item.author || '네이버 개발팀'
      },
      platform: naverD2Platform,
      category: 'general' as const,
      tags: item.categories || ['Tech'],
      publishedAt: new Date(item.pubDate || Date.now()),
      viewCount: Math.floor(Math.random() * 8000) + 2000, // 네이버는 조회수가 더 높다고 가정
      likeCount: Math.floor(Math.random() * 300) + 100,
      commentCount: Math.floor(Math.random() * 80) + 10,
      readingTime: Math.floor(Math.random() * 20) + 8,
      trending: Math.random() > 0.6,
      featured: Math.random() > 0.7,
      url: item.link || 'https://d2.naver.com',
      contentType: 'article' as const
      };
    });

    return NextResponse.json({
      success: true,
      platform: 'naver-d2',
      articles,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('네이버 D2 RSS 수집 에러:', error);
    return NextResponse.json({
      success: false,
      error: 'RSS 수집 실패',
      platform: 'naver-d2'
    }, { status: 500 });
  }
}
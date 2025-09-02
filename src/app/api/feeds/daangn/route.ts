import Parser from 'rss-parser';
import { NextResponse } from 'next/server';
import { Article, Author, Platform } from '@/types/article';

const parser = new Parser();

// 당근마켓 기술블로그 메타데이터
const daangnPlatform: Platform = {
  id: 'daangn',
  name: '당근마켓 기술블로그',
  type: 'corporate',
  baseUrl: 'https://medium.com/daangn',
  description: '당근마켓 팀의 기술 이야기',
  isActive: true,
  lastCrawled: new Date()
};

// 기본 작가 정보
const defaultDaangnAuthor: Author = {
  id: 'daangn-team',
  name: '당근마켓 팀',
  company: '당근마켓',
  expertise: ['Mobile', 'Backend', 'Data'],
  articleCount: 0
};

export async function GET() {
  try {
    // Medium RSS 피드 URL
    const feed = await parser.parseURL('https://medium.com/feed/daangn');
    
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
      id: `daangn-${index}`,
      title: item.title || '제목 없음',
      content: item.content || item.summary || '',
      excerpt: item.summary || item.content?.substring(0, 200) + '...' || '',
      thumbnail,
      author: {
        ...defaultDaangnAuthor,
        name: item.creator || item.author || '당근마켓 팀'
      },
      platform: daangnPlatform,
      category: 'general' as const,
      tags: item.categories || ['Tech'],
      publishedAt: new Date(item.pubDate || Date.now()),
      viewCount: Math.floor(Math.random() * 5000) + 1000,
      likeCount: Math.floor(Math.random() * 200) + 50,
      commentCount: Math.floor(Math.random() * 50) + 5,
      trending: Math.random() > 0.7,
      featured: Math.random() > 0.8,
      url: item.link || 'https://medium.com/daangn',
      contentType: 'article' as const,
      readingTime: Math.floor(Math.random() * 15) + 5
      };
    });

    return NextResponse.json({
      success: true,
      platform: 'daangn',
      articles,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('당근마켓 RSS 수집 에러:', error);
    return NextResponse.json({
      success: false,
      error: 'RSS 수집 실패',
      platform: 'daangn'
    }, { status: 500 });
  }
}
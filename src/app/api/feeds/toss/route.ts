import Parser from 'rss-parser';
import { NextResponse } from 'next/server';
import { Article, Author, Platform } from '@/types/article';

const parser = new Parser();

// 토스 기술블로그 메타데이터
const tossPlatform: Platform = {
  id: 'toss',
  name: '토스 기술블로그',
  type: 'corporate',
  baseUrl: 'https://toss.tech',
  description: '토스팀이 만드는 기술 이야기',
  isActive: true,
  lastCrawled: new Date()
};

// 기본 작가 정보 (RSS에서 작가 정보가 부족할 때 사용)
const defaultTossAuthor: Author = {
  id: 'toss-team',
  name: '토스팀',
  company: '토스',
  expertise: ['Fintech', 'Frontend', 'Backend'],
  articleCount: 0
};

// 향상된 썸네일 추출 함수
function extractThumbnail(item: Parser.Item): string | undefined {
  // 1. RSS enclosure에서 이미지 추출 (대표 이미지)
  if (item.enclosure?.url && item.enclosure.type?.startsWith('image/')) {
    return item.enclosure.url;
  }
  
  // 2. Media RSS 네임스페이스에서 썸네일 추출
  if (item['media:thumbnail']?.['$']?.url) {
    return item['media:thumbnail']['$'].url;
  }
  
  if (item['media:content']?.['$']?.url && item['media:content']['$'].type?.startsWith('image/')) {
    return item['media:content']['$'].url;
  }
  
  // 3. 본문 내용에서 이미지 추출 (여러 패턴 시도)
  const contentSources = [item['content:encoded'], item.content, item.summary, item.description];
  
  for (const content of contentSources) {
    if (!content) continue;
    
    // 3-1. 일반적인 img 태그
    const imgMatches = content.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi);
    if (imgMatches) {
      for (const imgTag of imgMatches) {
        const srcMatch = imgTag.match(/src=["']([^"']+)["']/i);
        if (srcMatch?.[1]) {
          const imageUrl = srcMatch[1];
          // 유효한 이미지 URL인지 확인
          if (isValidImageUrl(imageUrl)) {
            return imageUrl;
          }
        }
      }
    }
    
    // 3-2. Toss 특화: static.toss.im 이미지 직접 추출
    const tossImgMatch = content.match(/https:\/\/static\.toss\.im\/[^"'\s]+\.(?:jpg|jpeg|png|gif|webp)(?:\?[^"'\s]*)?/i);
    if (tossImgMatch?.[0] && isValidImageUrl(tossImgMatch[0])) {
      return tossImgMatch[0];
    }
    
    // 3-3. 일반적인 이미지 URL 패턴
    const urlMatch = content.match(/https?:\/\/[^"'\s]+\.(?:jpg|jpeg|png|gif|webp)(?:\?[^"'\s]*)?/i);
    if (urlMatch?.[0] && isValidImageUrl(urlMatch[0])) {
      return urlMatch[0];
    }
  }
  
  return undefined;
}

// 유효한 이미지 URL인지 검증하는 함수
function isValidImageUrl(url: string): boolean {
  if (!url || url.length < 10) return false;
  
  // 유효한 이미지 확장자 체크
  const imageExtensions = /\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i;
  const hasImageExtension = imageExtensions.test(url);
  
  // 이미지 CDN 도메인 체크
  const imageCdnDomains = [
    'static.toss.im',
    'images.unsplash.com',
    'github.com',
    'githubusercontent.com'
  ];
  const isFromImageCdn = imageCdnDomains.some(domain => url.includes(domain));
  
  // 제외할 패턴 (아바타, 아이콘 등)
  const excludePatterns = [
    /avatar/i,
    /profile/i,
    /icon/i,
    /logo/i,
    /\d+x\d+\./, // 작은 크기 이미지 (예: 50x50)
    /width.*?=.*?[1-9]\d{0,2}/, // 너비가 100px 미만
    /w_\d{1,2}/, // 너비 파라미터가 100 미만
  ];
  
  const isExcluded = excludePatterns.some(pattern => pattern.test(url));
  
  return (hasImageExtension || isFromImageCdn) && !isExcluded;
}

export async function GET() {
  try {
    const feed = await parser.parseURL('https://toss.tech/rss.xml');
    
    const articles: Article[] = feed.items.map((item, index) => {

      return {
      id: `toss-${index}`,
      title: item.title || '제목 없음',
      content: item.content || item.summary || '',
      excerpt: item.summary || item.content?.substring(0, 200) + '...' || '',
      thumbnail: extractThumbnail(item),
      author: {
        ...defaultTossAuthor,
        name: item.creator || item.author || '토스팀'
      },
      platform: tossPlatform,
      category: 'general' as const,
      tags: item.categories || ['Tech'],
      publishedAt: new Date(item.pubDate || Date.now()),
      viewCount: Math.floor(Math.random() * 5000) + 1000, // 임시 조회수
      likeCount: Math.floor(Math.random() * 200) + 50,
      commentCount: Math.floor(Math.random() * 50) + 5,
      readingTime: Math.floor(Math.random() * 15) + 5,
      trending: Math.random() > 0.7,
      featured: Math.random() > 0.8,
      url: item.link || 'https://toss.tech'
      };
    });

    return NextResponse.json({
      success: true,
      platform: 'toss',
      articles,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('토스 RSS 수집 에러:', error);
    return NextResponse.json({
      success: false,
      error: 'RSS 수집 실패',
      platform: 'toss'
    }, { status: 500 });
  }
}
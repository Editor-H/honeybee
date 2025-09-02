import Parser from 'rss-parser';
import { NextResponse } from 'next/server';
import { Article, Author, Platform } from '@/types/article';

const parser = new Parser();

// 향상된 썸네일 추출 함수 (Medium 특화)
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
  const contentSources = [item['content:encoded'], item.content, item.summary, (item as Record<string, unknown>).description];
  
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
    
    // 3-2. Medium 특화: figure 태그 내 이미지
    const figureMatch = content.match(/<figure[^>]*>.*?<img[^>]+src=["']([^"']+)["'][^>]*>.*?<\/figure>/i);
    if (figureMatch?.[1] && isValidImageUrl(figureMatch[1])) {
      return figureMatch[1];
    }
    
    // 3-3. Medium 특화: CDN 이미지 직접 추출
    const mediumCdnMatch = content.match(/https:\/\/cdn-images-\d+\.medium\.com\/[^"'\s]+/i);
    if (mediumCdnMatch?.[0] && isValidImageUrl(mediumCdnMatch[0])) {
      return mediumCdnMatch[0];
    }
    
    // 3-4. 일반적인 이미지 URL 패턴
    const urlMatch = content.match(/https?:\/\/[^"'\s]+\.(?:jpg|jpeg|png|gif|webp)(?:\?[^"'\s]*)?/i);
    if (urlMatch?.[0] && isValidImageUrl(urlMatch[0])) {
      return urlMatch[0];
    }
  }
  
  return undefined;
}

// 유효한 이미지 URL인지 검증하는 함수 (Medium 특화)
function isValidImageUrl(url: string): boolean {
  if (!url || url.length < 10) return false;
  
  // 유효한 이미지 확장자 체크
  const imageExtensions = /\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i;
  const hasImageExtension = imageExtensions.test(url);
  
  // 이미지 CDN 도메인 체크
  const imageCdnDomains = [
    'cdn-images-1.medium.com',
    'miro.medium.com', 
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
    /1\*[a-zA-Z0-9_-]+\.jpeg$/, // Medium 아바타 패턴
    /\d+x\d+\./, // 작은 크기 이미지 (예: 50x50)
    /width.*?=.*?[1-9]\d{0,2}/, // 너비가 100px 미만
    /w_\d{1,2}/, // 너비 파라미터가 100 미만
  ];
  
  const isExcluded = excludePatterns.some(pattern => pattern.test(url));
  
  return (hasImageExtension || isFromImageCdn) && !isExcluded;
}

// 미디엄 메타데이터
const mediumPlatform: Platform = {
  id: 'medium',
  name: 'Medium',
  type: 'community',
  baseUrl: 'https://medium.com',
  description: '전 세계 개발자들의 기술 이야기',
  isActive: true,
  lastCrawled: new Date()
};

// 기본 작가 정보
const defaultMediumAuthor: Author = {
  id: 'medium-writer',
  name: 'Medium Writer',
  company: 'Medium',
  expertise: ['Tech', 'Programming', 'Development'],
  articleCount: 0
};

export async function GET() {
  try {
    // Medium의 여러 Tech 관련 태그 RSS를 수집
    const feeds = await Promise.allSettled([
      parser.parseURL('https://medium.com/feed/tag/programming'),
      parser.parseURL('https://medium.com/feed/tag/javascript'),
      parser.parseURL('https://medium.com/feed/tag/react'),
      parser.parseURL('https://medium.com/feed/tag/nodejs')
    ]);

    const allArticles: Article[] = [];

    feeds.forEach((feedResult, feedIndex) => {
      if (feedResult.status === 'fulfilled') {
        const feed = feedResult.value;
        const feedArticles = feed.items.slice(0, 3).map((item, index) => {
          return {
            id: `medium-${feedIndex}-${index}`,
            title: item.title || '제목 없음',
            content: item.content || item.summary || '',
            excerpt: item.summary || item.content?.substring(0, 200) + '...' || '',
            thumbnail: extractThumbnail(item),
            author: {
              ...defaultMediumAuthor,
              name: item.creator || item.author || 'Medium Writer'
            },
            platform: mediumPlatform,
            category: 'frontend' as const,
            tags: item.categories || ['Tech'],
            publishedAt: new Date(item.pubDate || Date.now()),
            viewCount: Math.floor(Math.random() * 4000) + 800,
            likeCount: Math.floor(Math.random() * 200) + 30,
            commentCount: Math.floor(Math.random() * 40) + 5,
            readingTime: Math.floor(Math.random() * 15) + 5,
            trending: Math.random() > 0.7,
            featured: Math.random() > 0.8,
            url: item.link || 'https://medium.com',
            contentType: 'article' as const,
            isBookmarked: false
          };
        });
        
        allArticles.push(...feedArticles);
      }
    });

    // 최신순 정렬
    allArticles.sort((a, b) => 
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );

    return NextResponse.json({
      success: true,
      platform: 'medium',
      articles: allArticles.slice(0, 10), // 최대 10개로 제한
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Medium RSS 수집 에러:', error);
    
    // Medium RSS 실패 시 mock 데이터 제공
    const mockArticles: Article[] = [
      {
        id: 'medium-mock-1',
        title: 'React 19의 새로운 기능들과 성능 개선사항',
        content: 'React 19에서 도입된 주요 기능들과 성능 최적화 방법을 살펴봅니다.',
        excerpt: 'React 19에서 도입된 주요 기능들과 성능 최적화 방법을 살펴봅니다.',
        author: defaultMediumAuthor,
        platform: mediumPlatform,
        category: 'frontend' as const,
        tags: ['React', 'JavaScript', 'Frontend'],
        publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4시간 전
        viewCount: 2800,
        likeCount: 189,
        commentCount: 23,
        readingTime: 12,
        trending: true,
        featured: false,
        url: 'https://medium.com/@mock/react-19-features',
        contentType: 'article' as const
      },
      {
        id: 'medium-mock-2',
        title: 'Node.js 성능 최적화를 위한 실전 가이드',
        content: 'Node.js 애플리케이션의 성능을 향상시키는 다양한 기법들을 실제 사례와 함께 소개합니다.',
        excerpt: 'Node.js 애플리케이션의 성능을 향상시키는 다양한 기법들을 실제 사례와 함께 소개합니다.',
        author: defaultMediumAuthor,
        platform: mediumPlatform,
        category: 'backend' as const,
        tags: ['Node.js', 'Performance', 'Backend'],
        publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 8), // 8시간 전
        viewCount: 3200,
        likeCount: 245,
        commentCount: 34,
        readingTime: 15,
        trending: true,
        featured: true,
        url: 'https://medium.com/@mock/nodejs-performance-guide',
        contentType: 'article' as const
      }
    ];

    return NextResponse.json({
      success: true,
      platform: 'medium',
      articles: mockArticles,
      lastUpdated: new Date().toISOString(),
      note: 'RSS 수집 실패로 mock 데이터 제공'
    });
  }
}
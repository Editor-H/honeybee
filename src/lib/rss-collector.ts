import Parser from 'rss-parser';
import { Article, Author, Platform } from '@/types/article';

const parser = new Parser();

// 플랫폼 메타데이터
const platforms = {
  toss: {
    id: 'toss',
    name: '토스 기술블로그',
    type: 'corporate' as const,
    baseUrl: 'https://toss.tech',
    description: '토스팀이 만드는 기술 이야기',
    isActive: true,
    rssUrl: 'https://toss.tech/rss.xml'
  },
  daangn: {
    id: 'daangn',
    name: '당근마켓 기술블로그',
    type: 'corporate' as const,
    baseUrl: 'https://medium.com/daangn',
    description: '당근마켓 팀의 기술 이야기',
    isActive: true,
    rssUrl: 'https://medium.com/feed/daangn'
  },
  medium: {
    id: 'medium',
    name: 'Medium',
    type: 'community' as const,
    baseUrl: 'https://medium.com',
    description: '전 세계 개발자들의 기술 이야기',
    isActive: true,
    rssUrl: 'https://medium.com/feed/tag/javascript'
  }
};

// 카테고리 자동 분류 함수
function categorizeArticle(title: string, content: string, tags: string[]): string {
  const text = `${title} ${content} ${tags.join(' ')}`.toLowerCase();
  
  const categoryKeywords = {
    frontend: {
      keywords: ['react', 'vue', 'angular', 'javascript', 'typescript', 'css', 'html', 'frontend', 'ui', 'ux', 'design system', 'component', 'jsx', 'dom', 'browser', '프론트엔드', '리액트', '자바스크립트'],
      weight: 0
    },
    backend: {
      keywords: ['backend', 'server', 'api', 'database', 'sql', 'nosql', 'node.js', 'python', 'java', 'spring', 'express', 'fastapi', 'django', 'mysql', 'postgresql', 'mongodb', '백엔드', '서버', '데이터베이스'],
      weight: 0
    },
    'ai-ml': {
      keywords: ['ai', 'artificial intelligence', 'machine learning', 'deep learning', 'ml', 'tensorflow', 'pytorch', 'chatgpt', 'gpt', 'llm', 'neural network', 'data science', '인공지능', '머신러닝', '딥러닝'],
      weight: 0
    },
    devops: {
      keywords: ['devops', 'docker', 'kubernetes', 'k8s', 'aws', 'azure', 'gcp', 'cloud', 'deploy', 'deployment', 'ci/cd', 'jenkins', 'github actions', 'infrastructure', 'monitoring', '배포', '인프라', '클라우드'],
      weight: 0
    },
    mobile: {
      keywords: ['mobile', 'react native', 'flutter', 'ios', 'android', 'swift', 'kotlin', 'app', 'application', '모바일', '앱'],
      weight: 0
    },
    design: {
      keywords: ['design', 'ux', 'ui design', 'figma', 'sketch', 'prototype', 'user experience', 'user interface', 'graphic', '디자인', '사용자경험', '프로토타입'],
      weight: 0
    },
    data: {
      keywords: ['data', 'analytics', 'big data', 'data engineering', 'etl', 'data warehouse', 'spark', 'hadoop', 'kafka', '데이터', '분석', '빅데이터'],
      weight: 0
    },
    security: {
      keywords: ['security', 'cybersecurity', 'authentication', 'authorization', 'encryption', 'jwt', 'oauth', 'vulnerability', 'penetration', '보안', '인증', '암호화'],
      weight: 0
    }
  };

  // 각 카테고리별로 키워드 매칭 점수 계산
  for (const [category, config] of Object.entries(categoryKeywords)) {
    config.weight = config.keywords.reduce((score, keyword) => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const matches = text.match(regex);
      return score + (matches ? matches.length : 0);
    }, 0);
  }

  // 가장 높은 점수의 카테고리 선택
  const bestCategory = Object.entries(categoryKeywords)
    .sort(([,a], [,b]) => b.weight - a.weight)
    .find(([, config]) => config.weight > 0);

  return bestCategory ? bestCategory[0] : 'general';
}

// 향상된 썸네일 추출 함수
function extractThumbnail(item: any): string | undefined {
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

// 유효한 이미지 URL인지 검증하는 함수
function isValidImageUrl(url: string): boolean {
  if (!url || url.length < 10) return false;
  
  // 유효한 이미지 확장자 체크
  const imageExtensions = /\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i;
  const hasImageExtension = imageExtensions.test(url);
  
  // 이미지 CDN 도메인 체크
  const imageCdnDomains = [
    'cdn-images-1.medium.com',
    'miro.medium.com', 
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
    /1\*[a-zA-Z0-9_-]+\.jpeg$/, // Medium 아바타 패턴
    /\d+x\d+\./, // 작은 크기 이미지 (예: 50x50)
    /width.*?=.*?[1-9]\d{0,2}/, // 너비가 100px 미만
    /w_\d{1,2}/, // 너비 파라미터가 100 미만
  ];
  
  const isExcluded = excludePatterns.some(pattern => pattern.test(url));
  
  return (hasImageExtension || isFromImageCdn) && !isExcluded;
}

// 큐레이션 알고리즘: 플랫폼 다양성과 시간 균형을 고려
function curateArticles(articles: Article[]): Article[] {
  // 1. 플랫폼별로 그룹화
  const articlesByPlatform = articles.reduce((acc, article) => {
    const platformId = article.platform.id;
    if (!acc[platformId]) acc[platformId] = [];
    acc[platformId].push(article);
    return acc;
  }, {} as Record<string, Article[]>);

  // 2. 각 플랫폼에서 최신순 정렬
  Object.keys(articlesByPlatform).forEach(platformId => {
    articlesByPlatform[platformId].sort((a, b) => 
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
  });

  // 3. 라운드 로빈 방식으로 플랫폼 간 균형있게 배치
  const curatedArticles: Article[] = [];
  const platformIds = Object.keys(articlesByPlatform);
  const maxRounds = Math.max(...Object.values(articlesByPlatform).map(arr => arr.length));

  for (let round = 0; round < maxRounds; round++) {
    for (const platformId of platformIds) {
      const platformArticles = articlesByPlatform[platformId];
      if (platformArticles && platformArticles[round]) {
        curatedArticles.push(platformArticles[round]);
      }
    }
  }

  // 4. 최종적으로 12개로 제한 (4행 x 3열)
  return curatedArticles.slice(0, 12);
}

// RSS 수집 함수
export async function collectAllFeeds(): Promise<Article[]> {
  const allArticles: Article[] = [];
  
  for (const [platformKey, platformData] of Object.entries(platforms)) {
    try {
      console.log(`Collecting from ${platformData.name}...`);
      const feed = await parser.parseURL(platformData.rssUrl);
      
      // 미디엄만 엄격한 필터링 적용
      let itemsToProcess = feed.items;
      
      if (platformKey === 'medium') {
        itemsToProcess = feed.items.filter(item => {
          const title = item.title?.toLowerCase() || '';
          const content = item.content?.toLowerCase() || '';
          const summary = item.summary?.toLowerCase() || '';
          const author = item.creator?.toLowerCase() || '';
          const text = `${title} ${content} ${summary}`;
          
          // 스팸 체크: 비정상적인 문자, 반복 패턴, 숫자로만 이루어진 제목
          const spamPatterns = [
            /[\u0600-\u06FF]/, // 아랍어
            /[\u0590-\u05FF]/, // 히브리어  
            /^\d+[\u0600-\u06FF]/, // 숫자 + 아랍어
            /شماره|خاله|تهران/, // 특정 스팸 키워드
            /(.)\1{4,}/, // 같은 문자 5번 이상 반복
            /^\d{10,}/, // 10자리 이상 숫자로 시작
            /^[^\w\s]{3,}/ // 특수문자만 3개 이상
          ];
          
          const isSpam = spamPatterns.some(pattern => pattern.test(title) || pattern.test(content));
          if (isSpam) return false;
          
          // 제목이 너무 짧거나 의미없는 경우
          if (title.length < 10 || !title.match(/[a-zA-Z]/)) return false;
          
          // 개발/기술 관련 키워드 (더 엄격하게)
          const techKeywords = [
            'javascript', 'react', 'vue', 'angular', 'node.js', 'typescript', 
            'frontend', 'backend', 'development', 'programming', 'code', 'coding',
            'software', 'web development', 'api', 'database', 'algorithm',
            'html', 'css', 'python', 'java', 'framework', 'library'
          ];
          
          // 제외할 키워드 (확장)
          const excludeKeywords = [
            'crypto', 'bitcoin', 'trading', 'investment', 'finance', 'marketing', 
            'business', 'startup funding', 'politics', 'personal', 'life', 'story',
            'motivation', 'inspiration', 'self-help', 'career advice', 'freelance',
            'remote work', 'productivity', 'mindset'
          ];
          
          const hasTechKeyword = techKeywords.some(keyword => text.includes(keyword));
          const hasExcludeKeyword = excludeKeywords.some(keyword => text.includes(keyword));
          
          // 작가명도 체크 (스팸성 작가 필터링)
          const suspiciousAuthor = author.length > 50 || author.match(/[\u0600-\u06FF]/);
          
          return hasTechKeyword && !hasExcludeKeyword && !suspiciousAuthor;
        });
      }

      // 플랫폼별 최대 수집 개수 제한
      const maxArticlesPerPlatform = {
        toss: 8,        // 토스: 기업 블로그라서 품질이 높음
        daangn: 6,      // 당근마켓: 기업 블로그
        medium: 4       // 미디엄: 커뮤니티라서 양이 많으니 제한
      };
      
      const maxArticles = maxArticlesPerPlatform[platformKey as keyof typeof maxArticlesPerPlatform] || 5;
      const articles = itemsToProcess.slice(0, maxArticles).map((item, index) => {
        const defaultAuthor: Author = {
          id: `${platformKey}-author`,
          name: item.creator || item.author || `${platformData.name} 작가`,
          company: platformData.name,
          expertise: ['Tech'],
          articleCount: 0
        };

        const platform: Platform = {
          ...platformData,
          lastCrawled: new Date()
        };

        const title = item.title || '제목 없음';
        const content = item.content || item.summary || '';
        const tags = item.categories || ['Tech'];
        
        return {
          id: `${platformKey}-${index}`,
          title,
          content,
          excerpt: item.summary || content.substring(0, 200) + '...' || '',
          thumbnail: extractThumbnail(item),
          author: defaultAuthor,
          platform,
          category: categorizeArticle(title, content, tags) as any,
          tags,
          publishedAt: new Date(item.pubDate || Date.now()),
          viewCount: Math.floor(Math.random() * 5000) + 1000,
          likeCount: Math.floor(Math.random() * 200) + 50,
          commentCount: Math.floor(Math.random() * 50) + 5,
          readingTime: Math.floor(Math.random() * 15) + 5,
          trending: Math.random() > 0.7,
          featured: Math.random() > 0.8,
          url: item.link || platformData.baseUrl
        };
      });

      allArticles.push(...articles);
      console.log(`Collected ${articles.length} articles from ${platformData.name}`);
      
    } catch (error) {
      console.error(`Failed to collect from ${platformData.name}:`, error);
    }
  }

  // 큐레이션 알고리즘: 다양성과 품질을 고려한 정렬
  const curatedArticles = curateArticles(allArticles);

  console.log(`Total articles collected: ${allArticles.length}, After curation: ${curatedArticles.length}`);
  return curatedArticles;
}
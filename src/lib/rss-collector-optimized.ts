import Parser from 'rss-parser';
import { Article, Author, Platform, ArticleCategory } from '@/types/article';
import { CacheManager } from './cache-manager';
import { collectScrapedArticles } from './web-scraper';
import { calculateQualityScore, filterHighQualityArticles, suggestTags } from './content-quality-scorer';

const parser = new Parser();

// 주요 플랫폼 정의 (간소화된 버전)
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
  kakao: {
    id: 'kakao',
    name: '카카오 기술블로그',
    type: 'corporate' as const,
    baseUrl: 'https://tech.kakao.com',
    description: '카카오의 기술과 서비스 이야기',
    isActive: true,
    rssUrl: 'https://tech.kakao.com/feed/'
  },
  naver: {
    id: 'naver',
    name: '네이버 D2',
    type: 'corporate' as const,
    baseUrl: 'https://d2.naver.com',
    description: '네이버 개발자들의 기술 이야기',
    isActive: true,
    rssUrl: 'https://d2.naver.com/d2.atom'
  },
  woowahan: {
    id: 'woowahan',
    name: '우아한형제들',
    type: 'corporate' as const,
    baseUrl: 'https://techblog.woowahan.com',
    description: '우아한형제들의 기술 블로그',
    isActive: true,
    rssUrl: 'https://techblog.woowahan.com/feed/'
  },
  medium: {
    id: 'medium',
    name: 'Medium',
    type: 'community' as const,
    baseUrl: 'https://medium.com',
    description: '전 세계 개발자들의 기술 이야기',
    isActive: true,
    rssUrl: 'https://medium.com/feed/tag/javascript'
  },
  yozm: {
    id: 'yozm',
    name: '요즘IT',
    type: 'media' as const,
    baseUrl: 'https://yozm.wishket.com',
    description: 'IT 개발자와 기획자를 위한 전문 미디어',
    isActive: true,
    rssUrl: 'https://yozm.wishket.com/rss.xml'
  },
  outstanding: {
    id: 'outstanding',
    name: '아웃스탠딩',
    type: 'media' as const,
    baseUrl: 'https://outstanding.kr',
    description: '비즈니스와 테크 트렌드를 다루는 미디어',
    isActive: true,
    rssUrl: 'https://outstanding.kr/feed'
  },
  hacker_news: {
    id: 'hacker_news',
    name: 'Hacker News',
    type: 'community' as const,
    baseUrl: 'https://news.ycombinator.com',
    description: '지적 호기심을 자극하는 기술 뉴스',
    isActive: true,
    rssUrl: 'https://news.ycombinator.com/rss'
  },
  jocoding: {
    id: 'jocoding',
    name: 'YouTube',
    type: 'educational' as const,
    baseUrl: 'https://www.youtube.com/@조코딩',
    channelName: '조코딩',
    description: '프로그래밍 교육 및 개발 관련 콘텐츠',
    isActive: true,
    rssUrl: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCQNE2JmbasNYbjGAcuBiRRg'
  },
  opentutorials: {
    id: 'opentutorials',
    name: 'YouTube',
    type: 'educational' as const,
    baseUrl: 'https://www.youtube.com/@opentutorials',
    channelName: '생활코딩',
    description: '프로그래밍 교육의 대표 채널',
    isActive: true,
    rssUrl: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCvc8kv-i5fvFTJBFAk6n1SA'
  }
};

// HTML 태그 제거 및 텍스트 정제 함수
function stripHtmlAndClean(html: string): string {
  if (!html) return '';
  
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"')
    .replace(/&lsquo;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&hellip;/g, '...')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&#\d+;/g, '')
    .replace(/\u00a0/g, ' ')
    .replace(/[\u200b-\u200d\ufeff]/g, '')
    .replace(/\s+/g, ' ')
    .replace(/\n\s*\n/g, ' ')
    .trim();
}

// excerpt 생성 함수
function generateExcerpt(content: string, maxLength: number = 200): string {
  const cleanText = stripHtmlAndClean(content);
  if (!cleanText) return '';
  if (cleanText.length <= maxLength) return cleanText;
  
  const truncated = cleanText.substring(0, maxLength);
  const lastSentenceEnd = Math.max(
    truncated.lastIndexOf('.'),
    truncated.lastIndexOf('!'),
    truncated.lastIndexOf('?'),
    truncated.lastIndexOf('。')
  );
  
  if (lastSentenceEnd > maxLength * 0.6) {
    return truncated.substring(0, lastSentenceEnd + 1);
  }
  
  const lastSpace = truncated.lastIndexOf(' ');
  if (lastSpace > maxLength * 0.8) {
    return truncated.substring(0, lastSpace) + '...';
  }
  
  return truncated + '...';
}

// YouTube 관련 함수들
function extractVideoId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
  return match ? match[1] : null;
}

function getYoutubeThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
}

function estimateVideoDuration(): number {
  return Math.floor(Math.random() * 1200) + 300;
}

// 스마트 태그 생성 (간소화)
function generateSmartTags(title: string, content: string, originalTags: string[]): string[] {
  const text = `${title} ${content}`.toLowerCase();
  const smartTags: string[] = [];
  
  const techKeywords = {
    'React': ['react', 'jsx', 'hooks'],
    'Vue': ['vue', 'vuejs'],
    'JavaScript': ['javascript', 'js', 'typescript'],
    'Python': ['python', 'django'],
    'AI': ['ai', 'machine learning', 'deep learning'],
    'Cloud': ['cloud', 'aws', 'azure'],
    'Mobile': ['mobile', 'ios', 'android']
  };
  
  Object.entries(techKeywords).forEach(([tag, keywords]) => {
    if (keywords.some(keyword => text.includes(keyword))) {
      smartTags.push(tag);
    }
  });
  
  const uniqueTags = [...new Set([...originalTags.slice(0, 2), ...smartTags])];
  return uniqueTags.slice(0, 4);
}

// 카테고리 자동 분류 (간소화)
function categorizeArticle(title: string, content: string): string {
  const text = `${title} ${content}`.toLowerCase();
  
  const categories = {
    'ai-ml': ['ai', 'machine learning', 'deep learning'],
    'frontend': ['react', 'vue', 'javascript', 'frontend'],
    'backend': ['backend', 'server', 'api', 'database'],
    'mobile': ['mobile', 'ios', 'android', 'app'],
    'cloud-infra': ['cloud', 'aws', 'kubernetes', 'docker'],
    'events': ['conference', 'meetup', 'event', 'summit']
  };
  
  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      return category;
    }
  }
  
  return 'general';
}

// 플랫폼별 RSS 수집 함수 (타임아웃 및 에러 처리 강화)
async function collectPlatformFeed(
  platformKey: string, 
  platformData: any, 
  timeout: number = 12000
): Promise<Article[]> {
  
  const logDisplayName = platformData.name === 'YouTube' && 'channelName' in platformData 
    ? `YouTube • ${(platformData as any).channelName}` 
    : platformData.name;

  return new Promise(async (resolve) => {
    const timeoutId = setTimeout(() => {
      console.log(`⏱️ ${logDisplayName} 타임아웃 (${timeout/1000}초)`);
      resolve([]);
    }, timeout);

    try {
      console.log(`🔄 ${logDisplayName} 수집 시작`);
      
      const startTime = Date.now();
      
      // RSS 파싱 설정
      let feed;
      if (platformKey === 'naver') {
        const customParser = new Parser({
          requestOptions: {
            headers: {
              'User-Agent': 'Mozilla/5.0 (compatible; HoneyBee/1.0)',
              'Accept': 'application/rss+xml, application/atom+xml'
            },
            timeout: timeout - 2000
          }
        });
        feed = await customParser.parseURL(platformData.rssUrl);
      } else {
        const customParser = new Parser({
          requestOptions: {
            timeout: timeout - 2000
          }
        });
        feed = await customParser.parseURL(platformData.rssUrl);
      }
      
      const fetchTime = Date.now() - startTime;
      console.log(`✓ ${logDisplayName} 파싱 완료 (${fetchTime}ms, ${feed.items?.length || 0}개 아이템)`);
      
      // 플랫폼별 최대 수집 개수 설정
      const maxArticles = getMaxArticlesForPlatform(platformKey);
      let itemsToProcess = (feed.items || []).slice(0, maxArticles);
      
      // 미디엄 특별 필터링
      if (platformKey === 'medium') {
        itemsToProcess = applyMediumFiltering(itemsToProcess);
      }
      
      // 아티클 변환
      const articles = itemsToProcess.map((item, index) => 
        convertItemToArticle(item, index, platformKey, platformData)
      );
      
      clearTimeout(timeoutId);
      console.log(`✅ ${logDisplayName}: ${articles.length}개 수집 완료`);
      resolve(articles);
      
    } catch (error) {
      clearTimeout(timeoutId);
      console.error(`❌ ${logDisplayName} 수집 실패:`, error instanceof Error ? error.message : error);
      resolve([]);
    }
  });
}

// 플랫폼별 최대 아티클 수 설정
function getMaxArticlesForPlatform(platformKey: string): number {
  const limits: Record<string, number> = {
    toss: 15, daangn: 12, kakao: 12, naver: 12, woowahan: 12,
    medium: 3, hacker_news: 10,
    google_dev: 6, line_dev: 6, aws_korea: 6,
    yozm: 12, outstanding: 10
  };
  return limits[platformKey] || 10;
}

// 미디엄 필터링 (간소화)
function applyMediumFiltering(items: any[]): any[] {
  return items.filter(item => {
    const title = (item.title || '').toLowerCase();
    const content = (item.content || item.summary || '').toLowerCase();
    const text = `${title} ${content}`;
    
    // 기본 스팸 체크
    if (title.length < 10 || /[\u0600-\u06FF\u0590-\u05FF]/.test(title)) {
      return false;
    }
    
    // 기술 키워드 체크
    const techKeywords = ['javascript', 'react', 'python', 'development', 'programming', 'coding'];
    const hasTechKeyword = techKeywords.some(keyword => text.includes(keyword));
    
    return hasTechKeyword;
  });
}

// 아이템을 Article로 변환
function convertItemToArticle(
  item: any, 
  index: number, 
  platformKey: string, 
  platformData: any
): Article {
  
  const authorName = item.creator || item.author || platformData.name;
  const author: Author = {
    id: `${platformKey}-author`,
    name: authorName,
    company: platformData.name,
    expertise: ['Tech'],
    articleCount: 0
  };

  const platform: Platform = {
    ...platformData,
    lastCrawled: new Date()
  };

  const title = item.title || '제목 없음';
  const rawContent = item['content:encoded'] || item.content || item.summary || '';
  const content = stripHtmlAndClean(rawContent);
  const originalTags = item.categories || ['Tech'];
  const category = categorizeArticle(title, content);
  const smartTags = generateSmartTags(title, content, originalTags);
  
  // YouTube 채널 확인
  const isYouTubeChannel = [
    'google_dev', 'line_dev', 'aws_korea', 'toast',
    'jocoding', 'codingapple', 'yalco', 'opentutorials'
  ].includes(platformKey);
  
  const videoId = isYouTubeChannel && item.link ? extractVideoId(item.link) : null;
  
  const baseArticle: Article = {
    id: `${platformKey}-${index}`,
    title: stripHtmlAndClean(title),
    content,
    excerpt: generateExcerpt(rawContent),
    author,
    platform,
    category: category as ArticleCategory,
    tags: smartTags,
    publishedAt: new Date(item.pubDate || Date.now()),
    viewCount: Math.floor(Math.random() * 5000) + 1000,
    likeCount: Math.floor(Math.random() * 200) + 50,
    commentCount: Math.floor(Math.random() * 50) + 5,
    readingTime: Math.floor(Math.random() * 15) + 5,
    trending: Math.random() > 0.7,
    featured: Math.random() > 0.8,
    url: item.link || platformData.baseUrl,
    contentType: isYouTubeChannel ? 'video' : 'article'
  };
  
  // YouTube 영상 추가 정보
  if (isYouTubeChannel && videoId) {
    return {
      ...baseArticle,
      videoUrl: item.link,
      videoDuration: estimateVideoDuration(),
      thumbnailUrl: getYoutubeThumbnail(videoId),
      watchCount: Math.floor(Math.random() * 50000) + 5000
    };
  }
  
  return baseArticle;
}

// 큐레이션 알고리즘 (간소화)
function curateArticles(articles: Article[]): Article[] {
  // 중복 제거 (URL 기준)
  const uniqueArticles = articles.filter((article, index, array) => 
    array.findIndex(a => a.url === article.url) === index
  );
  
  // 최신순 정렬
  return uniqueArticles
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, 500); // 최대 500개로 제한
}

// 메인 RSS 수집 함수 (최적화된 버전)
export async function collectFreshFeedsOptimized(): Promise<Article[]> {
  console.log('🚀 === 최적화된 RSS 수집 시작 ===');
  const startTime = Date.now();
  
  const activePlatforms = Object.entries(platforms).filter(([, platformData]) => platformData.isActive);
  console.log(`활성화된 플랫폼: ${activePlatforms.length}개`);
  
  // 병렬 처리 (배치 크기 조정)
  const batchSize = 8; // 더 작은 배치로 안정성 확보
  const allArticles: Article[] = [];
  
  for (let i = 0; i < activePlatforms.length; i += batchSize) {
    const batch = activePlatforms.slice(i, i + batchSize);
    const batchNum = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(activePlatforms.length / batchSize);
    
    console.log(`\n📦 배치 ${batchNum}/${totalBatches}: ${batch.length}개 플랫폼`);
    
    const batchPromises = batch.map(([platformKey, platformData]) => 
      collectPlatformFeed(platformKey, platformData, 12000) // 12초 타임아웃
    );
    
    const batchResults = await Promise.allSettled(batchPromises);
    
    let batchSuccess = 0;
    batchResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        allArticles.push(...result.value);
        if (result.value.length > 0) batchSuccess++;
      } else {
        const [platformKey] = batch[index];
        console.error(`❌ ${platformKey} 실패:`, result.reason);
      }
    });
    
    console.log(`배치 ${batchNum} 완료: ${batchSuccess}/${batch.length} 성공`);
    
    // 다음 배치 전 짧은 대기
    if (i + batchSize < activePlatforms.length) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  const rssCollectionTime = Date.now() - startTime;
  console.log(`📊 RSS 수집 완료: ${allArticles.length}개 아티클 (${Math.round(rssCollectionTime/1000)}초)`);
  
  // 큐레이션
  const curatedArticles = curateArticles(allArticles);
  
  // 캐시 저장
  await CacheManager.setCachedArticles(curatedArticles);
  
  const totalTime = Date.now() - startTime;
  console.log(`✅ 전체 프로세스 완료: ${curatedArticles.length}개 아티클 (총 ${Math.round(totalTime/1000)}초)`);
  console.log('=== 최적화된 RSS 수집 종료 ===\n');
  
  return curatedArticles;
}

// 기존 함수와의 호환성
export async function collectAllFeedsOptimized(): Promise<Article[]> {
  const cachedArticles = await CacheManager.getCachedArticles();
  if (cachedArticles) {
    return cachedArticles;
  }
  
  return await collectFreshFeedsOptimized();
}
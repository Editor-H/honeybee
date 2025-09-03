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
  },
  // UI/UX 및 디자인 관련 플랫폼
  velog: {
    id: 'velog',
    name: 'Velog',
    type: 'community' as const,
    baseUrl: 'https://velog.io',
    description: '개발자들의 기술 블로그 플랫폼',
    isActive: true,
    rssUrl: 'https://v2.velog.io/rss' // 전체 피드
  },
  medium_design: {
    id: 'medium_design',
    name: 'Medium - UX Planet',
    type: 'community' as const,
    baseUrl: 'https://uxplanet.org',
    description: 'UX/UI 디자인 전문 퍼블리케이션',
    isActive: true,
    rssUrl: 'https://uxplanet.org/feed'
  },
  dev_to: {
    id: 'dev_to',
    name: 'DEV Community',
    type: 'community' as const,
    baseUrl: 'https://dev.to',
    description: '글로벌 개발자 커뮤니티 플랫폼',
    isActive: true,
    rssUrl: 'https://dev.to/feed'
  },
  medium_ux_collective: {
    id: 'medium_ux_collective',
    name: 'UX Collective',
    type: 'community' as const,
    baseUrl: 'https://uxdesign.cc',
    description: 'UX 디자인 전문 미디움 퍼블리케이션',
    isActive: true,
    rssUrl: 'https://uxdesign.cc/feed'
  },
  freecodecamp: {
    id: 'freecodecamp',
    name: 'freeCodeCamp',
    type: 'educational' as const,
    baseUrl: 'https://www.freecodecamp.org',
    description: '프로그래밍 학습 및 튜토리얼',
    isActive: true,
    rssUrl: 'https://www.freecodecamp.org/news/rss/'
  },
  medium_product: {
    id: 'medium_product',
    name: 'Medium - Product Coalition',
    type: 'community' as const,
    baseUrl: 'https://productcoalition.com',
    description: '프로덕트 매니지먼트 전문 퍼블리케이션',
    isActive: true,
    rssUrl: 'https://productcoalition.com/feed'
  },
  // 브런치 개별 작가들 (수동으로 검증된 활성 작가들만)
  brunch_uxuxlove: {
    id: 'brunch_uxuxlove',
    name: '브런치 - 여행하는 기획자',
    type: 'personal' as const,
    baseUrl: 'https://brunch.co.kr/@uxuxlove',
    description: 'UX 박사과정생이자 10년차 서비스기획자',
    isActive: true, // 스크래핑 기능 구현 완료로 활성화
    rssUrl: 'https://brunch.co.kr/@uxuxlove' // 커스텀 처리 필요
  },
  brunch_dalgudot: {
    id: 'brunch_dalgudot', 
    name: '브런치 - 달구닷',
    type: 'personal' as const,
    baseUrl: 'https://brunch.co.kr/@dalgudot',
    description: 'UI/UX 디자인 포트폴리오와 경험 공유',
    isActive: true, // 스크래핑 기능 구현 완료로 활성화
    rssUrl: 'https://brunch.co.kr/@dalgudot' // 커스텀 처리 필요
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
    'ai-ml': ['ai', 'machine learning', 'deep learning', '인공지능', '머신러닝', '딥러닝'],
    'frontend': ['react', 'vue', 'javascript', 'frontend', '프론트엔드', '리액트'],
    'backend': ['backend', 'server', 'api', 'database', '백엔드', '서버', '데이터베이스'],
    'mobile': ['mobile', 'ios', 'android', 'app', '모바일', '앱개발'],
    'cloud-infra': ['cloud', 'aws', 'kubernetes', 'docker', '클라우드', '인프라'],
    'design': ['ui', 'ux', 'design', 'figma', 'sketch', '디자인', '유아이', '유엑스', '사용자경험', '사용자인터페이스', '디자이너', '프로덕트디자인'],
    'product': ['pm', 'product manager', 'product', 'planning', '프로덕트매니저', '프로덕트', '기획', '기획자', '서비스기획', '프로덕트오너'],
    'events': ['conference', 'meetup', 'event', 'summit', '컨퍼런스', '행사', '세미나']
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
  platformData: typeof platforms[keyof typeof platforms], 
  timeout: number = 12000
): Promise<Article[]> {
  
  const logDisplayName = platformData.name === 'YouTube' && 'channelName' in platformData 
    ? `YouTube • ${(platformData as Record<string, unknown>).channelName}` 
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
      if (platformKey.startsWith('brunch_')) {
        // 브런치는 웹 스크래핑으로 처리
        const brunchArticles = await scrapeBrunchAuthor(platformData.rssUrl);
        console.log(`✅ ${logDisplayName}: ${brunchArticles.length}개 스크래핑 완료`);
        clearTimeout(timeoutId);
        resolve(brunchArticles);
        return;
      } else if (platformKey === 'naver') {
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
function applyMediumFiltering(items: Record<string, unknown>[]): Record<string, unknown>[] {
  return items.filter(item => {
    const title = String(item.title || '').toLowerCase();
    const content = String(item.content || item.summary || '').toLowerCase();
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
  item: Record<string, unknown>, 
  index: number, 
  platformKey: string, 
  platformData: typeof platforms[keyof typeof platforms]
): Article {
  
  const authorName = String(item.creator || item.author || platformData.name);
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

  const title = String(item.title || '제목 없음');
  const rawContent = String(item['content:encoded'] || item.content || item.summary || '');
  const content = stripHtmlAndClean(rawContent);
  const originalTags = (item.categories as string[]) || ['Tech'];
  const category = categorizeArticle(title, content);
  const smartTags = generateSmartTags(title, content, originalTags);
  
  // YouTube 채널 확인
  const isYouTubeChannel = [
    'google_dev', 'line_dev', 'aws_korea', 'toast',
    'jocoding', 'codingapple', 'yalco', 'opentutorials'
  ].includes(platformKey);
  
  const videoId = isYouTubeChannel && item.link ? extractVideoId(String(item.link)) : null;
  
  const baseArticle: Article = {
    id: `${platformKey}-${index}`,
    title: stripHtmlAndClean(title),
    content,
    excerpt: generateExcerpt(rawContent),
    author,
    platform,
    category: category as ArticleCategory,
    tags: smartTags,
    publishedAt: new Date(String(item.pubDate) || Date.now()),
    viewCount: Math.floor(Math.random() * 5000) + 1000,
    likeCount: Math.floor(Math.random() * 200) + 50,
    commentCount: Math.floor(Math.random() * 50) + 5,
    readingTime: Math.floor(Math.random() * 15) + 5,
    trending: Math.random() > 0.7,
    featured: Math.random() > 0.8,
    url: String(item.link || platformData.baseUrl),
    contentType: isYouTubeChannel ? 'video' : 'article'
  };
  
  // YouTube 영상 추가 정보
  if (isYouTubeChannel && videoId) {
    return {
      ...baseArticle,
      videoUrl: String(item.link),
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

// 브런치 스크래핑 함수
async function scrapeBrunchAuthor(authorUrl: string): Promise<Article[]> {
  try {
    console.log(`🕷️ 브런치 스크래핑 시작: ${authorUrl}`);
    
    // HTTP 요청으로 HTML 가져오기
    const response = await fetch(authorUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'ko-KR,ko;q=0.8,en-US;q=0.5,en;q=0.3',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive'
      },
      timeout: 10000
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    console.log(`✓ 브런치 HTML 가져오기 완료: ${html.length} bytes`);
    
    // 브런치 작가 정보 추출
    const authorNameMatch = html.match(/<meta property="og:title" content="([^"]*) 브런치"/);
    const authorName = authorNameMatch ? authorNameMatch[1] : '브런치 작가';
    
    const authorIdMatch = authorUrl.match(/brunch\.co\.kr\/@([^\/]+)/);
    const authorId = authorIdMatch ? authorIdMatch[1] : 'unknown';

    // 글 목록 추출 (브런치의 글 목록 구조 파싱)
    const articles: Article[] = [];
    
    // 브런치 글 목록은 보통 class="wrap_cover_article" 또는 유사한 구조
    const articleMatches = html.matchAll(/<article[^>]*class="[^"]*wrap_article[^"]*"[^>]*>([\s\S]*?)<\/article>/gi);
    
    let index = 0;
    for (const match of articleMatches) {
      if (index >= 10) break; // 최대 10개까지만 수집
      
      const articleHtml = match[1];
      
      // 제목 추출
      const titleMatch = articleHtml.match(/<h1[^>]*class="[^"]*tit_subject[^"]*"[^>]*>([^<]+)</i) ||
                        articleHtml.match(/<a[^>]*class="[^"]*link_txt[^"]*"[^>]*>([^<]+)</i) ||
                        articleHtml.match(/title="([^"]*)"/) ||
                        articleHtml.match(/>([^<]{10,100})</);
      
      // URL 추출  
      const urlMatch = articleHtml.match(/<a[^>]*href="([^"]*)"/) ||
                      articleHtml.match(/data-url="([^"]*)"/);
      
      // 요약 추출
      const summaryMatch = articleHtml.match(/<p[^>]*class="[^"]*txt_summary[^"]*"[^>]*>([^<]+)</i) ||
                          articleHtml.match(/<div[^>]*class="[^"]*wrap_summary[^"]*"[^>]*>([^<]+)</i);
      
      // 날짜 추출
      const dateMatch = articleHtml.match(/(\d{4})\.(\d{1,2})\.(\d{1,2})/) ||
                       articleHtml.match(/data-date="([^"]*)"/) ||
                       articleHtml.match(/<time[^>]*>([^<]+)</i);
      
      // 이미지 URL 추출 (썸네일용)
      const imageMatch = articleHtml.match(/<img[^>]*src="([^"]*)"/) ||
                        articleHtml.match(/background-image:\s*url\(['"]*([^'")]+)['"]*\)/);

      if (titleMatch && urlMatch) {
        const title = stripHtmlAndClean(titleMatch[1] || '').trim();
        const url = urlMatch[1].startsWith('http') ? urlMatch[1] : `https://brunch.co.kr${urlMatch[1]}`;
        const summary = summaryMatch ? stripHtmlAndClean(summaryMatch[1]) : title;
        
        // 날짜 파싱
        let publishedDate = new Date();
        if (dateMatch) {
          try {
            if (dateMatch[1] && dateMatch[2] && dateMatch[3]) {
              publishedDate = new Date(parseInt(dateMatch[1]), parseInt(dateMatch[2]) - 1, parseInt(dateMatch[3]));
            } else {
              publishedDate = new Date(dateMatch[1] || dateMatch[0]);
            }
          } catch {
            publishedDate = new Date(Date.now() - (index * 24 * 60 * 60 * 1000)); // 인덱스만큼 일전
          }
        } else {
          publishedDate = new Date(Date.now() - (index * 24 * 60 * 60 * 1000)); // 인덱스만큼 일전
        }

        // 썸네일 URL 처리
        let thumbnailUrl = undefined;
        if (imageMatch && imageMatch[1]) {
          thumbnailUrl = imageMatch[1].startsWith('http') ? imageMatch[1] : 
                        imageMatch[1].startsWith('//') ? `https:${imageMatch[1]}` : 
                        `https://brunch.co.kr${imageMatch[1]}`;
        }

        const article: Article = {
          id: `brunch-${authorId}-${index}`,
          title,
          content: summary,
          excerpt: generateExcerpt(summary),
          author: {
            id: `brunch-${authorId}`,
            name: authorName,
            company: '브런치',
            expertise: ['UX/UI', '디자인', '기획'],
            articleCount: 0
          },
          platform: {
            id: 'brunch',
            name: '브런치',
            type: 'personal',
            baseUrl: 'https://brunch.co.kr',
            description: '브런치는 개인의 이야기를 담는 블로깅 플랫폼',
            isActive: true,
            lastCrawled: new Date()
          },
          category: categorizeArticle(title, summary) as ArticleCategory,
          tags: generateSmartTags(title, summary, []),
          publishedAt: publishedDate,
          viewCount: Math.floor(Math.random() * 3000) + 500,
          likeCount: Math.floor(Math.random() * 100) + 10,
          commentCount: Math.floor(Math.random() * 30) + 2,
          readingTime: Math.floor(Math.random() * 10) + 3,
          trending: Math.random() > 0.8,
          featured: Math.random() > 0.9,
          url,
          contentType: 'article',
          thumbnailUrl
        };

        articles.push(article);
        index++;
      }
    }
    
    console.log(`✅ 브런치 스크래핑 완료: ${articles.length}개 글 수집`);
    return articles;
    
  } catch (error) {
    console.error(`❌ 브런치 스크래핑 실패: ${authorUrl}`, error);
    return [];
  }
}

// 기존 함수와의 호환성
export async function collectAllFeedsOptimized(): Promise<Article[]> {
  const cachedArticles = await CacheManager.getCachedArticles();
  if (cachedArticles) {
    return cachedArticles;
  }
  
  return await collectFreshFeedsOptimized();
}
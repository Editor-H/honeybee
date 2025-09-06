import Parser from 'rss-parser';
import { Article, Author, Platform, ArticleCategory } from '@/types/article';
import { CacheManager } from './cache-manager';
import { collectScrapedArticles } from './web-scraper';
import { calculateQualityScore, filterHighQualityArticles, suggestTags } from './content-quality-scorer';
import { InflearnCrawler } from './crawlers/inflearn-crawler';
import { ColosoCrawler } from './crawlers/coloso-crawler';
import { Class101Crawler } from './crawlers/class101-crawler';
import { convertCourseDataToArticle } from './course-crawler';
import YouTubeCollector from './youtube-collector';
import { EOCollector } from './eo-collector';
import { GPTERSCollector } from './gpters-collector';

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
  line: {
    id: 'line',
    name: 'LINE Engineering',
    type: 'corporate' as const,
    baseUrl: 'https://engineering.linecorp.com/ko',
    description: 'LINE의 기술과 개발 문화',
    isActive: true,
    rssUrl: 'https://engineering.linecorp.com/ko/rss.xml'
  },
  banksalad: {
    id: 'banksalad',
    name: '뱅크샐러드 기술블로그',
    type: 'corporate' as const,
    baseUrl: 'https://blog.banksalad.com',
    description: '뱅크샐러드 팀의 기술 이야기',
    isActive: true,
    rssUrl: 'https://blog.banksalad.com/rss.xml'
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
    isActive: true, // RSS 방식으로 임시 복구
    rssUrl: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCQNE2JmbasNYbjGAcuBiRRg'
  },
  opentutorials: {
    id: 'opentutorials',
    name: 'YouTube',
    type: 'educational' as const,
    baseUrl: 'https://www.youtube.com/@opentutorials',
    channelName: '생활코딩',
    description: '프로그래밍 교육의 대표 채널',
    isActive: true, // RSS 방식으로 임시 복구
    rssUrl: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCvc8kv-i5fvFTJBFAk6n1SA'
  },
  nomad_coders: {
    id: 'nomad_coders',
    name: 'YouTube',
    type: 'educational' as const,
    baseUrl: 'https://www.youtube.com/@nomadcoders',
    channelName: '노마드 코더',
    description: '실무 중심 코딩 교육',
    isActive: true,
    rssUrl: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCUpJs89fSBXNolQGOYKn0YQ'
  },
  coding_with_john: {
    id: 'coding_with_john',
    name: 'YouTube',
    type: 'educational' as const,
    baseUrl: 'https://www.youtube.com/@CodingwithJohn',
    channelName: 'Coding with John',
    description: 'Java 프로그래밍 튜토리얼',
    isActive: true,
    rssUrl: 'https://www.youtube.com/feeds/videos.xml?channel_id=UC6V3E7ZYpfwZLMJoJgCqGGA'
  },
  programming_with_mosh: {
    id: 'programming_with_mosh',
    name: 'YouTube',
    type: 'educational' as const,
    baseUrl: 'https://www.youtube.com/@programmingwithmosh',
    channelName: 'Programming with Mosh',
    description: '프로그래밍 기초부터 고급까지',
    isActive: true,
    rssUrl: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCWv7vMbMWH4-V0ZXdmDpPBA'
  },
  // 추가 고품질 기술 플랫폼들
  coupang: {
    id: 'coupang',
    name: '쿠팡 기술블로그',
    type: 'corporate' as const,
    baseUrl: 'https://medium.com/coupang-engineering',
    description: '쿠팡의 대규모 시스템과 기술 경험',
    isActive: true,
    rssUrl: 'https://medium.com/coupang-engineering/feed'
  },
  socar: {
    id: 'socar',
    name: '쏘카 기술블로그',
    type: 'corporate' as const,
    baseUrl: 'https://tech.socarcorp.kr',
    description: '쏘카의 기술과 개발 경험',
    isActive: true,
    rssUrl: 'https://tech.socarcorp.kr/feed'
  },
  eo: {
    id: 'eo',
    name: 'EO 매거진',
    type: 'media' as const,
    baseUrl: 'https://eopla.net',
    description: '고품질 기술 매거진 및 트렌드',
    isActive: true,
    rssUrl: null // 크롤러 사용
  },
  gpters: {
    id: 'gpters',
    name: 'GPTERS 뉴스레터',
    type: 'community' as const,
    baseUrl: 'https://www.gpters.org',
    description: 'AI와 GPT 관련 뉴스레터',
    isActive: true,
    rssUrl: null // 크롤러 사용
  },
  medium_design: {
    id: 'medium_design',
    name: 'Medium - UX Planet',
    type: 'community' as const,
    baseUrl: 'https://uxplanet.org',
    description: 'UX/UI 디자인 전문 퍼블리케이션',
    isActive: false, // 영문 비중 줄이기 위해 비활성화
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
    isActive: false, // 영문 비중 줄이기 위해 비활성화
    rssUrl: 'https://productcoalition.com/feed'
  },
  // 브런치 개별 작가들 (브런치는 JS 동적로딩으로 스크래핑 어려워 임시 비활성화)
  brunch_uxuxlove: {
    id: 'brunch_uxuxlove',
    name: '브런치 - 여행하는 기획자',
    type: 'personal' as const,
    baseUrl: 'https://brunch.co.kr/@uxuxlove',
    description: 'UX 박사과정생이자 10년차 서비스기획자',
    isActive: false, // 브런치 동적 로딩으로 인해 임시 비활성화
    rssUrl: 'https://brunch.co.kr/@uxuxlove' // 커스텀 처리 필요
  },
  brunch_dalgudot: {
    id: 'brunch_dalgudot', 
    name: '브런치 - 달구닷',
    type: 'personal' as const,
    baseUrl: 'https://brunch.co.kr/@dalgudot',
    description: 'UI/UX 디자인 포트폴리오와 경험 공유',
    isActive: false, // 브런치 동적 로딩으로 인해 임시 비활성화
    rssUrl: 'https://brunch.co.kr/@dalgudot' // 커스텀 처리 필요
  },
  // 대안: 미디엄 개인 작가들
  medium_ux_writer: {
    id: 'medium_ux_writer',
    name: 'Medium - UX 실무자들',
    type: 'personal' as const,
    baseUrl: 'https://medium.com',
    description: 'Medium의 한국 UX/UI 디자이너 및 기획자들',
    isActive: true,
    rssUrl: 'https://medium.com/feed/tag/ux-design'
  },
  tistory_design: {
    id: 'tistory_design',
    name: '티스토리 - UX/UI',
    type: 'community' as const,
    baseUrl: 'https://www.tistory.com',
    description: '티스토리의 UX/UI 관련 블로그들',
    isActive: true,
    rssUrl: 'https://www.tistory.com/category/UX%2FUI/rss'
  },
  // 강의 플랫폼들 (현재는 mock 데이터, 추후 실제 API 연동)
  inflearn: {
    id: 'inflearn',
    name: '인프런',
    type: 'educational' as const,
    baseUrl: 'https://www.inflearn.com',
    description: '실무 중심의 프로그래밍 강의 플랫폼',
    isActive: true, // 크롤러로 활성화
    rssUrl: null // 크롤러 사용
  },
  class101: {
    id: 'class101',
    name: '클래스101',
    type: 'educational' as const,
    baseUrl: 'https://class101.net',
    description: '창작과 취미를 위한 온라인 클래스',
    isActive: true, // 크롤러로 활성화
    rssUrl: null // 크롤러 사용
  },
  coloso: {
    id: 'coloso',
    name: '콜로소',
    type: 'educational' as const,
    baseUrl: 'https://coloso.co.kr',
    description: '실무진이 가르치는 창작 강의',
    isActive: true, // 크롤러로 활성화
    rssUrl: null // 크롤러 사용
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
    'events': ['conference', 'meetup', 'event', 'summit', '컨퍼런스', '행사', '세미나'],
    'lecture': ['강의', '강좌', '수업', '교육', '코스', '클래스', '튜토리얼', 'course', 'lecture', 'class', 'tutorial', '온라인강의']
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
      
      // 크롤러 기반 플랫폼 처리
      if (platformKey === 'eo') {
        const eoCollector = new EOCollector();
        const eoArticles = await eoCollector.collectArticles(getMaxArticlesForPlatform(platformKey));
        console.log(`✅ ${logDisplayName}: ${eoArticles.length}개 크롤링 완료`);
        clearTimeout(timeoutId);
        resolve(eoArticles);
        return;
      } else if (platformKey === 'gpters') {
        const gptersCollector = new GPTERSCollector();
        const gptersArticles = await gptersCollector.collectArticles(getMaxArticlesForPlatform(platformKey));
        console.log(`✅ ${logDisplayName}: ${gptersArticles.length}개 크롤링 완료`);
        clearTimeout(timeoutId);
        resolve(gptersArticles);
        return;
      } else if (platformKey === 'inflearn') {
        const inflearnCrawler = new InflearnCrawler();
        await inflearnCrawler.initBrowser();
        const inflearnCourses = await inflearnCrawler.crawlCourses();
        await inflearnCrawler.closeBrowser();
        const inflearnArticles = inflearnCourses.map(convertCourseDataToArticle);
        console.log(`✅ ${logDisplayName}: ${inflearnArticles.length}개 크롤링 완료`);
        clearTimeout(timeoutId);
        resolve(inflearnArticles);
        return;
      } else if (platformKey === 'class101') {
        const class101Crawler = new Class101Crawler();
        await class101Crawler.initBrowser();
        const class101Courses = await class101Crawler.crawlCourses();
        await class101Crawler.closeBrowser();
        const class101Articles = class101Courses.map(convertCourseDataToArticle);
        console.log(`✅ ${logDisplayName}: ${class101Articles.length}개 크롤링 완료`);
        clearTimeout(timeoutId);
        resolve(class101Articles);
        return;
      } else if (platformKey === 'coloso') {
        const colosoCrawler = new ColosoCrawler();
        await colosoCrawler.initBrowser();
        const colosoCourses = await colosoCrawler.crawlCourses();
        await colosoCrawler.closeBrowser();
        const colosoArticles = colosoCourses.map(convertCourseDataToArticle);
        console.log(`✅ ${logDisplayName}: ${colosoArticles.length}개 크롤링 완료`);
        clearTimeout(timeoutId);
        resolve(colosoArticles);
        return;
      }
      
      // RSS 파싱 설정
      let feed;
      if (platformKey.startsWith('brunch_')) {
        // 브런치는 웹 스크래핑으로 처리
        const brunchArticles = await scrapeBrunchAuthor(platformData.rssUrl || '');
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
        feed = await customParser.parseURL(platformData.rssUrl || '');
      } else {
        const customParser = new Parser({
          requestOptions: {
            timeout: timeout - 2000
          }
        });
        feed = await customParser.parseURL(platformData.rssUrl || '');
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
      
      // 아웃스탠딩 IT 필터링
      if (platformKey === 'outstanding') {
        itemsToProcess = applyOutstandingTechFiltering(itemsToProcess);
      }
      
      // 모든 플랫폼에 언어 필터링 적용
      itemsToProcess = itemsToProcess.filter(item => {
        const title = String(item.title || '');
        const content = String(item.content || item.summary || '');
        return isKoreanOrEnglishContent(title, content);
      });
      
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
    // 한국어 플랫폼들 - article 타입 (총 약 96개)
    toss: 10, daangn: 10, kakao: 10, naver: 10, woowahan: 10,
    yozm: 8, outstanding: 8, // 기존 플랫폼
    coupang: 8, socar: 8, // 새로운 고품질 기업 블로그 (RSS)
    eo: 8, gpters: 6, // 새로운 고품질 플랫폼 (크롤러)
    line: 8, banksalad: 8, // 기존 한국어 플랫폼들
    
    // 강의 플랫폼들 (한국어) - 크롤러 기반
    inflearn: 8, class101: 8, coloso: 8, // 온라인 강의 플랫폼
    
    // 영어 플랫폼들 (10% 비중으로 대폭 축소) - 총 약 6개
    medium: 1,           // 유지
    hacker_news: 1,      // 2 → 1  
    dev_to: 1,           // 2 → 1
    freecodecamp: 1,     // 유지
    ux_planet: 0,        // 1 → 0 (비활성화)
    ux_collective: 1,    // 2 → 1  
    product_coalition: 0, // 1 → 0 (비활성화)
    medium_ux: 1,        // 2 → 1
    
    // YouTube 채널들 (비디오/강의 콘텐츠 대폭 확충)
    jocoding: 5, opentutorials: 5, nomad_coders: 5, 
    coding_with_john: 4, programming_with_mosh: 4, // 총 23개 비디오/강의
    
    // 기타
    google_dev: 0, line_dev: 0, aws_korea: 0 // 비활성화
  };
  return limits[platformKey] || 1; // 기본값을 1로 대폭 감소
}

// 언어 필터링 함수
function isKoreanOrEnglishContent(title: string, content: string): boolean {
  const text = `${title} ${content}`.toLowerCase();
  
  // 한글 문자 정규식 (가-힣)
  const koreanRegex = /[가-힣]/g;
  // 영어 문자 정규식 (a-z)
  const englishRegex = /[a-z]/g;
  // 기타 언어 스크립트들 (중국어, 일본어, 아랍어, 러시아어 등)
  const otherLanguageRegex = /[\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff\u0600-\u06ff\u0400-\u04ff]/g;
  
  const koreanMatches = (text.match(koreanRegex) || []).length;
  const englishMatches = (text.match(englishRegex) || []).length;
  const otherMatches = (text.match(otherLanguageRegex) || []).length;
  
  const totalChars = koreanMatches + englishMatches + otherMatches;
  
  // 한글이나 영어가 80% 이상이면 허용
  if (totalChars > 0) {
    const koreanEnglishRatio = (koreanMatches + englishMatches) / totalChars;
    return koreanEnglishRatio >= 0.8;
  }
  
  // 문자가 없으면 (숫자, 기호만 있으면) 허용
  return true;
}

// 미디엄 필터링 (간소화)
function applyMediumFiltering(items: Record<string, unknown>[]): Record<string, unknown>[] {
  return items.filter(item => {
    const title = String(item.title || '').toLowerCase();
    const content = String(item.content || item.summary || '').toLowerCase();
    const text = `${title} ${content}`;
    
    // 언어 필터링 추가
    if (!isKoreanOrEnglishContent(title, content)) {
      return false;
    }
    
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

// 아웃스탠딩 IT/테크 필터링
function applyOutstandingTechFiltering(items: Record<string, unknown>[]): Record<string, unknown>[] {
  return items.filter(item => {
    const title = String(item.title || '');
    const content = String(item.content || item.summary || '');
    const text = `${title} ${content}`.toLowerCase();
    
    // IT/테크 관련 필수 키워드
    const itKeywords = [
      // 개발 관련
      '개발', '프로그래밍', '코딩', 'programming', 'coding', 'developer',
      'javascript', 'typescript', 'python', 'java', 'react', 'vue', 'node',
      'frontend', 'backend', '프론트엔드', '백엔드', 'fullstack', 'api',
      '웹개발', '앱개발', 'web development', 'app development',
      
      // 스타트업/테크 비즈니스
      '스타트업', 'startup', '테크', 'tech', '테크기업', '기술기업',
      'IT기업', 'IT회사', '유니콘', '테크트렌드', '디지털전환',
      
      // AI/데이터
      'AI', '인공지능', 'artificial intelligence', '머신러닝', 'machine learning',
      '데이터', 'data', '알고리즘', 'algorithm', '자동화', 'automation',
      
      // 디지털/온라인
      '디지털', 'digital', '플랫폼', 'platform', '서비스', '앱', 'app',
      '소프트웨어', 'software', '클라우드', 'cloud', 'SaaS',
      
      // 기술 트렌드
      '블록체인', 'blockchain', '메타버스', 'metaverse', 'VR', 'AR',
      '핀테크', 'fintech', 'IoT', '5G', '로봇', 'robot'
    ];
    
    // 제외할 키워드 (비즈니스 일반, 마케팅 등)
    const excludeKeywords = [
      '부동산', '투자', '주식', '경제', '정치', '스포츠', '연예',
      '패션', '뷰티', '건강', '요리', '여행', '문화', '예술',
      'real estate', 'investment', 'stock', 'politics', 'sports',
      'fashion', 'beauty', 'health', 'cooking', 'travel', 'art',
      '카드깡', '대출', '현금화', '광고', '마케팅만', '홍보'
    ];
    
    // 제목이 너무 짧거나 의미불명한 경우 제외
    if (title.length < 5 || /^\d+$/.test(title) || /^[a-zA-Z]{1,3}$/.test(title)) {
      return false;
    }
    
    // 제외 키워드가 있으면 필터링
    if (excludeKeywords.some(keyword => text.includes(keyword.toLowerCase()))) {
      return false;
    }
    
    // IT/테크 키워드가 있어야 통과
    const hasITKeyword = itKeywords.some(keyword => 
      text.includes(keyword.toLowerCase())
    );
    
    return hasITKeyword;
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
    rssUrl: platformData.rssUrl || undefined,
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
  
  // 썸네일 이미지 추출
  function extractThumbnail(item: Record<string, unknown>, rawContent: string): string | undefined {
    // 1. RSS 표준 이미지 필드들 확인
    if (item.enclosure && typeof item.enclosure === 'object') {
      const enclosure = item.enclosure as { url?: string; type?: string };
      if (enclosure.url && enclosure.type?.startsWith('image/')) {
        return enclosure.url;
      }
    }
    
    // 2. Media RSS 필드 확인
    if (item['media:thumbnail'] && typeof item['media:thumbnail'] === 'object') {
      const mediaThumbnail = item['media:thumbnail'] as { url?: string };
      if (mediaThumbnail.url) return mediaThumbnail.url;
    }
    
    // 3. iTunes 이미지 필드
    if (item.itunes && typeof item.itunes === 'object') {
      const itunes = item.itunes as { image?: string };
      if (itunes.image) return itunes.image;
    }
    
    // 4. 콘텐츠에서 첫 번째 이미지 추출
    const imgMatch = rawContent.match(/<img[^>]*src="([^"]+)"/i);
    if (imgMatch && imgMatch[1]) {
      const imgUrl = imgMatch[1];
      // 상대 경로면 절대 경로로 변환
      if (imgUrl.startsWith('/')) {
        const baseUrl = new URL(platformData.baseUrl);
        return `${baseUrl.protocol}//${baseUrl.host}${imgUrl}`;
      }
      if (imgUrl.startsWith('http')) {
        return imgUrl;
      }
    }
    
    return undefined;
  }
  
  const thumbnailUrl = extractThumbnail(item, rawContent);
  
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
    contentType: isYouTubeChannel ? 'video' : 'article',
    thumbnailUrl
  };
  
  // YouTube 영상 추가 정보
  if (isYouTubeChannel && videoId) {
    // 교육성 채널의 비디오를 강의로 분류
    const educationalChannels = ['jocoding', 'opentutorials'];
    const isEducational = educationalChannels.includes(platformKey);
    
    return {
      ...baseArticle,
      contentType: isEducational ? 'lecture' as const : 'video' as const,
      videoUrl: String(item.link),
      videoDuration: estimateVideoDuration(),
      thumbnailUrl: getYoutubeThumbnail(videoId),
      watchCount: Math.floor(Math.random() * 50000) + 5000,
      // 강의인 경우 추가 메타데이터
      ...(isEducational && {
        coursePrice: 0, // 무료
        courseDuration: Math.floor(Math.random() * 300) + 60, // 1-6시간
        courseLevel: (['beginner', 'intermediate'] as const)[Math.floor(Math.random() * 2)],
        courseInstructor: 'channelName' in platformData ? platformData.channelName || platform.name : platform.name,
        courseStudentCount: Math.floor(Math.random() * 50000) + 1000,
        courseRating: 4.0 + Math.random() * 1.0 // 4.0-5.0
      })
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
  
  // 콘텐츠 타입별로 분류
  const articlesByType = {
    article: uniqueArticles.filter(a => a.contentType === 'article'),
    video: uniqueArticles.filter(a => a.contentType === 'video'), 
    lecture: uniqueArticles.filter(a => a.contentType === 'lecture')
  };
  
  console.log(`📊 콘텐츠 타입별 수집량: article ${articlesByType.article.length}개, video ${articlesByType.video.length}개, lecture ${articlesByType.lecture.length}개`);
  
  // 목표 비중 설정 (총 100개 기준으로 조정)
  const targetCounts = {
    article: 65,  // 65% (텍스트 기반)
    video: 25,    // 25% (유튜브 영상)
    lecture: 10   // 10% (강의 콘텐츠)
  };
  
  // 콘텐츠 타입별로 최신순 정렬 후 목표 수량만큼 선택
  const curatedByType = {
    article: articlesByType.article
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, targetCounts.article),
    video: articlesByType.video
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, targetCounts.video),
    lecture: articlesByType.lecture
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, targetCounts.lecture)
  };
  
  // 최종 결합 및 정렬
  const finalArticles = [
    ...curatedByType.article,
    ...curatedByType.video, 
    ...curatedByType.lecture
  ].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  
  console.log(`📊 최종 큐레이션: article ${curatedByType.article.length}개, video ${curatedByType.video.length}개, lecture ${curatedByType.lecture.length}개 = 총 ${finalArticles.length}개`);
  
  return finalArticles.slice(0, 100); // 최대 100개로 제한
}

// 강의 크롤링 함수
async function collectCourseData(): Promise<Article[]> {
  console.log('🎓 강의 크롤링 시작');
  const crawlers = [
    new InflearnCrawler(),
    new ColosoCrawler(),
    new Class101Crawler()
  ];

  const allCourses: Article[] = [];

  for (const crawler of crawlers) {
    try {
      console.log(`📚 ${crawler['siteName']} 크롤링 시작...`);
      const courses = await crawler.crawlCourses(20); // 각 플랫폼에서 20개씩
      
      // CourseData를 Article로 변환
      const articles = courses.map((course, index) => crawler.convertToArticle(course, index));
      
      allCourses.push(...articles);
      console.log(`✅ ${crawler['siteName']}: ${articles.length}개 강의 수집 완료`);
      
      // 리소스 정리
      await crawler.closeBrowser();
    } catch (error) {
      console.error(`❌ ${crawler['siteName']} 크롤링 실패:`, error);
    }
  }

  console.log(`📊 강의 크롤링 완료: ${allCourses.length}개 강의`);
  return allCourses;
}

// 메인 RSS 수집 함수 (최적화된 버전)
export async function collectFreshFeedsOptimized(): Promise<Article[]> {
  console.log('🚀 === 최적화된 RSS 및 강의 수집 시작 ===');
  const startTime = Date.now();
  
  const activePlatforms = Object.entries(platforms).filter(([, platformData]) => platformData.isActive);
  console.log(`활성화된 플랫폼: ${activePlatforms.length}개`);
  
  // RSS 수집, 강의 크롤링, YouTube 수집을 병렬로 실행
  const [rssArticles, courseArticles, youtubeArticles] = await Promise.all([
    collectRSSFeeds(activePlatforms),
    collectCourseData(),
    collectYouTubeData()
  ]);
  
  console.log(`📊 수집 완료: RSS ${rssArticles.length}개, 강의 ${courseArticles.length}개, YouTube ${youtubeArticles.length}개`);
  
  // 모든 아티클 합치기
  const allArticles = [...rssArticles, ...courseArticles, ...youtubeArticles];
  
  // 큐레이션
  const curatedArticles = curateArticles(allArticles);
  
  // 캐시 저장
  await CacheManager.setCachedArticles(curatedArticles);
  
  const totalTime = Date.now() - startTime;
  console.log(`✅ 전체 프로세스 완료: ${curatedArticles.length}개 아티클 (총 ${Math.round(totalTime/1000)}초)`);
  console.log('=== 최적화된 RSS 및 강의 수집 종료 ===\n');
  
  return curatedArticles;
}

// RSS 수집 전용 함수 (기존 로직 분리)
async function collectRSSFeeds(activePlatforms: [string, typeof platforms[keyof typeof platforms]][]): Promise<Article[]> {
  // 병렬 처리 (배치 크기 조정)
  const batchSize = 8; // 더 작은 배치로 안정성 확보
  const allArticles: Article[] = [];
  
  for (let i = 0; i < activePlatforms.length; i += batchSize) {
    const batch = activePlatforms.slice(i, i + batchSize);
    const batchNum = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(activePlatforms.length / batchSize);
    
    console.log(`\n📦 RSS 배치 ${batchNum}/${totalBatches}: ${batch.length}개 플랫폼`);
    
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
    
    console.log(`RSS 배치 ${batchNum} 완료: ${batchSuccess}/${batch.length} 성공`);
    
    // 다음 배치 전 짧은 대기
    if (i + batchSize < activePlatforms.length) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  console.log(`📊 RSS 수집 완료: ${allArticles.length}개 아티클`);
  return allArticles;
}

// 브런치 스크래핑 함수
async function scrapeBrunchAuthor(authorUrl: string): Promise<Article[]> {
  try {
    console.log(`🕷️ 브런치 스크래핑 시작: ${authorUrl}`);
    
    // HTTP 요청으로 HTML 가져오기 (AbortController로 타임아웃 처리)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const response = await fetch(authorUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'ko-KR,ko;q=0.8,en-US;q=0.5,en;q=0.3',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive'
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

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
        let thumbnailUrl: string | undefined = undefined;
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

// YouTube 데이터 수집
async function collectYouTubeData(): Promise<Article[]> {
  console.log('🎥 YouTube IT 카테고리 수집 시작...');
  
  try {
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      console.log('⚠️ YouTube API 키가 설정되지 않음. YouTube 수집 건너뜀');
      return [];
    }

    const youtubeCollector = new YouTubeCollector(apiKey);
    const articles = await youtubeCollector.collectTrendingITVideos(50); // 최대 50개
    
    console.log(`✅ YouTube 수집 완료: ${articles.length}개 영상`);
    return articles;
    
  } catch (error) {
    console.error('❌ YouTube 수집 실패:', error);
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
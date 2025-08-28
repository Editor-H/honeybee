import Parser from 'rss-parser';
import { Article, Author, Platform } from '@/types/article';
import { CacheManager } from './cache-manager';

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
  google_dev: {
    id: 'google_dev',
    name: 'Google for Developers',
    type: 'corporate' as const,
    baseUrl: 'https://www.youtube.com/c/GoogleforDevelopers',
    description: '구글 개발자 공식 채널',
    isActive: true,
    rssUrl: 'https://www.youtube.com/feeds/videos.xml?channel_id=UC_x5XG1OV2P6uZZ5FSM9Ttw'
  },
  line_dev: {
    id: 'line_dev',
    name: 'LINE Developers',
    type: 'corporate' as const,
    baseUrl: 'https://www.youtube.com/c/LINEDevelopers',
    description: 'LINE 개발자 채널',
    isActive: true,
    rssUrl: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCBJZr0oJLpb6nnvT4wd6Q6g'
  },
  aws_korea: {
    id: 'aws_korea',
    name: 'AWS Korea',
    type: 'corporate' as const,
    baseUrl: 'https://www.youtube.com/c/AWSKorea',
    description: 'AWS Korea 공식 채널',
    isActive: true,
    rssUrl: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCM9NbZtGTgXgpR2ksugR8nQ'
  },
  toast: {
    id: 'toast',
    name: '토스트',
    type: 'corporate' as const,
    baseUrl: 'https://www.youtube.com/c/tosstech',
    description: '토스 개발 관련 영상',
    isActive: true,
    rssUrl: 'https://www.youtube.com/feeds/videos.xml?channel_id=UC0Q4zA_2bNB4GCQAuwJCMHw'
  },
  line_blog: {
    id: 'line_blog',
    name: 'LINE 기술블로그',
    type: 'corporate' as const,
    baseUrl: 'https://techblog.lycorp.co.jp/ko',
    description: 'LINE의 기술 개발 이야기',
    isActive: true,
    rssUrl: 'https://techblog.lycorp.co.jp/ko/feed/index.xml'
  },
  coupang: {
    id: 'coupang',
    name: '쿠팡 기술블로그',
    type: 'corporate' as const,
    baseUrl: 'https://medium.com/coupang-engineering',
    description: '쿠팡 엔지니어링팀의 기술 이야기',
    isActive: true,
    rssUrl: 'https://medium.com/feed/coupang-engineering'
  },
  banksalad: {
    id: 'banksalad',
    name: '뱅크샐러드',
    type: 'corporate' as const,
    baseUrl: 'https://blog.banksalad.com',
    description: '뱅크샐러드 기술 블로그',
    isActive: true,
    rssUrl: 'https://blog.banksalad.com/rss.xml'
  },
  spoqa: {
    id: 'spoqa',
    name: '스포카',
    type: 'corporate' as const,
    baseUrl: 'https://spoqa.github.io',
    description: '스포카 기술 블로그',
    isActive: true,
    rssUrl: 'https://spoqa.github.io/rss'
  }
};

// HTML 태그 제거 및 텍스트 정제 함수
function stripHtmlAndClean(html: string): string {
  if (!html) return '';
  
  return html
    // 스크립트와 스타일 태그 완전 제거
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    // HTML 태그 제거
    .replace(/<[^>]*>/g, '')
    // HTML 엔티티 디코드 (더 확장)
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
    .replace(/&#\d+;/g, '') // 기타 숫자 엔티티 제거
    // 특수문자 정리
    .replace(/\u00a0/g, ' ') // non-breaking space
    .replace(/[\u200b-\u200d\ufeff]/g, '') // zero-width characters
    // 연속된 공백과 개행 정리
    .replace(/\s+/g, ' ')
    .replace(/\n\s*\n/g, ' ')
    // 앞뒤 공백 제거
    .trim();
}

// excerpt 생성 함수
function generateExcerpt(content: string, maxLength: number = 200): string {
  const cleanText = stripHtmlAndClean(content);
  if (!cleanText) return '';
  if (cleanText.length <= maxLength) return cleanText;
  
  // 문장 경계에서 자르기 (한국어 및 영어 문장부호 고려)
  const truncated = cleanText.substring(0, maxLength);
  const lastSentenceEnd = Math.max(
    truncated.lastIndexOf('.'),
    truncated.lastIndexOf('!'),
    truncated.lastIndexOf('?'),
    truncated.lastIndexOf('。'), // 한국어 문장 부호
    truncated.lastIndexOf('?'), // 한국어 물음표
    truncated.lastIndexOf('!') // 한국어 느낌표
  );
  
  if (lastSentenceEnd > maxLength * 0.6) {
    return truncated.substring(0, lastSentenceEnd + 1);
  }
  
  // 쉼표나 구두점에서 자르기
  const lastPunctuation = Math.max(
    truncated.lastIndexOf(','),
    truncated.lastIndexOf(';'),
    truncated.lastIndexOf(':'),
    truncated.lastIndexOf('、'), // 한국어 쉼표
    truncated.lastIndexOf('：') // 한국어 콜론
  );
  
  if (lastPunctuation > maxLength * 0.7) {
    return truncated.substring(0, lastPunctuation) + '...';
  }
  
  // 단어/어절 경계에서 자르기
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
  // YouTube 영상의 평균 길이를 고려한 추정값 (초 단위)
  // 실제로는 YouTube Data API를 사용해야 하지만 여기서는 추정
  return Math.floor(Math.random() * 1200) + 300; // 5분~25분 사이 랜덤
}

// 스마트 태그 생성 함수
function generateSmartTags(title: string, content: string, originalTags: string[], category: string): string[] {
  const text = `${title} ${content}`.toLowerCase();
  const smartTags: string[] = [];
  
  // 기본 원본 태그들 (일반적인 태그들 제외)
  const excludeGenericTags = ['tech', 'technology', 'development', 'programming', 'software', 'it'];
  const filteredOriginalTags = originalTags.filter(tag => 
    !excludeGenericTags.includes(tag.toLowerCase())
  );
  smartTags.push(...filteredOriginalTags);
  
  // 기술 키워드 기반 태그
  const techKeywords = {
    'React': ['react', 'jsx', 'hooks', 'component'],
    'Vue': ['vue', 'vuejs', 'nuxt'],
    'Angular': ['angular', 'typescript'],
    'JavaScript': ['javascript', 'js', 'node.js', 'nodejs'],
    'Python': ['python', 'django', 'flask', 'fastapi'],
    'Java': ['java', 'spring', 'kotlin'],
    'Go': ['golang', 'go'],
    'Docker': ['docker', 'container', 'containerization'],
    'Kubernetes': ['kubernetes', 'k8s', 'orchestration'],
    'AWS': ['aws', 'amazon web services', 'lambda', 's3'],
    'AI': ['ai', 'artificial intelligence', 'machine learning', 'ml', 'deep learning'],
    'Database': ['database', 'sql', 'mysql', 'postgresql', 'mongodb'],
    'API': ['api', 'rest', 'graphql', 'endpoint'],
    'DevOps': ['devops', 'ci/cd', 'jenkins', 'deployment'],
    'Frontend': ['frontend', 'ui', 'ux', 'design system'],
    'Backend': ['backend', 'server', 'microservices'],
    'Mobile': ['mobile', 'app', 'ios', 'android', 'react native', 'flutter'],
    'Security': ['security', 'authentication', 'authorization', 'jwt', 'oauth'],
    'Performance': ['performance', 'optimization', 'speed', 'caching'],
    'Testing': ['test', 'testing', 'unit test', 'integration'],
    'Architecture': ['architecture', 'design pattern', 'scalability']
  };
  
  // 키워드 매칭으로 스마트 태그 생성
  Object.entries(techKeywords).forEach(([tag, keywords]) => {
    if (keywords.some(keyword => text.includes(keyword))) {
      smartTags.push(tag);
    }
  });
  
  // 카테고리 기반 태그 추가 (필수)
  const categoryTags = {
    'frontend': ['Frontend', 'UI/UX'],
    'backend': ['Backend', 'Server'],
    'ai-ml': ['AI', 'Machine Learning'],
    'cloud-infra': ['Cloud', 'Infrastructure'],
    'mobile': ['Mobile', 'App'],
    'data': ['Data', 'Analytics'],
    'security': ['Security', 'DevSecOps'],
    'game': ['Game Dev', 'Unity'],
    'design': ['Design', 'UX'],
    'office': ['Productivity', 'Tools']
  };
  
  if (categoryTags[category]) {
    smartTags.push(...categoryTags[category]);
  }
  
  // 태그가 부족하면 기본 태그들 추가
  if (smartTags.length < 2) {
    const fallbackTags = ['Development', 'Engineering', 'Tutorial', 'Guide', 'Tips'];
    smartTags.push(...fallbackTags.slice(0, 3 - smartTags.length));
  }
  
  // 중복 제거 및 최대 4개로 제한
  const uniqueTags = [...new Set(smartTags)];
  return uniqueTags.slice(0, 4);
}

// 카테고리 자동 분류 함수
function categorizeArticle(title: string, content: string, tags: string[]): string {
  const text = `${title} ${content} ${tags.join(' ')}`.toLowerCase();
  
  const categoryKeywords = {
    frontend: {
      keywords: ['react', 'vue', 'angular', 'javascript', 'typescript', 'css', 'html', 'frontend', 'ui', 'ux', 'design system', 'component', 'jsx', 'dom', 'browser', 'nextjs', 'svelte', 'webpack', 'vite', '프론트엔드', '리액트', '자바스크립트'],
      weight: 0
    },
    backend: {
      keywords: ['backend', 'server', 'api', 'database', 'sql', 'nosql', 'node.js', 'python', 'java', 'spring', 'express', 'fastapi', 'django', 'mysql', 'postgresql', 'mongodb', 'microservices', 'golang', 'rust', '백엔드', '서버', '데이터베이스'],
      weight: 0
    },
    'ai-ml': {
      keywords: ['ai', 'artificial intelligence', 'machine learning', 'deep learning', 'ml', 'tensorflow', 'pytorch', 'chatgpt', 'gpt', 'llm', 'neural network', 'data science', 'openai', 'claude', 'gemini', 'langchain', '인공지능', '머신러닝', '딥러닝'],
      weight: 0
    },
    'cloud-infra': {
      keywords: ['cloud', 'aws', 'azure', 'gcp', 'kubernetes', 'k8s', 'docker', 'terraform', 'ansible', 'infrastructure', 'serverless', 'lambda', 'containers', 'microservices', 'monitoring', 'observability', 'prometheus', 'grafana', '클라우드', '인프라', '쿠버네티스'],
      weight: 0
    },
    game: {
      keywords: ['game', 'unity', 'unreal', 'godot', 'game development', 'gamedev', 'c#', 'blueprint', '3d', 'shader', 'physics', 'multiplayer', 'steam', 'mobile game', 'indie game', '게임', '게임개발', '유니티', '언리얼'],
      weight: 0
    },
    office: {
      keywords: ['productivity', 'office', 'excel', 'powerpoint', 'word', 'notion', 'slack', 'teams', 'automation', 'workflow', 'project management', 'agile', 'scrum', 'collaboration', 'remote work', '생산성', '오피스', '업무', '협업'],
      weight: 0
    },
    mobile: {
      keywords: ['mobile', 'react native', 'flutter', 'ios', 'android', 'swift', 'kotlin', 'app', 'application', 'xamarin', 'ionic', '모바일', '앱'],
      weight: 0
    },
    design: {
      keywords: ['design', 'ux', 'ui design', 'figma', 'sketch', 'prototype', 'user experience', 'user interface', 'graphic', 'branding', 'typography', 'color theory', '디자인', '사용자경험', '프로토타입'],
      weight: 0
    },
    data: {
      keywords: ['data', 'analytics', 'big data', 'data engineering', 'etl', 'data warehouse', 'spark', 'hadoop', 'kafka', 'tableau', 'power bi', 'snowflake', '데이터', '분석', '빅데이터'],
      weight: 0
    },
    security: {
      keywords: ['security', 'cybersecurity', 'authentication', 'authorization', 'encryption', 'jwt', 'oauth', 'vulnerability', 'penetration', 'zero trust', 'devsecops', '보안', '인증', '암호화'],
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

// 썸네일 관련 함수들 제거됨 - 더 이상 사용하지 않음

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

  // 3. 플랫폼별 가중치 설정 (다양성 강화)
  const platformWeights: Record<string, number> = {
    // 기업 블로그 (높은 가중치)
    toss: 1.2,
    kakao: 1.2, 
    naver: 1.2,
    daangn: 1.1,
    woowahan: 1.1,
    line_blog: 1.1,
    coupang: 1.1,
    banksalad: 1.0,
    spoqa: 1.0,
    
    // 영상 콘텐츠 (낮은 가중치 - 다양성 위해 제한)
    google_dev: 0.6,
    line_dev: 0.6,
    aws_korea: 0.6,
    toast: 0.6,
    
    // 커뮤니티
    medium: 0.8
  };

  // 4. 가중치 기반 라운드 로빈 with 셔플링
  const curatedArticles: Article[] = [];
  const platformIds = Object.keys(articlesByPlatform).sort(() => Math.random() - 0.5); // 플랫폼 순서 랜덤화
  
  // 각 플랫폼별로 선택할 아티클 수 계산
  const selectCounts: Record<string, number> = {};
  platformIds.forEach(platformId => {
    const weight = platformWeights[platformId] || 1.0;
    const articleCount = articlesByPlatform[platformId].length;
    selectCounts[platformId] = Math.ceil(articleCount * weight);
  });

  // 5. 라운드 로빈으로 균형있게 선택
  const maxRounds = Math.max(...Object.values(selectCounts));
  
  for (let round = 0; round < maxRounds; round++) {
    for (const platformId of platformIds) {
      const platformArticles = articlesByPlatform[platformId];
      if (platformArticles && platformArticles[round] && round < selectCounts[platformId]) {
        curatedArticles.push(platformArticles[round]);
      }
    }
  }

  // 6. 최종적으로 발행일 기준으로 약간의 섞기 (완전 최신순이 아닌 다양성)
  return curatedArticles.sort((a, b) => {
    const timeA = new Date(a.publishedAt).getTime();
    const timeB = new Date(b.publishedAt).getTime();
    const timeDiff = timeB - timeA;
    
    // 24시간 내 아티클들은 약간 섞고, 그 외는 시간순
    if (Math.abs(timeDiff) < 24 * 60 * 60 * 1000) {
      return Math.random() - 0.5;
    }
    return timeDiff;
  });
}

// RSS 수집 함수 (캐시 우선)
export async function collectAllFeeds(): Promise<Article[]> {
  // 먼저 캐시된 데이터 확인
  const cachedArticles = await CacheManager.getCachedArticles();
  if (cachedArticles) {
    return cachedArticles;
  }

  // 캐시가 없거나 만료된 경우 새로 수집
  console.log('새로운 RSS 데이터를 수집합니다...');
  return await collectFreshFeeds();
}

// 실제 RSS 수집 함수
export async function collectFreshFeeds(): Promise<Article[]> {
  const allArticles: Article[] = [];
  
  console.log('=== RSS 수집 시작 ===');
  console.log('활성화된 플랫폼:', Object.keys(platforms).filter(key => platforms[key as keyof typeof platforms].isActive));
  
  for (const [platformKey, platformData] of Object.entries(platforms)) {
    try {
      console.log(`\n--- ${platformData.name} 수집 시작 ---`);
      console.log(`RSS URL: ${platformData.rssUrl}`);
      
      const startTime = Date.now();
      
      // 네이버 D2는 특별한 헤더가 필요
      let feed;
      if (platformKey === 'naver') {
        const Parser = require('rss-parser');
        const customParser = new Parser({
          requestOptions: {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              'Accept': 'application/rss+xml, application/atom+xml, text/xml, */*'
            }
          }
        });
        feed = await customParser.parseURL(platformData.rssUrl);
      } else {
        feed = await parser.parseURL(platformData.rssUrl);
      }
      
      const fetchTime = Date.now() - startTime;
      
      console.log(`RSS 파싱 완료 (${fetchTime}ms)`);
      console.log(`총 RSS 아이템 수: ${feed.items?.length || 0}`);
      
      // 미디엄만 엄격한 필터링 적용
      let itemsToProcess = feed.items;
      
      if (platformKey === 'medium') {
        console.log('미디엄 필터링 시작...');
        const beforeFilter = feed.items.length;
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
          
          // 영어 본문 체크 (한국어 비율이 너무 낮으면 제외)
          const koreanCharPattern = /[가-힣]/g;
          const titleKoreanMatches = title.match(koreanCharPattern) || [];
          const contentKoreanMatches = (item.content || item.summary || '').match(koreanCharPattern) || [];
          
          const titleKoreanRatio = titleKoreanMatches.length / Math.max(title.length, 1);
          const contentKoreanRatio = contentKoreanMatches.length / Math.max((item.content || item.summary || '').length, 1);
          
          // 제목이나 내용에 한국어가 거의 없으면 제외 (영어 글 필터링)
          if (titleKoreanRatio < 0.1 && contentKoreanRatio < 0.05) return false;

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
        console.log(`미디엄 필터링 완료: ${beforeFilter} -> ${itemsToProcess.length} (${itemsToProcess.length - beforeFilter} 필터됨)`);
      }

      // 플랫폼별 최대 수집 개수 제한 (균형있게 조정)
      const maxArticlesPerPlatform = {
        toss: 18,       // 토스: 기업 블로그 (품질 좋음)
        daangn: 15,     // 당근마켓: 기업 블로그
        kakao: 15,      // 카카오: 기업 블로그
        naver: 15,      // 네이버 D2: 기업 블로그  
        woowahan: 15,   // 우아한형제들: 기업 블로그
        medium: 3,      // 미디엄: 최소한으로 줄임
        // YouTube 채널들
        google_dev: 8,  // 구글 개발자 채널
        line_dev: 8,    // LINE 개발자 채널
        aws_korea: 8,   // AWS Korea
        toast: 8,       // 토스트
        // 추가 기업 기술블로그
        line_blog: 12,  // LINE 기술블로그
        coupang: 12,    // 쿠팡 기술블로그
        banksalad: 10,  // 뱅크샐러드
        spoqa: 10       // 스포카
      };
      
      const maxArticles = maxArticlesPerPlatform[platformKey as keyof typeof maxArticlesPerPlatform] || 15;
      console.log(`${platformData.name} 최대 수집 개수: ${maxArticles}, 실제 처리할 아이템: ${Math.min(maxArticles, itemsToProcess.length)}`);
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
        const rawContent = item['content:encoded'] || item.content || item.summary || '';
        const content = stripHtmlAndClean(rawContent);
        const originalTags = item.categories || ['Tech'];
        const category = categorizeArticle(title, content, originalTags);
        const smartTags = generateSmartTags(title, content, originalTags, category);
        
        // YouTube 채널인지 확인
        const isYouTubeChannel = ['google_dev', 'line_dev', 'aws_korea', 'toast'].includes(platformKey);
        const videoId = isYouTubeChannel && item.link ? extractVideoId(item.link) : null;
        
        const baseArticle = {
          id: `${platformKey}-${index}`,
          title: stripHtmlAndClean(title),
          content,
          excerpt: generateExcerpt(rawContent),
          author: defaultAuthor,
          platform,
          category: category as any,
          tags: smartTags,
          publishedAt: new Date(item.pubDate || Date.now()),
          viewCount: Math.floor(Math.random() * 5000) + 1000,
          likeCount: Math.floor(Math.random() * 200) + 50,
          commentCount: Math.floor(Math.random() * 50) + 5,
          readingTime: Math.floor(Math.random() * 15) + 5,
          trending: Math.random() > 0.7,
          featured: Math.random() > 0.8,
          url: item.link || platformData.baseUrl,
          contentType: isYouTubeChannel ? 'video' as const : 'article' as const
        };
        
        // YouTube 영상인 경우 추가 필드
        if (isYouTubeChannel && videoId) {
          return {
            ...baseArticle,
            videoUrl: item.link,
            videoDuration: estimateVideoDuration(),
            thumbnailUrl: getYoutubeThumbnail(videoId),
            watchCount: Math.floor(Math.random() * 50000) + 5000 // 영상 조회수
          };
        }
        
        return baseArticle;
      });

      allArticles.push(...articles);
      console.log(`✅ ${platformData.name}: ${articles.length}개 수집 완료`);
      console.log(`--- ${platformData.name} 수집 종료 ---\n`);
      
    } catch (error) {
      console.error(`❌ ${platformData.name} 수집 실패:`, error);
      console.error(`RSS URL: ${platformData.rssUrl}`);
      if (error instanceof Error) {
        console.error(`에러 메시지: ${error.message}`);
        console.error(`에러 스택: ${error.stack?.slice(0, 300)}`);
      }
      console.log(`--- ${platformData.name} 수집 종료 (실패) ---\n`);
    }
  }

  console.log('=== RSS 수집 완료 ===');
  console.log(`총 수집된 기사 수: ${allArticles.length}`);
  
  // 플랫폼별 분포 확인
  const platformDistribution = allArticles.reduce((acc, article) => {
    acc[article.platform.name] = (acc[article.platform.name] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  console.log('플랫폼별 분포:', platformDistribution);
  
  // 큐레이션 알고리즘: 다양성과 품질을 고려한 정렬
  const curatedArticles = curateArticles(allArticles);

  // 새로 수집한 데이터를 캐시에 저장
  await CacheManager.setCachedArticles(curatedArticles);

  console.log(`큐레이션 후 기사 수: ${curatedArticles.length}`);
  console.log('=== 수집 프로세스 완료 ===\n');
  
  return curatedArticles;
}
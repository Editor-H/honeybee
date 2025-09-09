export type PlatformType = 'corporate' | 'educational' | 'media' | 'community' | 'personal';
export type CollectionMethod = 'rss' | 'crawler' | 'api';

export interface PlatformConfig {
  id: string;
  name: string;
  type: PlatformType;
  baseUrl: string;
  description: string;
  isActive: boolean;
  collectionMethod: CollectionMethod;
  rssUrl?: string;
  crawlerType?: string;
  channelName?: string; // YouTube 채널용
  limit: number;
  timeout?: number;
  retries?: number;
}

export const PLATFORM_CONFIGS: Record<string, PlatformConfig> = {
  // 🇰🇷 한국 기업 기술 블로그
  toss: {
    id: 'toss',
    name: '토스 기술블로그',
    type: 'corporate',
    baseUrl: 'https://toss.tech',
    description: '토스팀이 만드는 기술 이야기',
    isActive: true,
    collectionMethod: 'rss',
    rssUrl: 'https://toss.tech/rss.xml',
    limit: 6
  },
  daangn: {
    id: 'daangn',
    name: '당근마켓 기술블로그',
    type: 'corporate',
    baseUrl: 'https://medium.com/daangn',
    description: '당근마켓 팀의 기술 이야기',
    isActive: true,
    collectionMethod: 'rss',
    rssUrl: 'https://medium.com/feed/daangn',
    limit: 6
  },
  kakao: {
    id: 'kakao',
    name: '카카오 기술블로그',
    type: 'corporate',
    baseUrl: 'https://tech.kakao.com',
    description: '카카오의 기술과 서비스 이야기',
    isActive: true,
    collectionMethod: 'rss',
    rssUrl: 'https://tech.kakao.com/feed/',
    limit: 6
  },
  naver: {
    id: 'naver',
    name: '네이버 D2',
    type: 'corporate',
    baseUrl: 'https://d2.naver.com',
    description: '네이버 개발자들의 기술 이야기',
    isActive: true,
    collectionMethod: 'crawler',
    crawlerType: 'naver-d2',
    limit: 6,
    timeout: 30000
  },
  woowahan: {
    id: 'woowahan',
    name: '우아한형제들',
    type: 'corporate',
    baseUrl: 'https://techblog.woowahan.com',
    description: '우아한형제들의 기술 블로그',
    isActive: true,
    collectionMethod: 'rss',
    rssUrl: 'https://techblog.woowahan.com/feed/',
    limit: 6
  },
  line: {
    id: 'line',
    name: 'LINE Engineering',
    type: 'corporate',
    baseUrl: 'https://engineering.linecorp.com/ko',
    description: 'LINE의 기술과 개발 문화',
    isActive: true, // 웹 크롤링으로 활성화
    collectionMethod: 'crawler',
    crawlerType: 'line-engineering',
    limit: 8,
    timeout: 45000
  },
  banksalad: {
    id: 'banksalad',
    name: '뱅크샐러드 기술블로그',
    type: 'corporate',
    baseUrl: 'https://blog.banksalad.com',
    description: '뱅크샐러드 팀의 기술 이야기',
    isActive: true,
    collectionMethod: 'rss',
    rssUrl: 'https://blog.banksalad.com/rss.xml',
    limit: 5
  },
  coupang: {
    id: 'coupang',
    name: '쿠팡 기술블로그',
    type: 'corporate',
    baseUrl: 'https://medium.com/coupang-engineering',
    description: '쿠팡의 대규모 시스템과 기술 경험',
    isActive: true,
    collectionMethod: 'rss',
    rssUrl: 'https://medium.com/feed/coupang-engineering',
    limit: 5
  },
  socar: {
    id: 'socar',
    name: '쏘카 기술블로그',
    type: 'corporate',
    baseUrl: 'https://tech.socarcorp.kr',
    description: '쏘카의 기술과 개발 경험',
    isActive: true,
    collectionMethod: 'rss',
    rssUrl: 'https://tech.socarcorp.kr/feed',
    limit: 5
  },

  // 📰 한국 IT 미디어
  yozm: {
    id: 'yozm',
    name: '요즘IT',
    type: 'media',
    baseUrl: 'https://yozm.wishket.com',
    description: 'IT 개발자와 기획자를 위한 전문 미디어',
    isActive: true,
    collectionMethod: 'rss',
    rssUrl: 'https://yozm.wishket.com/magazine/feed/',
    limit: 5
  },
  outstanding: {
    id: 'outstanding',
    name: '아웃스탠딩',
    type: 'media',
    baseUrl: 'https://outstanding.kr/category/best',
    description: '비즈니스와 테크 트렌드를 다루는 미디어',
    isActive: true,
    collectionMethod: 'crawler',
    crawlerType: 'outstanding',
    limit: 5,
    timeout: 30000
  },
  eo: {
    id: 'eo',
    name: 'EO 매거진',
    type: 'media',
    baseUrl: 'https://eopla.net',
    description: '고품질 기술 매거진 및 트렌드',
    isActive: true,
    collectionMethod: 'crawler',
    crawlerType: 'eo',
    limit: 5
  },

  // 🤖 AI/커뮤니티
  gpters: {
    id: 'gpters',
    name: 'GPTERS 뉴스레터',
    type: 'community',
    baseUrl: 'https://www.gpters.org',
    description: 'AI와 GPT 관련 뉴스레터',
    isActive: true,
    collectionMethod: 'crawler',
    crawlerType: 'gpters',
    limit: 4,
    timeout: 50000
  },

  // 📚 온라인 강의 플랫폼
  inflearn: {
    id: 'inflearn',
    name: '인프런',
    type: 'educational',
    baseUrl: 'https://www.inflearn.com',
    description: '실무 중심의 프로그래밍 강의 플랫폼',
    isActive: true,
    collectionMethod: 'crawler',
    crawlerType: 'inflearn',
    limit: 8,
    timeout: 30000
  },
  class101: {
    id: 'class101',
    name: '클래스101',
    type: 'educational',
    baseUrl: 'https://class101.net',
    description: '창작과 취미를 위한 온라인 클래스',
    isActive: true,
    collectionMethod: 'crawler',
    crawlerType: 'class101',
    limit: 8,
    timeout: 30000
  },
  coloso: {
    id: 'coloso',
    name: '콜로소',
    type: 'educational',
    baseUrl: 'https://coloso.co.kr',
    description: '실무진이 가르치는 창작 강의',
    isActive: true,
    collectionMethod: 'crawler',
    crawlerType: 'coloso',
    limit: 8,
    timeout: 30000
  },

  // 🎥 YouTube 교육 채널
  jocoding: {
    id: 'jocoding',
    name: 'YouTube',
    type: 'educational',
    baseUrl: 'https://www.youtube.com/@조코딩',
    channelName: '조코딩',
    description: '프로그래밍 교육 및 개발 관련 콘텐츠',
    isActive: true,
    collectionMethod: 'rss',
    rssUrl: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCQNE2JmbasNYbjGAcuBiRRg',
    limit: 4
  },
  opentutorials: {
    id: 'opentutorials',
    name: 'YouTube',
    type: 'educational',
    baseUrl: 'https://www.youtube.com/@opentutorials',
    channelName: '생활코딩',
    description: '프로그래밍 교육의 대표 채널',
    isActive: true,
    collectionMethod: 'rss',
    rssUrl: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCvc8kv-i5fvFTJBFAk6n1SA',
    limit: 4
  },
  nomad_coders: {
    id: 'nomad_coders',
    name: 'YouTube',
    type: 'educational',
    baseUrl: 'https://www.youtube.com/@nomadcoders',
    channelName: '노마드 코더',
    description: '실무 중심 코딩 교육',
    isActive: true,
    collectionMethod: 'rss',
    rssUrl: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCUpJs89fSBXNolQGOYKn0YQ',
    limit: 4
  },
  coding_with_john: {
    id: 'coding_with_john',
    name: 'YouTube',
    type: 'educational',
    baseUrl: 'https://www.youtube.com/@CodingwithJohn',
    channelName: 'Coding with John',
    description: 'Java 프로그래밍 튜토리얼',
    isActive: false, // 채널 ID 404 오류로 임시 비활성화
    collectionMethod: 'rss',
    rssUrl: 'https://www.youtube.com/feeds/videos.xml?channel_id=UC6V3E7ZYpfwZLMJoJgCqGGA',
    limit: 4
  },
  programming_with_mosh: {
    id: 'programming_with_mosh',
    name: 'YouTube',
    type: 'educational',
    baseUrl: 'https://www.youtube.com/@programmingwithmosh',
    channelName: 'Programming with Mosh',
    description: '프로그래밍 기초부터 고급까지',
    isActive: true,
    collectionMethod: 'rss',
    rssUrl: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCWv7vMbMWH4-V0ZXdmDpPBA',
    limit: 4
  },

  // 🌍 글로벌 개발자 커뮤니티
  medium: {
    id: 'medium',
    name: 'Medium',
    type: 'community',
    baseUrl: 'https://medium.com',
    description: '전 세계 개발자들의 기술 이야기',
    isActive: true,
    collectionMethod: 'rss',
    rssUrl: 'https://medium.com/feed/tag/javascript',
    limit: 3
  },
  hacker_news: {
    id: 'hacker_news',
    name: 'Hacker News',
    type: 'community',
    baseUrl: 'https://news.ycombinator.com',
    description: '지적 호기심을 자극하는 기술 뉴스',
    isActive: true,
    collectionMethod: 'rss',
    rssUrl: 'https://news.ycombinator.com/rss',
    limit: 3
  },
  dev_to: {
    id: 'dev_to',
    name: 'DEV Community',
    type: 'community',
    baseUrl: 'https://dev.to',
    description: '글로벌 개발자 커뮤니티 플랫폼',
    isActive: true,
    collectionMethod: 'rss',
    rssUrl: 'https://dev.to/feed',
    limit: 3
  },
  freecodecamp: {
    id: 'freecodecamp',
    name: 'freeCodeCamp',
    type: 'educational',
    baseUrl: 'https://www.freecodecamp.org',
    description: '프로그래밍 학습 및 튜토리얼',
    isActive: true,
    collectionMethod: 'rss',
    rssUrl: 'https://www.freecodecamp.org/news/rss/',
    limit: 3
  },

  // 🎨 UX/UI 디자인
  medium_ux_collective: {
    id: 'medium_ux_collective',
    name: 'UX Collective',
    type: 'community',
    baseUrl: 'https://uxdesign.cc',
    description: 'UX 디자인 전문 미디움 퍼블리케이션',
    isActive: true,
    collectionMethod: 'rss',
    rssUrl: 'https://uxdesign.cc/feed',
    limit: 3
  },
  medium_ux_writer: {
    id: 'medium_ux_writer',
    name: 'Medium - UX 실무자들',
    type: 'personal',
    baseUrl: 'https://medium.com',
    description: 'Medium의 한국 UX/UI 디자이너 및 기획자들',
    isActive: true,
    collectionMethod: 'rss',
    rssUrl: 'https://medium.com/feed/tag/ux-design',
    limit: 3
  },
  tistory_design: {
    id: 'tistory_design',
    name: '티스토리 - UX/UI',
    type: 'community',
    baseUrl: 'https://www.tistory.com',
    description: '티스토리의 UX/UI 관련 블로그들',
    isActive: false, // RSS URL 형식 오류로 임시 비활성화
    collectionMethod: 'rss',
    rssUrl: 'https://www.tistory.com/category/UX%2FUI/rss',
    limit: 1
  }
};

// 플랫폼 유틸리티 함수들
export function getActivePlatforms(): PlatformConfig[] {
  return Object.values(PLATFORM_CONFIGS).filter(platform => platform.isActive);
}

export function getPlatformsByType(type: PlatformType): PlatformConfig[] {
  return Object.values(PLATFORM_CONFIGS).filter(platform => platform.type === type);
}

export function getPlatformsByMethod(method: CollectionMethod): PlatformConfig[] {
  return Object.values(PLATFORM_CONFIGS).filter(platform => platform.collectionMethod === method);
}

export function addPlatform(config: PlatformConfig): void {
  PLATFORM_CONFIGS[config.id] = config;
}

export function updatePlatform(id: string, updates: Partial<PlatformConfig>): void {
  if (PLATFORM_CONFIGS[id]) {
    PLATFORM_CONFIGS[id] = { ...PLATFORM_CONFIGS[id], ...updates };
  }
}

export function togglePlatform(id: string): void {
  if (PLATFORM_CONFIGS[id]) {
    PLATFORM_CONFIGS[id].isActive = !PLATFORM_CONFIGS[id].isActive;
  }
}
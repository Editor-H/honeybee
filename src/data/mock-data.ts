import { Article, Author, Platform, TrendingKeyword, DashboardStats, ArticleCategory } from '@/types/article';

// Mock Authors
export const mockAuthors: Author[] = [
  {
    id: '1',
    name: '김개발',
    company: '토스',
    expertise: ['React', 'TypeScript', 'Frontend'],
    articleCount: 45,
    followerCount: 12500
  },
  {
    id: '2', 
    name: '박백엔드',
    company: '당근마켓',
    expertise: ['Node.js', 'Go', 'Microservices'],
    articleCount: 32,
    followerCount: 8900
  },
  {
    id: '3',
    name: '이데이터',
    company: '네이버',
    expertise: ['Python', 'Machine Learning', 'Data Engineering'],
    articleCount: 28,
    followerCount: 15200
  },
  {
    id: '4',
    name: '최디자인',
    company: '카카오',
    expertise: ['UI/UX', 'Design System', 'Product Design'],
    articleCount: 38,
    followerCount: 9800
  },
  {
    id: '5',
    name: '정클라우드',
    company: '라인',
    expertise: ['Kubernetes', 'Docker', 'AWS'],
    articleCount: 25,
    followerCount: 7200
  }
];

// Mock Platforms
export const mockPlatforms: Platform[] = [
  {
    id: '1',
    name: '토스 기술블로그',
    type: 'corporate',
    baseUrl: 'https://toss.tech',
    description: '토스팀이 만드는 기술 이야기',
    isActive: true,
    lastCrawled: new Date('2024-01-20T10:00:00Z')
  },
  {
    id: '2',
    name: '당근마켓 기술블로그',
    type: 'corporate',
    baseUrl: 'https://medium.com/daangn',
    description: '당근마켓 팀의 기술 이야기',
    isActive: true,
    lastCrawled: new Date('2024-01-20T09:30:00Z')
  },
  {
    id: '3',
    name: 'NAVER D2',
    type: 'corporate',
    baseUrl: 'https://d2.naver.com',
    description: '네이버 개발자를 위한 기술 정보 공유',
    isActive: true,
    lastCrawled: new Date('2024-01-20T11:15:00Z')
  },
  {
    id: '4',
    name: 'velog',
    type: 'community',
    baseUrl: 'https://velog.io',
    description: '개발자를 위한 블로그 서비스',
    isActive: true,
    lastCrawled: new Date('2024-01-20T08:45:00Z')
  },
  {
    id: '5',
    name: '브런치',
    type: 'community',
    baseUrl: 'https://brunch.co.kr',
    description: '관심사가 모이는 글 발행 플랫폼',
    isActive: true,
    lastCrawled: new Date('2024-01-20T09:00:00Z')
  }
];

// Mock Articles
export const mockArticles: Article[] = [
  {
    id: '1',
    title: 'Next.js 15의 새로운 기능들과 마이그레이션 가이드',
    content: 'Next.js 15가 정식 릴리즈되면서 많은 새로운 기능들이 추가되었습니다...',
    excerpt: '실제 프로젝트에 적용해본 경험을 바탕으로 새로운 기능들을 자세히 살펴보고 마이그레이션 시 주의사항들을 정리했습니다.',
    thumbnailUrl: '/images/nextjs15.jpg',
    author: mockAuthors[0],
    platform: mockPlatforms[0],
    category: 'frontend',
    tags: ['Next.js', 'React', 'Frontend', 'Migration'],
    publishedAt: new Date('2024-01-20T14:30:00Z'),
    viewCount: 2840,
    likeCount: 156,
    commentCount: 23,
    readingTime: 8,
    trending: true,
    featured: true,
    url: 'https://toss.tech/article/nextjs-15-migration-guide',
    contentType: 'article' as const
  },
  {
    id: '2',
    title: 'React 19에서 달라진 것들: 완전 정리',
    content: 'React 19 릴리즈 후보가 공개되면서 많은 개발자들이 관심을 갖고 있습니다...',
    excerpt: 'React 19의 주요 변경사항과 새로운 기능들을 실습 예제와 함께 정리했습니다.',
    thumbnailUrl: '/images/react19.jpg',
    author: mockAuthors[1],
    platform: mockPlatforms[1],
    category: 'frontend',
    tags: ['React', 'JavaScript', 'Frontend'],
    publishedAt: new Date('2024-01-20T09:15:00Z'),
    viewCount: 1920,
    likeCount: 89,
    commentCount: 15,
    readingTime: 6,
    trending: true,
    featured: false,
    url: 'https://medium.com/daangn/react-19-changes',
    contentType: 'article' as const
  },
  {
    id: '3',
    title: '타입스크립트 5.0 새로운 기능 총정리',
    content: '타입스크립트 5.0이 정식 출시되면서 성능 개선과 새로운 기능들이 대거 추가되었습니다...',
    excerpt: '타입스크립트 5.0의 새로운 기능들을 예제와 함께 살펴보고 실무에 어떻게 적용할 수 있는지 알아봅시다.',
    thumbnailUrl: '/images/typescript5.jpg',
    author: mockAuthors[2],
    platform: mockPlatforms[2],
    category: 'frontend',
    tags: ['TypeScript', 'JavaScript', 'Types'],
    publishedAt: new Date('2024-01-19T16:20:00Z'),
    viewCount: 3150,
    likeCount: 203,
    commentCount: 34,
    readingTime: 10,
    trending: false,
    featured: true,
    url: 'https://d2.naver.com/helloworld/typescript-5',
    contentType: 'article' as const
  },
  {
    id: '4',
    title: 'AI 도구를 활용한 개발 생산성 향상 방법',
    content: 'ChatGPT, GitHub Copilot 등 AI 도구들이 개발자의 일상을 바꾸고 있습니다...',
    excerpt: '실제 개발 업무에서 AI 도구들을 어떻게 활용하면 생산성을 높일 수 있는지 구체적인 방법들을 소개합니다.',
    thumbnailUrl: '/images/ai-productivity.jpg',
    author: mockAuthors[3],
    platform: mockPlatforms[3],
    category: 'ai-ml',
    tags: ['AI', 'Productivity', 'ChatGPT', 'GitHub Copilot'],
    publishedAt: new Date('2024-01-19T11:45:00Z'),
    viewCount: 4680,
    likeCount: 312,
    commentCount: 67,
    readingTime: 12,
    trending: true,
    featured: true,
    url: 'https://velog.io/@developer/ai-productivity-tools',
    contentType: 'article' as const
  },
  {
    id: '5',
    title: 'Docker와 Kubernetes로 시작하는 DevOps',
    content: 'DevOps 문화와 컨테이너 기술이 현대 소프트웨어 개발에서 필수가 되었습니다...',
    excerpt: 'Docker와 Kubernetes를 활용해 DevOps 환경을 구축하는 방법을 단계별로 설명합니다.',
    thumbnailUrl: '/images/docker-k8s.jpg',
    author: mockAuthors[4],
    platform: mockPlatforms[0],
    category: 'cloud-infra',
    tags: ['Docker', 'Kubernetes', 'DevOps', 'Container'],
    publishedAt: new Date('2024-01-18T14:00:00Z'),
    viewCount: 2340,
    likeCount: 128,
    commentCount: 19,
    readingTime: 15,
    trending: false,
    featured: false,
    url: 'https://toss.tech/article/docker-kubernetes-devops',
    contentType: 'article' as const
  },
  {
    id: '6',
    title: '사용자 경험을 개선하는 디자인 시스템',
    content: '일관된 사용자 경험을 제공하기 위해서는 체계적인 디자인 시스템이 필요합니다...',
    excerpt: '대규모 서비스에서 디자인 시스템을 구축하고 운영하는 방법과 고려사항들을 정리했습니다.',
    thumbnailUrl: '/images/design-system.jpg',
    author: mockAuthors[3],
    platform: mockPlatforms[4],
    category: 'design',
    tags: ['Design System', 'UI/UX', 'Frontend'],
    publishedAt: new Date('2024-01-17T10:30:00Z'),
    viewCount: 1870,
    likeCount: 94,
    commentCount: 12,
    readingTime: 7,
    trending: false,
    featured: false,
    url: 'https://brunch.co.kr/@designer/design-system-guide',
    contentType: 'article' as const
  },
  {
    id: '7',
    title: 'GraphQL과 REST API 비교 분석',
    content: 'API 설계에서 GraphQL과 REST 중 어떤 것을 선택해야 할지 고민하는 개발자들을 위한 가이드...',
    excerpt: '실제 프로젝트 경험을 바탕으로 GraphQL과 REST API의 장단점을 비교분석하고 선택 기준을 제시합니다.',
    thumbnailUrl: '/images/graphql-rest.jpg',
    author: mockAuthors[1],
    platform: mockPlatforms[1],
    category: 'backend',
    tags: ['GraphQL', 'REST API', 'Backend'],
    publishedAt: new Date('2024-01-16T15:20:00Z'),
    viewCount: 2650,
    likeCount: 142,
    commentCount: 28,
    readingTime: 9,
    trending: false,
    featured: true,
    url: 'https://medium.com/daangn/graphql-vs-rest-api',
    contentType: 'article' as const
  },
  {
    id: '8',
    title: 'Rust로 시작하는 시스템 프로그래밍',
    content: 'Rust 언어의 특징과 시스템 프로그래밍에서의 활용 방법을 알아봅시다...',
    excerpt: '메모리 안전성과 성능을 동시에 확보할 수 있는 Rust의 핵심 개념과 실무 적용 사례를 소개합니다.',
    thumbnailUrl: '/images/rust-programming.jpg',
    author: mockAuthors[4],
    platform: mockPlatforms[2],
    category: 'backend',
    tags: ['Rust', 'System Programming', 'Performance'],
    publishedAt: new Date('2024-01-15T13:45:00Z'),
    viewCount: 1920,
    likeCount: 87,
    commentCount: 15,
    readingTime: 11,
    trending: false,
    featured: false,
    url: 'https://d2.naver.com/helloworld/rust-programming',
    contentType: 'article' as const
  },
  {
    id: '9',
    title: '모바일 앱 성능 최적화 전략',
    content: '모바일 앱의 성능을 극대화하기 위한 다양한 최적화 기법들을 살펴봅시다...',
    excerpt: 'React Native와 Flutter에서 실제로 적용 가능한 성능 최적화 방법들을 정리했습니다.',
    thumbnailUrl: '/images/mobile-performance.jpg',
    author: mockAuthors[0],
    platform: mockPlatforms[0],
    category: 'mobile',
    tags: ['Mobile', 'Performance', 'React Native', 'Flutter'],
    publishedAt: new Date('2024-01-14T16:30:00Z'),
    viewCount: 3240,
    likeCount: 198,
    commentCount: 42,
    readingTime: 13,
    trending: true,
    featured: true,
    url: 'https://toss.tech/article/mobile-performance-optimization',
    contentType: 'article' as const
  },
  {
    id: '10',
    title: '마이크로서비스 아키텍처 패턴',
    content: '대규모 서비스를 위한 마이크로서비스 아키텍처 설계 패턴과 best practice...',
    excerpt: '실제 운영 환경에서 검증된 마이크로서비스 패턴들과 구현 시 주의사항들을 정리했습니다.',
    thumbnailUrl: '/images/microservices.jpg',
    author: mockAuthors[2],
    platform: mockPlatforms[2],
    category: 'backend',
    tags: ['Microservices', 'Architecture', 'Distributed Systems'],
    publishedAt: new Date('2024-01-13T11:20:00Z'),
    viewCount: 4180,
    likeCount: 256,
    commentCount: 38,
    readingTime: 15,
    trending: true,
    featured: true,
    url: 'https://d2.naver.com/helloworld/microservices-patterns',
    contentType: 'article' as const
  },
  {
    id: '11',
    title: 'CSS Grid와 Flexbox 마스터하기',
    content: 'CSS Grid와 Flexbox를 활용한 모던 웹 레이아웃 구축 방법...',
    excerpt: '복잡한 레이아웃도 쉽게 구현할 수 있는 CSS Grid와 Flexbox의 활용법을 예제와 함께 설명합니다.',
    thumbnailUrl: '/images/css-layout.jpg',
    author: mockAuthors[3],
    platform: mockPlatforms[3],
    category: 'frontend',
    tags: ['CSS', 'Grid', 'Flexbox', 'Layout'],
    publishedAt: new Date('2024-01-12T09:15:00Z'),
    viewCount: 2890,
    likeCount: 164,
    commentCount: 22,
    readingTime: 8,
    trending: false,
    featured: false,
    url: 'https://velog.io/@frontend/css-grid-flexbox-guide',
    contentType: 'article' as const
  },
  {
    id: '12',
    title: '보안 취약점 분석과 대응 방안',
    content: '웹 애플리케이션에서 자주 발생하는 보안 취약점들과 예방 방법...',
    excerpt: 'OWASP Top 10을 기반으로 한 실무에서 꼭 알아야 할 보안 취약점 분석과 대응 전략을 소개합니다.',
    thumbnailUrl: '/images/web-security.jpg',
    author: mockAuthors[4],
    platform: mockPlatforms[0],
    category: 'security',
    tags: ['Security', 'OWASP', 'Web Security'],
    publishedAt: new Date('2024-01-11T14:50:00Z'),
    viewCount: 3560,
    likeCount: 223,
    commentCount: 31,
    readingTime: 12,
    trending: true,
    featured: true,
    url: 'https://toss.tech/article/web-security-vulnerabilities',
    contentType: 'article' as const
  }
];

// Mock Trending Keywords
export const mockTrendingKeywords: TrendingKeyword[] = [
  {
    keyword: 'Next.js',
    count: 45,
    growth: 23.5,
    relatedArticles: ['1', '3'],
    category: 'frontend'
  },
  {
    keyword: 'AI',
    count: 38,
    growth: 187.2,
    relatedArticles: ['4'],
    category: 'ai-ml'
  },
  {
    keyword: 'React',
    count: 32,
    growth: 12.8,
    relatedArticles: ['1', '2'],
    category: 'frontend'
  },
  {
    keyword: 'TypeScript',
    count: 29,
    growth: 8.9,
    relatedArticles: ['3'],
    category: 'frontend'
  },
  {
    keyword: 'Docker',
    count: 24,
    growth: 15.6,
    relatedArticles: ['5'],
    category: 'cloud-infra'
  }
];

// Helper functions
export const getArticlesByCategory = (category: ArticleCategory) => {
  return mockArticles.filter(article => article.category === category);
};

export const getTrendingArticles = () => {
  return mockArticles
    .filter(article => article.trending)
    .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
};

export const getFeaturedArticles = () => {
  return mockArticles.filter(article => article.featured);
};

export const getRecentArticles = (limit: number = 10) => {
  return mockArticles
    .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
    .slice(0, limit);
};

export const getNotableAuthors = () => {
  // Get authors who have at least one article with high view count (>3000 views)
  const authorsWithHighViewArticles = new Set();
  
  mockArticles.forEach(article => {
    if (article.viewCount && article.viewCount > 3000) {
      authorsWithHighViewArticles.add(article.author.id);
    }
  });
  
  return mockAuthors.filter(author => authorsWithHighViewArticles.has(author.id));
};

// Mock Dashboard Stats
export const mockDashboardStats: DashboardStats = {
  hotArticles: mockArticles.filter(article => article.trending).length,
  hotKeywords: mockTrendingKeywords.length,
  notableAuthors: getNotableAuthors().length,
  newPlatforms: mockPlatforms.filter(platform => 
    platform.lastCrawled && new Date().getTime() - platform.lastCrawled.getTime() < 7 * 24 * 60 * 60 * 1000
  ).length,
  lastUpdated: new Date()
};
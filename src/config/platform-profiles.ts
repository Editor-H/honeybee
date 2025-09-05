import { ExtendedPlatformProfile } from '@/lib/platform-profile-manager';

// 플랫폼별 상세 프로필 정보
export const PLATFORM_PROFILES: Record<string, ExtendedPlatformProfile> = {
  // 🇰🇷 한국 대기업 기술 블로그
  toss: {
    id: 'toss',
    name: '토스 기술블로그',
    type: 'corporate',
    baseUrl: 'https://toss.tech',
    description: '토스팀이 만드는 기술 이야기',
    isActive: true,
    collectionMethod: 'rss',
    rssUrl: 'https://toss.tech/rss.xml',
    limit: 10,
    logoUrl: 'https://toss.tech/favicon.ico',
    
    company: {
      name: '토스',
      industry: 'fintech',
      size: 'large',
      location: 'Seoul, KR',
      founded: 2013
    },
    techStack: ['React', 'Spring Boot', 'Kotlin', 'AWS', 'MSA', 'Kafka', 'Redis'],
    content: {
      language: 'ko',
      averageLength: 'long',
      postFrequency: 'weekly',
      primaryTopics: ['fintech', 'backend', 'frontend', 'devops', 'architecture'],
      targetAudience: 'advanced'
    },
    links: {
      github: 'https://github.com/toss'
    },
    automated: {
      detectedTechKeywords: ['fintech', 'react', 'spring', 'kotlin'],
      contentQualityScore: 9.2,
      lastProfileUpdate: new Date('2024-12-01')
    }
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
    limit: 10,
    logoUrl: 'https://tech.kakao.com/favicon.ico',
    
    company: {
      name: '카카오',
      industry: 'tech',
      size: 'enterprise',
      location: 'Jeju, KR',
      founded: 1995
    },
    techStack: ['Java', 'Spring', 'React', 'MySQL', 'Redis', 'Kafka', 'Kubernetes'],
    content: {
      language: 'ko',
      averageLength: 'long',
      postFrequency: 'weekly',
      primaryTopics: ['mobile', 'backend', 'ai', 'platform', 'search'],
      targetAudience: 'advanced'
    },
    links: {
      github: 'https://github.com/kakao'
    },
    automated: {
      detectedTechKeywords: ['java', 'spring', 'react', 'ai'],
      contentQualityScore: 9.0,
      lastProfileUpdate: new Date('2024-12-01')
    }
  },

  naver: {
    id: 'naver',
    name: '네이버 D2',
    type: 'corporate',
    baseUrl: 'https://d2.naver.com',
    description: '네이버 개발자들의 기술 이야기',
    isActive: true,
    collectionMethod: 'rss',
    rssUrl: 'https://d2.naver.com/d2.atom',
    limit: 10,
    logoUrl: 'https://d2.naver.com/favicon.ico',
    
    company: {
      name: '네이버',
      industry: 'tech',
      size: 'enterprise',
      location: 'Bundang, KR',
      founded: 1999
    },
    techStack: ['Java', 'JavaScript', 'Spring', 'Node.js', 'AI/ML', 'Search'],
    content: {
      language: 'ko',
      averageLength: 'long',
      postFrequency: 'monthly',
      primaryTopics: ['ai', 'search', 'platform', 'conference', 'research'],
      targetAudience: 'advanced'
    },
    links: {
      github: 'https://github.com/naver'
    },
    automated: {
      detectedTechKeywords: ['ai', 'search', 'java', 'javascript'],
      contentQualityScore: 9.5,
      lastProfileUpdate: new Date('2024-12-01')
    }
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
    limit: 10,
    logoUrl: 'https://techblog.woowahan.com/favicon.ico',
    
    company: {
      name: '우아한형제들',
      industry: 'delivery',
      size: 'large',
      location: 'Seoul, KR',
      founded: 2010
    },
    techStack: ['Java', 'Spring Boot', 'React', 'MySQL', 'Redis', 'AWS'],
    content: {
      language: 'ko',
      averageLength: 'long',
      postFrequency: 'weekly',
      primaryTopics: ['backend', 'devops', 'culture', 'architecture', 'spring'],
      targetAudience: 'intermediate'
    },
    links: {
      github: 'https://github.com/woowacourse'
    },
    automated: {
      detectedTechKeywords: ['java', 'spring', 'react', 'backend'],
      contentQualityScore: 8.8,
      lastProfileUpdate: new Date('2024-12-01')
    }
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
    limit: 10,
    logoUrl: 'https://medium.com/daangn/favicon.ico',
    
    company: {
      name: '당근마켓',
      industry: 'marketplace',
      size: 'large',
      location: 'Seoul, KR',
      founded: 2015
    },
    techStack: ['Ruby on Rails', 'React Native', 'TypeScript', 'PostgreSQL'],
    content: {
      language: 'ko',
      averageLength: 'medium',
      postFrequency: 'weekly',
      primaryTopics: ['mobile', 'backend', 'data', 'culture'],
      targetAudience: 'intermediate'
    },
    automated: {
      detectedTechKeywords: ['mobile', 'react', 'typescript'],
      contentQualityScore: 8.5,
      lastProfileUpdate: new Date('2024-12-01')
    }
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
    limit: 8,
    logoUrl: 'https://blog.banksalad.com/favicon.ico',
    
    company: {
      name: '뱅크샐러드',
      industry: 'fintech',
      size: 'medium',
      location: 'Seoul, KR',
      founded: 2012
    },
    techStack: ['React', 'TypeScript', 'Spring Boot', 'AWS'],
    content: {
      language: 'ko',
      averageLength: 'medium',
      postFrequency: 'monthly',
      primaryTopics: ['frontend', 'backend', 'data', 'fintech'],
      targetAudience: 'intermediate'
    },
    automated: {
      detectedTechKeywords: ['react', 'typescript', 'spring', 'fintech'],
      contentQualityScore: 8.3,
      lastProfileUpdate: new Date('2024-12-01')
    }
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
    limit: 8,
    logoUrl: 'https://tech.socarcorp.kr/favicon.ico',
    
    company: {
      name: '쏘카',
      industry: 'mobility',
      size: 'medium',
      location: 'Seoul, KR',
      founded: 2011
    },
    techStack: ['Python', 'Django', 'React', 'AWS', 'Data Analytics'],
    content: {
      language: 'ko',
      averageLength: 'medium',
      postFrequency: 'monthly',
      primaryTopics: ['backend', 'data', 'devops', 'mobility'],
      targetAudience: 'intermediate'
    },
    links: {
      github: 'https://github.com/socar-inc'
    },
    automated: {
      detectedTechKeywords: ['python', 'django', 'react', 'data'],
      contentQualityScore: 8.1,
      lastProfileUpdate: new Date('2024-12-01')
    }
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
    limit: 8,
    logoUrl: 'https://medium.com/coupang-engineering/favicon.ico',
    
    company: {
      name: '쿠팡',
      industry: 'ecommerce',
      size: 'enterprise',
      location: 'Seoul, KR',
      founded: 2010
    },
    techStack: ['Java', 'Spring', 'AWS', 'Microservices', 'Big Data'],
    content: {
      language: 'en',
      averageLength: 'long',
      postFrequency: 'monthly',
      primaryTopics: ['architecture', 'backend', 'data', 'scale'],
      targetAudience: 'advanced'
    },
    automated: {
      detectedTechKeywords: ['java', 'spring', 'microservices', 'aws'],
      contentQualityScore: 8.7,
      lastProfileUpdate: new Date('2024-12-01')
    }
  },

  // 📚 교육 플랫폼
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
    timeout: 30000,
    
    company: {
      name: '인프런',
      industry: 'education',
      size: 'medium',
      location: 'Seoul, KR'
    },
    content: {
      language: 'ko',
      averageLength: 'long',
      postFrequency: 'daily',
      primaryTopics: ['programming', 'tutorial', 'course', 'web', 'mobile'],
      targetAudience: 'all'
    },
    automated: {
      detectedTechKeywords: ['programming', 'tutorial', 'education'],
      contentQualityScore: 7.8,
      lastProfileUpdate: new Date('2024-12-01')
    }
  },

  // 🎥 YouTube 채널들
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
    limit: 3,
    logoUrl: 'https://yt3.ggpht.com/ytc/AOPolaQrJ7bwWJJjyRJj4kJGksT4RKgw0u6EvVFfJKL1_A=s800-c-k-c0x00ffffff-no-rj',
    
    content: {
      language: 'ko',
      averageLength: 'long',
      postFrequency: 'weekly',
      primaryTopics: ['programming', 'tutorial', 'career', 'web'],
      targetAudience: 'beginner'
    },
    automated: {
      detectedTechKeywords: ['programming', 'tutorial', 'web'],
      contentQualityScore: 7.5,
      lastProfileUpdate: new Date('2024-12-01')
    }
  },

  // 📰 한국 IT 미디어
  eo: {
    id: 'eo',
    name: 'EO 매거진',
    type: 'media',
    baseUrl: 'https://eopla.net',
    description: '고품질 기술 매거진 및 트렌드',
    isActive: true,
    collectionMethod: 'crawler',
    crawlerType: 'eo',
    limit: 8,
    logoUrl: 'https://eopla.net/favicon.ico',
    
    company: {
      name: 'EO',
      industry: 'media',
      size: 'medium',
      location: 'Seoul, KR',
      founded: 2018
    },
    techStack: ['JavaScript', 'React', 'Node.js', 'AWS'],
    content: {
      language: 'ko',
      averageLength: 'medium',
      postFrequency: 'weekly',
      primaryTopics: ['tech', 'startup', 'business', 'trend', 'innovation'],
      targetAudience: 'intermediate'
    },
    automated: {
      detectedTechKeywords: ['tech', 'startup', 'business', 'innovation'],
      contentQualityScore: 8.5,
      lastProfileUpdate: new Date('2024-12-01')
    }
  },

  // 📰 한국 IT 미디어 추가
  yozm: {
    id: 'yozm',
    name: '요즘IT',
    type: 'media',
    baseUrl: 'https://yozm.wishket.com',
    description: 'IT 개발자와 기획자를 위한 전문 미디어',
    isActive: true,
    collectionMethod: 'rss',
    rssUrl: 'https://yozm.wishket.com/rss.xml',
    limit: 8,
    logoUrl: 'https://yozm.wishket.com/favicon.ico',
    
    company: {
      name: '위시켓',
      industry: 'media',
      size: 'medium',
      location: 'Seoul, KR',
      founded: 2012
    },
    content: {
      language: 'ko',
      averageLength: 'long',
      postFrequency: 'weekly',
      primaryTopics: ['programming', 'career', 'startup', 'development'],
      targetAudience: 'intermediate'
    },
    automated: {
      detectedTechKeywords: ['programming', 'development', 'career'],
      contentQualityScore: 8.0,
      lastProfileUpdate: new Date('2024-12-01')
    }
  },

  outstanding: {
    id: 'outstanding',
    name: '아웃스탠딩',
    type: 'media',
    baseUrl: 'https://outstanding.kr',
    description: '비즈니스와 테크 트렌드를 다루는 미디어',
    isActive: true,
    collectionMethod: 'rss',
    rssUrl: 'https://outstanding.kr/feed',
    limit: 8,
    logoUrl: 'https://outstanding.kr/favicon.ico',
    
    company: {
      name: '아웃스탠딩',
      industry: 'media',
      size: 'medium',
      location: 'Seoul, KR',
      founded: 2016
    },
    content: {
      language: 'ko',
      averageLength: 'long',
      postFrequency: 'weekly',
      primaryTopics: ['business', 'startup', 'tech', 'trend'],
      targetAudience: 'intermediate'
    },
    automated: {
      detectedTechKeywords: ['business', 'startup', 'tech'],
      contentQualityScore: 8.2,
      lastProfileUpdate: new Date('2024-12-01')
    }
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
    limit: 6,
    logoUrl: 'https://www.gpters.org/favicon.ico',
    
    company: {
      name: 'GPTERS',
      industry: 'ai',
      size: 'startup',
      location: 'Seoul, KR',
      founded: 2023
    },
    content: {
      language: 'ko',
      averageLength: 'medium',
      postFrequency: 'weekly',
      primaryTopics: ['ai', 'gpt', 'ml', 'tech'],
      targetAudience: 'intermediate'
    },
    automated: {
      detectedTechKeywords: ['ai', 'gpt', 'machine learning'],
      contentQualityScore: 7.8,
      lastProfileUpdate: new Date('2024-12-01')
    }
  },

  // 📚 추가 온라인 강의 플랫폼
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
    timeout: 30000,
    logoUrl: 'https://class101.net/favicon.ico',
    
    company: {
      name: '클래스101',
      industry: 'education',
      size: 'large',
      location: 'Seoul, KR',
      founded: 2018
    },
    content: {
      language: 'ko',
      averageLength: 'medium',
      postFrequency: 'weekly',
      primaryTopics: ['education', 'creative', 'design', 'programming'],
      targetAudience: 'beginner'
    },
    automated: {
      detectedTechKeywords: ['education', 'creative', 'design'],
      contentQualityScore: 7.5,
      lastProfileUpdate: new Date('2024-12-01')
    }
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
    timeout: 30000,
    logoUrl: 'https://coloso.co.kr/favicon.ico',
    
    company: {
      name: '콜로소',
      industry: 'education',
      size: 'medium',
      location: 'Seoul, KR',
      founded: 2019
    },
    content: {
      language: 'ko',
      averageLength: 'long',
      postFrequency: 'weekly',
      primaryTopics: ['design', 'creative', 'art', 'digital'],
      targetAudience: 'advanced'
    },
    automated: {
      detectedTechKeywords: ['design', 'creative', 'art'],
      contentQualityScore: 8.0,
      lastProfileUpdate: new Date('2024-12-01')
    }
  },

  // 🎥 추가 YouTube 교육 채널들
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
    limit: 3,
    logoUrl: 'https://yt3.ggpht.com/ytc/AOPolaS1nFJBOlYKhxB5jLNZ1rjPrKj_bfEF6JWw0FHMFA=s800-c-k-c0x00ffffff-no-rj',
    
    content: {
      language: 'ko',
      averageLength: 'long',
      postFrequency: 'weekly',
      primaryTopics: ['programming', 'web', 'tutorial', 'education'],
      targetAudience: 'beginner'
    },
    automated: {
      detectedTechKeywords: ['programming', 'web', 'tutorial'],
      contentQualityScore: 8.5,
      lastProfileUpdate: new Date('2024-12-01')
    }
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
    limit: 5,
    logoUrl: 'https://yt3.ggpht.com/ytc/AOPolaQrULWaBFhYHb-JgHFREaGlbZpxZvFMGvYG5G7n0g=s800-c-k-c0x00ffffff-no-rj',
    
    content: {
      language: 'ko',
      averageLength: 'long',
      postFrequency: 'weekly',
      primaryTopics: ['programming', 'react', 'nodejs', 'frontend'],
      targetAudience: 'intermediate'
    },
    automated: {
      detectedTechKeywords: ['programming', 'react', 'nodejs'],
      contentQualityScore: 8.3,
      lastProfileUpdate: new Date('2024-12-01')
    }
  },

  coding_with_john: {
    id: 'coding_with_john',
    name: 'YouTube',
    type: 'educational',
    baseUrl: 'https://www.youtube.com/@CodingwithJohn',
    channelName: 'Coding with John',
    description: 'Java 프로그래밍 튜토리얼',
    isActive: true,
    collectionMethod: 'rss',
    rssUrl: 'https://www.youtube.com/feeds/videos.xml?channel_id=UC6V3E7ZYpfwZLMJoJgCqGGA',
    limit: 4,
    logoUrl: 'https://yt3.ggpht.com/ytc/AOPolaT9Pj_eL4mC-OYN1_1CzrXfqkQ1zZ5C-EB8YVi7wA=s800-c-k-c0x00ffffff-no-rj',
    
    content: {
      language: 'en',
      averageLength: 'medium',
      postFrequency: 'weekly',
      primaryTopics: ['java', 'programming', 'tutorial'],
      targetAudience: 'beginner'
    },
    automated: {
      detectedTechKeywords: ['java', 'programming', 'tutorial'],
      contentQualityScore: 8.0,
      lastProfileUpdate: new Date('2024-12-01')
    }
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
    limit: 5,
    logoUrl: 'https://yt3.ggpht.com/ytc/AOPolaRK9TYZ_Q3fKN8pdPTvl8LSY5nHG8L4QHbpA8Jq5Q=s800-c-k-c0x00ffffff-no-rj',
    
    content: {
      language: 'en',
      averageLength: 'medium',
      postFrequency: 'monthly',
      primaryTopics: ['programming', 'tutorial', 'web', 'python'],
      targetAudience: 'all'
    },
    automated: {
      detectedTechKeywords: ['programming', 'tutorial', 'python'],
      contentQualityScore: 8.7,
      lastProfileUpdate: new Date('2024-12-01')
    }
  },

  // 🌍 글로벌 개발자 커뮤니티 추가
  medium: {
    id: 'medium',
    name: 'Medium',
    type: 'community',
    baseUrl: 'https://medium.com',
    description: '전 세계 개발자들의 기술 이야기',
    isActive: true,
    collectionMethod: 'rss',
    rssUrl: 'https://medium.com/feed/tag/javascript',
    limit: 1,
    logoUrl: 'https://medium.com/favicon.ico',
    
    content: {
      language: 'en',
      averageLength: 'medium',
      postFrequency: 'daily',
      primaryTopics: ['programming', 'tech', 'javascript', 'web'],
      targetAudience: 'intermediate'
    },
    automated: {
      detectedTechKeywords: ['programming', 'javascript', 'web'],
      contentQualityScore: 7.0,
      lastProfileUpdate: new Date('2024-12-01')
    }
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
    limit: 1,
    logoUrl: 'https://news.ycombinator.com/favicon.ico',
    
    content: {
      language: 'en',
      averageLength: 'short',
      postFrequency: 'daily',
      primaryTopics: ['tech', 'startup', 'programming', 'science'],
      targetAudience: 'advanced'
    },
    automated: {
      detectedTechKeywords: ['tech', 'startup', 'programming'],
      contentQualityScore: 8.5,
      lastProfileUpdate: new Date('2024-12-01')
    }
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
    limit: 1,
    logoUrl: 'https://www.freecodecamp.org/favicon.ico',
    
    company: {
      name: 'freeCodeCamp',
      industry: 'education',
      size: 'large',
      location: 'San Francisco, US',
      founded: 2014
    },
    content: {
      language: 'en',
      averageLength: 'long',
      postFrequency: 'daily',
      primaryTopics: ['programming', 'tutorial', 'web', 'education'],
      targetAudience: 'beginner'
    },
    automated: {
      detectedTechKeywords: ['programming', 'tutorial', 'education'],
      contentQualityScore: 8.8,
      lastProfileUpdate: new Date('2024-12-01')
    }
  },

  // 🎨 UX/UI 디자인 추가
  medium_ux_collective: {
    id: 'medium_ux_collective',
    name: 'UX Collective',
    type: 'community',
    baseUrl: 'https://uxdesign.cc',
    description: 'UX 디자인 전문 미디움 퍼블리케이션',
    isActive: true,
    collectionMethod: 'rss',
    rssUrl: 'https://uxdesign.cc/feed',
    limit: 1,
    logoUrl: 'https://uxdesign.cc/favicon.ico',
    
    content: {
      language: 'en',
      averageLength: 'medium',
      postFrequency: 'daily',
      primaryTopics: ['ux', 'design', 'product', 'ui'],
      targetAudience: 'intermediate'
    },
    automated: {
      detectedTechKeywords: ['ux', 'design', 'product'],
      contentQualityScore: 7.8,
      lastProfileUpdate: new Date('2024-12-01')
    }
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
    limit: 1,
    logoUrl: 'https://medium.com/favicon.ico',
    
    content: {
      language: 'mixed',
      averageLength: 'medium',
      postFrequency: 'daily',
      primaryTopics: ['ux', 'design', 'product', 'ui'],
      targetAudience: 'intermediate'
    },
    automated: {
      detectedTechKeywords: ['ux', 'design', 'product'],
      contentQualityScore: 7.0,
      lastProfileUpdate: new Date('2024-12-01')
    }
  },

  tistory_design: {
    id: 'tistory_design',
    name: '티스토리 - UX/UI',
    type: 'community',
    baseUrl: 'https://www.tistory.com',
    description: '티스토리의 UX/UI 관련 블로그들',
    isActive: true,
    collectionMethod: 'rss',
    rssUrl: 'https://www.tistory.com/category/UX%2FUI/rss',
    limit: 1,
    logoUrl: 'https://www.tistory.com/favicon.ico',
    
    content: {
      language: 'ko',
      averageLength: 'medium',
      postFrequency: 'weekly',
      primaryTopics: ['ux', 'ui', 'design', 'product'],
      targetAudience: 'beginner'
    },
    automated: {
      detectedTechKeywords: ['ux', 'ui', 'design'],
      contentQualityScore: 6.5,
      lastProfileUpdate: new Date('2024-12-01')
    }
  },

  // 🌍 글로벌 커뮤니티
  dev_to: {
    id: 'dev_to',
    name: 'DEV Community',
    type: 'community',
    baseUrl: 'https://dev.to',
    description: '글로벌 개발자 커뮤니티 플랫폼',
    isActive: true,
    collectionMethod: 'rss',
    rssUrl: 'https://dev.to/feed',
    limit: 1,
    logoUrl: 'https://dev.to/favicon.ico',
    
    content: {
      language: 'en',
      averageLength: 'medium',
      postFrequency: 'daily',
      primaryTopics: ['programming', 'career', 'tutorial', 'community'],
      targetAudience: 'all'
    },
    automated: {
      detectedTechKeywords: ['programming', 'community', 'tutorial'],
      contentQualityScore: 7.2,
      lastProfileUpdate: new Date('2024-12-01')
    }
  }
};

// 프로필이 없는 플랫폼들을 위한 기본 프로필 생성 함수
export function getOrCreateProfile(platformId: string): ExtendedPlatformProfile | null {
  return PLATFORM_PROFILES[platformId] || null;
}

// 모든 프로필 가져오기
export function getAllProfiles(): ExtendedPlatformProfile[] {
  return Object.values(PLATFORM_PROFILES);
}

// 타입별 프로필 가져오기
export function getProfilesByType(type: string): ExtendedPlatformProfile[] {
  return Object.values(PLATFORM_PROFILES).filter(profile => profile.type === type);
}

// 활성 프로필만 가져오기
export function getActiveProfiles(): ExtendedPlatformProfile[] {
  return Object.values(PLATFORM_PROFILES).filter(profile => profile.isActive);
}
import { PlatformConfig, PlatformType } from '@/config/platforms';

// 플랫폼 프로필 확장 정보
export interface ExtendedPlatformProfile extends PlatformConfig {
  // 회사/기관 정보
  company?: {
    name: string;
    industry: string;
    size: 'startup' | 'medium' | 'large' | 'enterprise';
    location: string;
    founded?: number;
  };
  
  // 기술 스택 정보
  techStack?: string[];
  
  // 콘텐츠 메타데이터
  content: {
    language: 'ko' | 'en' | 'mixed';
    averageLength: 'short' | 'medium' | 'long';
    postFrequency: 'daily' | 'weekly' | 'monthly' | 'irregular';
    primaryTopics: string[];
    targetAudience: 'beginner' | 'intermediate' | 'advanced' | 'all';
  };
  
  // 수집 통계
  stats?: {
    lastCollected?: Date;
    averageArticlesPerCollection?: number;
    successRate?: number;
    avgResponseTime?: number;
  };
  
  // 소셜 미디어 & 추가 링크
  links?: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
    newsletter?: string;
  };
  
  // 자동 생성된 메타데이터
  automated: {
    favicon?: string;
    logo?: string;
    primaryColor?: string;
    detectedTechKeywords?: string[];
    contentQualityScore?: number;
    lastProfileUpdate: Date;
  };
}

// 도메인별 플랫폼 자동 분류 규칙
const DOMAIN_CLASSIFICATION_RULES: Record<string, Partial<ExtendedPlatformProfile>> = {
  // 🇰🇷 한국 대기업 기술 블로그
  'toss.tech': {
    company: { name: '토스', industry: 'fintech', size: 'large', location: 'Seoul, KR', founded: 2013 },
    techStack: ['React', 'Spring Boot', 'Kotlin', 'AWS', 'MSA'],
    content: { language: 'ko', averageLength: 'long', postFrequency: 'weekly', primaryTopics: ['fintech', 'backend', 'frontend', 'devops'], targetAudience: 'advanced' },
    links: { github: 'https://github.com/toss' }
  },
  'tech.kakao.com': {
    company: { name: '카카오', industry: 'tech', size: 'enterprise', location: 'Jeju, KR', founded: 1995 },
    techStack: ['Java', 'Spring', 'React', 'MySQL', 'Redis', 'Kafka'],
    content: { language: 'ko', averageLength: 'long', postFrequency: 'weekly', primaryTopics: ['mobile', 'backend', 'ai', 'platform'], targetAudience: 'advanced' },
    links: { github: 'https://github.com/kakao' }
  },
  'd2.naver.com': {
    company: { name: '네이버', industry: 'tech', size: 'enterprise', location: 'Bundang, KR', founded: 1999 },
    techStack: ['Java', 'JavaScript', 'Spring', 'Node.js', 'AI/ML'],
    content: { language: 'ko', averageLength: 'long', postFrequency: 'monthly', primaryTopics: ['ai', 'search', 'platform', 'conference'], targetAudience: 'advanced' },
    links: { github: 'https://github.com/naver' }
  },
  'techblog.woowahan.com': {
    company: { name: '우아한형제들', industry: 'delivery', size: 'large', location: 'Seoul, KR', founded: 2010 },
    techStack: ['Java', 'Spring Boot', 'React', 'MySQL', 'Redis'],
    content: { language: 'ko', averageLength: 'long', postFrequency: 'weekly', primaryTopics: ['backend', 'devops', 'culture', 'architecture'], targetAudience: 'intermediate' },
    links: { github: 'https://github.com/woowacourse' }
  },
  'blog.banksalad.com': {
    company: { name: '뱅크샐러드', industry: 'fintech', size: 'medium', location: 'Seoul, KR', founded: 2012 },
    techStack: ['React', 'TypeScript', 'Spring Boot', 'AWS'],
    content: { language: 'ko', averageLength: 'medium', postFrequency: 'monthly', primaryTopics: ['frontend', 'backend', 'data'], targetAudience: 'intermediate' }
  },
  'tech.socarcorp.kr': {
    company: { name: '쏘카', industry: 'mobility', size: 'medium', location: 'Seoul, KR', founded: 2011 },
    techStack: ['Python', 'Django', 'React', 'AWS', 'Data'],
    content: { language: 'ko', averageLength: 'medium', postFrequency: 'monthly', primaryTopics: ['backend', 'data', 'devops'], targetAudience: 'intermediate' },
    links: { github: 'https://github.com/socar-inc' }
  },
  
  // 🌍 글로벌 플랫폼
  'medium.com': {
    content: { language: 'en', averageLength: 'medium', postFrequency: 'daily', primaryTopics: ['programming', 'web', 'career'], targetAudience: 'all' }
  },
  'dev.to': {
    content: { language: 'en', averageLength: 'medium', postFrequency: 'daily', primaryTopics: ['programming', 'career', 'tutorial'], targetAudience: 'all' }
  },
  'youtube.com': {
    content: { language: 'mixed', averageLength: 'long', postFrequency: 'weekly', primaryTopics: ['tutorial', 'education'], targetAudience: 'all' }
  },
  
  // 📚 교육 플랫폼
  'inflearn.com': {
    company: { name: '인프런', industry: 'education', size: 'medium', location: 'Seoul, KR' },
    content: { language: 'ko', averageLength: 'long', postFrequency: 'daily', primaryTopics: ['programming', 'tutorial', 'course'], targetAudience: 'all' }
  },
  'class101.net': {
    company: { name: '클래스101', industry: 'education', size: 'medium', location: 'Seoul, KR' },
    content: { language: 'ko', averageLength: 'long', postFrequency: 'weekly', primaryTopics: ['creative', 'design', 'programming'], targetAudience: 'beginner' }
  },
  'coloso.co.kr': {
    company: { name: '콜로소', industry: 'education', size: 'medium', location: 'Seoul, KR' },
    content: { language: 'ko', averageLength: 'long', postFrequency: 'weekly', primaryTopics: ['creative', 'design'], targetAudience: 'intermediate' }
  }
};

// URL에서 도메인 추출
function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch {
    return '';
  }
}

// 플랫폼 자동 프로필 생성
export class PlatformProfileManager {
  
  // 기본 플랫폼 설정에서 확장된 프로필 생성
  static generateExtendedProfile(platform: PlatformConfig): ExtendedPlatformProfile {
    const domain = extractDomain(platform.baseUrl);
    const domainRules = DOMAIN_CLASSIFICATION_RULES[domain] || {};
    
    // 기본 프로필 생성
    const extendedProfile: ExtendedPlatformProfile = {
      ...platform,
      content: {
        language: 'ko',
        averageLength: 'medium',
        postFrequency: 'weekly',
        primaryTopics: ['tech'],
        targetAudience: 'intermediate',
        ...domainRules.content
      },
      automated: {
        detectedTechKeywords: this.detectTechKeywords(platform),
        lastProfileUpdate: new Date()
      },
      ...domainRules
    };
    
    return extendedProfile;
  }
  
  // 플랫폼 이름과 설명에서 기술 키워드 자동 추출
  private static detectTechKeywords(platform: PlatformConfig): string[] {
    const text = `${platform.name} ${platform.description}`.toLowerCase();
    
    const techKeywords = [
      'react', 'vue', 'angular', 'javascript', 'typescript',
      'python', 'java', 'kotlin', 'swift', 'go', 'rust',
      'spring', 'django', 'express', 'fastapi',
      'aws', 'gcp', 'azure', 'docker', 'kubernetes',
      'mysql', 'postgresql', 'mongodb', 'redis',
      'ai', 'ml', 'data', 'backend', 'frontend', 'devops',
      '머신러닝', '인공지능', '데이터', '프론트엔드', '백엔드'
    ];
    
    return techKeywords.filter(keyword => text.includes(keyword));
  }
  
  // 새 플랫폼 추가시 자동 프로필 생성
  static async autoGenerateProfile(
    baseUrl: string, 
    name?: string,
    additionalInfo?: Partial<PlatformConfig>
  ): Promise<ExtendedPlatformProfile> {
    
    // 웹사이트 메타데이터 자동 수집
    const metadata = await this.fetchWebsiteMetadata(baseUrl);
    
    // 기본 플랫폼 설정 생성
    const basicPlatform: PlatformConfig = {
      id: this.generateId(baseUrl),
      name: name || metadata.title || 'Unknown Platform',
      type: this.inferPlatformType(baseUrl, metadata),
      baseUrl: baseUrl,
      description: metadata.description || '자동 생성된 플랫폼',
      isActive: true,
      collectionMethod: this.inferCollectionMethod(baseUrl),
      limit: 8,
      ...additionalInfo
    };
    
    // RSS URL 자동 감지
    if (basicPlatform.collectionMethod === 'rss') {
      basicPlatform.rssUrl = await this.detectRssUrl(baseUrl);
    }
    
    // 확장된 프로필 생성
    const extendedProfile = this.generateExtendedProfile(basicPlatform);
    
    // 자동 생성된 메타데이터 추가
    extendedProfile.automated = {
      ...extendedProfile.automated,
      favicon: metadata.favicon,
      logo: metadata.logo,
      primaryColor: metadata.themeColor
    };
    
    return extendedProfile;
  }
  
  // 웹사이트 메타데이터 수집 (로고 포함)
  private static async fetchWebsiteMetadata(url: string): Promise<{
    title?: string;
    description?: string;
    favicon?: string;
    logo?: string;
    themeColor?: string;
  }> {
    try {
      // 기본 URL 정리
      const baseUrl = url.replace(/\/$/, '');
      
      // 일반적인 로고 및 파비콘 경로들
      const logoPatterns = [
        '/logo.png',
        '/logo.svg', 
        '/assets/logo.png',
        '/assets/logo.svg',
        '/images/logo.png',
        '/images/logo.svg',
        '/static/logo.png',
        '/static/logo.svg'
      ];
      
      const faviconPatterns = [
        '/favicon.ico',
        '/favicon.png', 
        '/favicon.svg',
        '/assets/favicon.ico',
        '/static/favicon.ico'
      ];
      
      // 로고 URL 감지 시도
      let detectedLogo: string | undefined;
      let detectedFavicon: string | undefined;
      
      // 파비콘 먼저 시도 (더 일반적)
      for (const pattern of faviconPatterns) {
        const faviconUrl = `${baseUrl}${pattern}`;
        if (await this.checkImageExists(faviconUrl)) {
          detectedFavicon = faviconUrl;
          break;
        }
      }
      
      // 로고 이미지 시도
      for (const pattern of logoPatterns) {
        const logoUrl = `${baseUrl}${pattern}`;
        if (await this.checkImageExists(logoUrl)) {
          detectedLogo = logoUrl;
          break;
        }
      }
      
      return {
        title: extractDomain(url),
        description: `${extractDomain(url)}의 콘텐츠`,
        favicon: detectedFavicon || `${baseUrl}/favicon.ico`,
        logo: detectedLogo || detectedFavicon || `${baseUrl}/favicon.ico`
      };
    } catch (error) {
      console.warn('메타데이터 수집 실패:', error);
      const baseUrl = url.replace(/\/$/, '');
      return {
        title: extractDomain(url),
        description: `${extractDomain(url)}의 콘텐츠`,
        favicon: `${baseUrl}/favicon.ico`,
        logo: `${baseUrl}/favicon.ico`
      };
    }
  }
  
  // 이미지 존재 여부 확인
  private static async checkImageExists(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok && response.headers.get('content-type')?.startsWith('image/');
    } catch {
      return false;
    }
  }
  
  // 플랫폼 타입 자동 추론
  private static inferPlatformType(url: string, metadata: any): PlatformType {
    const domain = extractDomain(url).toLowerCase();
    
    // 도메인 기반 분류
    if (domain.includes('youtube.com')) return 'educational';
    if (domain.includes('medium.com')) return 'community';
    if (domain.includes('dev.to')) return 'community';
    if (domain.includes('blog') || domain.includes('tech')) return 'corporate';
    if (domain.includes('inflearn') || domain.includes('class101') || domain.includes('coloso')) return 'educational';
    
    // 기본값
    return 'corporate';
  }
  
  // 수집 방법 자동 추론
  private static inferCollectionMethod(url: string): 'rss' | 'crawler' | 'api' {
    const domain = extractDomain(url).toLowerCase();
    
    // 알려진 RSS 지원 플랫폼
    if (domain.includes('medium.com') || domain.includes('youtube.com') || domain.includes('dev.to')) {
      return 'rss';
    }
    
    // 한국 기업 블로그들은 대부분 RSS 지원
    if (domain.includes('.tech') || domain.includes('techblog') || domain.includes('blog')) {
      return 'rss';
    }
    
    // 기본값은 크롤러
    return 'crawler';
  }
  
  // RSS URL 자동 감지
  private static async detectRssUrl(baseUrl: string): Promise<string | undefined> {
    const commonRssPaths = [
      '/rss.xml',
      '/feed.xml',
      '/atom.xml',
      '/feed',
      '/rss',
      '/feeds/all.atom.xml'
    ];
    
    const domain = extractDomain(baseUrl);
    
    // Medium 특별 처리
    if (domain.includes('medium.com')) {
      const path = new URL(baseUrl).pathname;
      return `https://medium.com/feed${path}`;
    }
    
    // YouTube 특별 처리
    if (domain.includes('youtube.com')) {
      // 채널 ID 추출이 필요 - 실제로는 더 복잡한 로직 필요
      return undefined; // 수동 설정 필요
    }
    
    // 일반적인 RSS 경로 시도
    for (const path of commonRssPaths) {
      const rssUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) + path : baseUrl + path;
      try {
        const response = await fetch(rssUrl, { method: 'HEAD' });
        if (response.ok) {
          return rssUrl;
        }
      } catch {
        continue;
      }
    }
    
    return undefined;
  }
  
  // URL에서 고유 ID 생성
  private static generateId(url: string): string {
    const domain = extractDomain(url);
    return domain
      .replace(/\./g, '_')
      .replace(/[^a-zA-Z0-9_]/g, '')
      .toLowerCase();
  }
}
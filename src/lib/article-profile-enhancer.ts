import { Article, Platform, Author } from '@/types/article';
import { getOrCreateProfile } from '@/config/platform-profiles';
import { ExtendedPlatformProfile } from './platform-profile-manager';

/**
 * 아티클에 플랫폼 프로필 정보를 통합하는 클래스
 */
export class ArticleProfileEnhancer {
  
  /**
   * 아티클에 확장된 플랫폼 프로필 정보를 적용
   */
  static enhanceArticle(article: Article): Article {
    const platformProfile = getOrCreateProfile(article.platform.id);
    
    if (!platformProfile) {
      return article; // 프로필이 없으면 원본 반환
    }
    
    // 플랫폼 정보 업그레이드
    const enhancedPlatform = this.enhancePlatformInfo(article.platform, platformProfile);
    
    // 작성자 정보 업그레이드
    const enhancedAuthor = this.enhanceAuthorInfo(article.author, platformProfile);
    
    // 아티클 메타데이터 업그레이드
    const enhancedMetadata = this.enhanceArticleMetadata(article, platformProfile);
    
    return {
      ...article,
      platform: enhancedPlatform,
      author: enhancedAuthor,
      ...enhancedMetadata
    };
  }
  
  /**
   * 플랫폼 정보에 프로필 데이터 추가
   */
  private static enhancePlatformInfo(platform: Platform, profile: ExtendedPlatformProfile): Platform {
    // 기존 플랫폼이 간단한 구조인 경우 확장
    const basePlatform = {
      id: platform.id || profile.id,
      name: platform.name || profile.name,
      type: platform.type || profile.type,
      baseUrl: platform.baseUrl || profile.baseUrl,
      description: platform.description || profile.description,
      isActive: platform.isActive ?? profile.isActive,
      lastCrawled: platform.lastCrawled,
      rssUrl: platform.rssUrl || profile.rssUrl,
      logoUrl: platform.logoUrl,
      channelName: platform.channelName || profile.channelName,
      ...platform
    };
    
    return {
      ...basePlatform,
      // 기존 플랫폼 정보 유지하면서 프로필 정보 추가
      description: profile.description,
      logoUrl: basePlatform.logoUrl || profile.automated?.logo || profile.automated?.favicon,
      
      // 확장된 플랫폼 메타데이터 추가
      metadata: {
        ...basePlatform.metadata,
        company: profile.company,
        techStack: profile.techStack,
        content: profile.content,
        industry: profile.company?.industry,
        size: profile.company?.size,
        location: profile.company?.location,
        founded: profile.company?.founded,
        qualityScore: profile.automated?.contentQualityScore,
        links: profile.links,
        favicon: profile.automated?.favicon,
        logo: profile.automated?.logo || profile.automated?.favicon,
        primaryColor: profile.automated?.primaryColor
      }
    };
  }
  
  /**
   * 작성자 정보에 플랫폼 프로필 데이터 반영
   */
  private static enhanceAuthorInfo(author: Author, profile: ExtendedPlatformProfile): Author {
    const companyName = profile.company?.name || profile.name;
    
    // 기존 author가 단순 객체인 경우 확장
    const baseAuthor = {
      id: author.id || `${profile.id}-author`,
      name: author.name || profile.name,
      company: author.company || companyName,
      expertise: author.expertise || [],
      articleCount: author.articleCount || 0,
      ...author
    };
    
    return {
      ...baseAuthor,
      company: companyName,
      
      // 기술 전문성 정보 추가
      expertise: [
        ...new Set([
          ...(baseAuthor.expertise || []),
          ...(profile.content?.primaryTopics || []),
          ...(profile.techStack?.slice(0, 3) || []) // 상위 3개 기술만
        ])
      ],
      
      // 플랫폼 기반 추가 정보
      bio: baseAuthor.bio || this.generateAuthorBio(baseAuthor, profile),
      socialLinks: {
        ...baseAuthor.socialLinks,
        github: profile.links?.github,
        twitter: profile.links?.twitter,
        linkedin: profile.links?.linkedin
      }
    };
  }
  
  /**
   * 작성자 소개 자동 생성
   */
  private static generateAuthorBio(author: Author, profile: ExtendedPlatformProfile): string {
    const existing = author.bio || '';
    if (existing) return existing;
    
    const company = profile.company?.name || profile.name;
    const role = this.inferAuthorRole(profile);
    const expertise = profile.content?.primaryTopics?.slice(0, 2).join(', ') || 'technology';
    
    return `${company}에서 ${role}로 활동하며 ${expertise} 분야의 전문성을 가지고 있습니다.`;
  }
  
  /**
   * 플랫폼 정보에서 작성자 역할 추론
   */
  private static inferAuthorRole(profile: ExtendedPlatformProfile): string {
    if (profile.type === 'corporate') {
      return '개발자';
    } else if (profile.type === 'educational') {
      return '강사';
    } else if (profile.type === 'media') {
      return '에디터';
    } else if (profile.type === 'community') {
      return '기여자';
    }
    return '전문가';
  }
  
  /**
   * 아티클 메타데이터 업그레이드
   */
  private static enhanceArticleMetadata(article: Article, profile: ExtendedPlatformProfile): Partial<Article> {
    const enhancements: Partial<Article> = {};
    
    // 카테고리 개선
    if (!article.category || article.category === 'general') {
      const primaryTopic = profile.content?.primaryTopics?.[0];
      if (primaryTopic) {
        enhancements.category = this.mapTopicToCategory(primaryTopic);
      }
    }
    
    // 태그 개선
    const additionalTags = [
      ...(profile.content?.primaryTopics?.slice(0, 3) || []),
      ...(profile.techStack?.slice(0, 2) || []),
      profile.company?.industry || ''
    ].filter(Boolean);
    
    enhancements.tags = [
      ...new Set([
        ...(article.tags || []),
        ...additionalTags
      ])
    ];
    
    // 품질 점수 적용
    if (profile.automated?.contentQualityScore) {
      enhancements.qualityScore = Math.max(
        article.qualityScore || 0,
        profile.automated.contentQualityScore
      );
    }
    
    // 읽기 시간 조정 (프로필의 평균 길이 정보 활용)
    if (profile.content?.averageLength && !article.readingTime) {
      const lengthMultiplier = {
        'short': 0.8,
        'medium': 1.0,
        'long': 1.5
      };
      
      const multiplier = lengthMultiplier[profile.content.averageLength] || 1.0;
      enhancements.readingTime = Math.ceil((article.content?.length || 1000) / 200 * multiplier);
    }
    
    return enhancements;
  }
  
  /**
   * 주제를 카테고리로 매핑
   */
  private static mapTopicToCategory(topic: string): import('@/types/article').ArticleCategory {
    const topicCategoryMap: Record<string, import('@/types/article').ArticleCategory> = {
      'frontend': 'frontend',
      'backend': 'backend', 
      'mobile': 'mobile',
      'ai': 'ai-ml',
      'data': 'data',
      'devops': 'cloud-infra',
      'fintech': 'general',
      'architecture': 'general',
      'tutorial': 'lecture',
      'programming': 'general',
      'design': 'design',
      'career': 'general'
    };
    
    return topicCategoryMap[topic.toLowerCase()] || 'general';
  }
  
  /**
   * 여러 아티클에 대해 일괄 프로필 적용
   */
  static enhanceArticles(articles: Article[]): Article[] {
    return articles.map(article => this.enhanceArticle(article));
  }
  
  /**
   * 플랫폼별 아티클 통계 생성
   */
  static generatePlatformStats(articles: Article[]): Record<string, {
    count: number;
    avgQuality: number;
    categories: Record<string, number>;
    company?: string;
    industry?: string;
  }> {
    const stats: Record<string, {
      count: number;
      totalQuality: number;
      categories: Record<string, number>;
      company?: string;
      industry?: string;
      avgQuality?: number;
    }> = {};
    
    articles.forEach(article => {
      const platformId = article.platform.id;
      
      if (!stats[platformId]) {
        stats[platformId] = {
          count: 0,
          totalQuality: 0,
          categories: {},
          company: article.platform.metadata?.company?.name,
          industry: article.platform.metadata?.industry
        };
      }
      
      stats[platformId].count++;
      stats[platformId].totalQuality += article.qualityScore || 0;
      
      const category = article.category || 'unknown';
      stats[platformId].categories[category] = (stats[platformId].categories[category] || 0) + 1;
    });
    
    // 평균 계산 및 타입 변환
    const finalStats: Record<string, {
      count: number;
      avgQuality: number;
      categories: Record<string, number>;
      company?: string;
      industry?: string;
    }> = {};
    
    Object.keys(stats).forEach(platformId => {
      const stat = stats[platformId];
      finalStats[platformId] = {
        count: stat.count,
        avgQuality: stat.totalQuality / stat.count,
        categories: stat.categories,
        company: stat.company,
        industry: stat.industry
      };
    });
    
    return finalStats;
  }
}

// 유틸리티 함수들
export function enhanceArticleWithProfile(article: Article): Article {
  return ArticleProfileEnhancer.enhanceArticle(article);
}

export function enhanceArticlesWithProfiles(articles: Article[]): Article[] {
  return ArticleProfileEnhancer.enhanceArticles(articles);
}

export function generateEnhancedPlatformStats(articles: Article[]) {
  return ArticleProfileEnhancer.generatePlatformStats(articles);
}
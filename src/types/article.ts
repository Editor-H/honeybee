export interface Author {
  id: string;
  name: string;
  avatar?: string;
  company: string;
  expertise: string[];
  articleCount: number;
  followerCount?: number;
  bio?: string;
  socialLinks?: {
    github?: string;
    twitter?: string;
    linkedin?: string;
    website?: string;
  };
}

export interface Platform {
  id: string;
  name: string;
  type: 'corporate' | 'personal' | 'community' | 'educational' | 'media' | 'docs';
  baseUrl: string;
  logoUrl?: string;
  channelName?: string; // YouTube 채널의 실제 채널명
  description: string;
  isActive: boolean;
  lastCrawled?: Date;
  rssUrl?: string;
  // 확장된 플랫폼 메타데이터
  metadata?: {
    company?: {
      name: string;
      industry: string;
      size: 'startup' | 'medium' | 'large' | 'enterprise';
      location: string;
      founded?: number;
    };
    techStack?: string[];
    content?: {
      language: 'ko' | 'en' | 'mixed';
      averageLength: 'short' | 'medium' | 'long';
      postFrequency: 'daily' | 'weekly' | 'monthly' | 'irregular';
      primaryTopics: string[];
      targetAudience: 'beginner' | 'intermediate' | 'advanced' | 'all';
    };
    industry?: string;
    size?: string;
    location?: string;
    founded?: number;
    qualityScore?: number;
    links?: {
      github?: string;
      linkedin?: string;
      twitter?: string;
      facebook?: string;
      instagram?: string;
      newsletter?: string;
    };
    favicon?: string;
    logo?: string;
    primaryColor?: string;
  };
}

export interface Article {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  author: Author;
  platform: Platform;
  category: ArticleCategory;
  tags: string[];
  publishedAt: Date;
  viewCount?: number;
  likeCount?: number;
  commentCount?: number;
  readingTime: number; // minutes
  trending: boolean;
  featured: boolean;
  url: string;
  // 콘텐츠 타입별 지원
  contentType: 'article' | 'video' | 'lecture';
  videoUrl?: string;
  videoDuration?: number; // seconds
  thumbnailUrl?: string;
  watchCount?: number; // 영상 조회수 (viewCount와 구분)
  // 강의 전용 속성들
  coursePrice?: number; // 강의 가격 (원)
  courseDuration?: number; // 강의 총 시간 (분)
  courseLevel?: 'beginner' | 'intermediate' | 'advanced'; // 강의 레벨
  courseInstructor?: string; // 강사명
  courseStudentCount?: number; // 수강생 수
  courseRating?: number; // 강의 평점 (1-5)
  // 품질 및 메타데이터
  qualityScore?: number;
  summary?: string; // content와 구분되는 요약
}

export type ArticleCategory = 
  | 'frontend'
  | 'backend' 
  | 'ai-ml'
  | 'cloud-infra'
  | 'game'
  | 'graphics'
  | 'office'
  | 'design'
  | 'product'
  | 'mobile'
  | 'data'
  | 'security'
  | 'events'
  | 'lecture'
  | 'general';

export interface TrendingKeyword {
  keyword: string;
  count: number;
  growth: number; // percentage
  relatedArticles: string[]; // article IDs
  category: ArticleCategory;
}

export interface DashboardStats {
  hotArticles: number;
  hotKeywords: number;
  notableAuthors: number;
  newPlatforms: number;
  lastUpdated: Date;
}

export interface SearchFilters {
  category?: ArticleCategory;
  platform?: string;
  author?: string;
  dateRange?: {
    from: Date;
    to: Date;
  };
  tags?: string[];
  trending?: boolean;
}
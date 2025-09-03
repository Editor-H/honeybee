export interface Author {
  id: string;
  name: string;
  avatar?: string;
  company: string;
  expertise: string[];
  articleCount: number;
  followerCount?: number;
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
  // 영상 콘텐츠 지원
  contentType: 'article' | 'video';
  videoUrl?: string;
  videoDuration?: number; // seconds
  thumbnailUrl?: string;
  watchCount?: number; // 영상 조회수 (viewCount와 구분)
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
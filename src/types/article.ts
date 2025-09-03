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
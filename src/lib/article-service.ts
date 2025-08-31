import { supabase } from './supabase';
import { Article } from '@/types/article';

export interface ArticleFilters {
  platform_id?: string;
  category?: string;
  content_type?: 'article' | 'video';
  trending?: boolean;
  search?: string;
  tags?: string[];
  date_from?: string;
  date_to?: string;
}

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface ArticlesResponse {
  articles: Article[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Article 타입을 DB 스키마로 변환
function articleToDbRecord(article: Article) {
  return {
    id: article.id,
    title: article.title,
    content: article.content,
    excerpt: article.excerpt,
    url: article.url,
    
    author_id: article.author.id,
    author_name: article.author.name,
    author_company: article.author.company,
    
    platform_id: article.platform.id,
    platform_name: article.platform.name,
    platform_type: article.platform.type,
    
    content_type: article.contentType,
    category: article.category,
    tags: article.tags,
    
    video_url: article.videoUrl || null,
    video_duration: article.videoDuration || null,
    thumbnail_url: article.thumbnailUrl || null,
    
    view_count: article.viewCount || 0,
    like_count: article.likeCount || 0,
    comment_count: article.commentCount || 0,
    watch_count: article.watchCount || 0,
    reading_time: article.readingTime || 0,
    
    trending: article.trending,
    featured: article.featured,
    is_active: true,
    
    published_at: article.publishedAt.toISOString()
  };
}

// DB 레코드를 Article 타입으로 변환
function dbRecordToArticle(record: Record<string, unknown>): Article {
  return {
    id: record.id,
    title: record.title,
    content: record.content || '',
    excerpt: record.excerpt || '',
    url: record.url,
    
    author: {
      id: record.author_id,
      name: record.author_name,
      company: record.author_company,
      expertise: ['Tech'],
      articleCount: 0
    },
    
    platform: {
      id: record.platform_id,
      name: record.platform_name,
      type: record.platform_type,
      baseUrl: '',
      description: '',
      isActive: true,
      lastCrawled: new Date()
    },
    
    contentType: record.content_type,
    category: record.category,
    tags: record.tags || [],
    
    videoUrl: record.video_url,
    videoDuration: record.video_duration,
    thumbnailUrl: record.thumbnail_url,
    
    viewCount: record.view_count,
    likeCount: record.like_count,
    commentCount: record.comment_count,
    watchCount: record.watch_count,
    readingTime: record.reading_time,
    
    trending: record.trending,
    featured: record.featured,
    
    publishedAt: new Date(record.published_at)
  };
}

export class ArticleService {
  
  // 아티클 일괄 삽입/업데이트 (RSS 수집용)
  static async upsertArticles(articles: Article[]): Promise<void> {
    const dbRecords = articles.map(articleToDbRecord);
    
    const { error } = await supabase
      .from('articles')
      .upsert(dbRecords, {
        onConflict: 'url',
        ignoreDuplicates: false
      });
    
    if (error) {
      console.error('아티클 저장 실패:', error);
      throw new Error(`아티클 저장 실패: ${error.message}`);
    }
    
    console.log(`${articles.length}개 아티클을 데이터베이스에 저장했습니다`);
  }
  
  // 페이지네이션으로 아티클 조회
  static async getArticles(
    filters: ArticleFilters = {},
    pagination: PaginationOptions = { page: 1, limit: 20 }
  ): Promise<ArticlesResponse> {
    let query = supabase
      .from('articles')
      .select('*', { count: 'exact' })
      .eq('is_active', true)
      .order('published_at', { ascending: false });
    
    // 필터 적용
    if (filters.platform_id) {
      query = query.eq('platform_id', filters.platform_id);
    }
    
    if (filters.category) {
      query = query.eq('category', filters.category);
    }
    
    if (filters.content_type) {
      query = query.eq('content_type', filters.content_type);
    }
    
    if (filters.trending !== undefined) {
      query = query.eq('trending', filters.trending);
    }
    
    // 전문 검색 (제목, 내용, 요약에서 검색)
    if (filters.search) {
      const searchTerms = filters.search.trim().split(/\s+/).join(' & ');
      query = query.or(`
        title.ilike.%${filters.search}%,
        content.ilike.%${filters.search}%,
        excerpt.ilike.%${filters.search}%,
        platform_name.ilike.%${filters.search}%
      `);
    }
    
    // 태그 필터링
    if (filters.tags && filters.tags.length > 0) {
      const tagConditions = filters.tags.map(tag => `tags.cs.["${tag}"]`).join(',');
      query = query.or(tagConditions);
    }
    
    // 날짜 범위 필터링
    if (filters.date_from) {
      query = query.gte('published_at', filters.date_from);
    }
    
    if (filters.date_to) {
      query = query.lte('published_at', filters.date_to);
    }
    
    // 페이지네이션
    const offset = (pagination.page - 1) * pagination.limit;
    query = query.range(offset, offset + pagination.limit - 1);
    
    const { data, error, count } = await query;
    
    if (error) {
      console.error('아티클 조회 실패:', error);
      throw new Error(`아티클 조회 실패: ${error.message}`);
    }
    
    const articles = (data || []).map(dbRecordToArticle);
    const total = count || 0;
    const hasMore = offset + pagination.limit < total;
    
    return {
      articles,
      total,
      page: pagination.page,
      limit: pagination.limit,
      hasMore
    };
  }
  
  // 최신 아티클 조회 (캐시 대체용)
  static async getRecentArticles(limit: number = 100): Promise<Article[]> {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('is_active', true)
      .order('published_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('최신 아티클 조회 실패:', error);
      throw new Error(`최신 아티클 조회 실패: ${error.message}`);
    }
    
    return (data || []).map(dbRecordToArticle);
  }
  
  // 특정 아티클 조회
  static async getArticleById(id: string): Promise<Article | null> {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') { // No rows found
        return null;
      }
      console.error('아티클 조회 실패:', error);
      throw new Error(`아티클 조회 실패: ${error.message}`);
    }
    
    return dbRecordToArticle(data);
  }
  
  // 통계 조회
  static async getArticleStats() {
    const { data, error } = await supabase.rpc('get_article_stats');
    
    if (error) {
      console.error('통계 조회 실패:', error);
      return {
        total: 0,
        today: 0,
        trending: 0,
        videos: 0
      };
    }
    
    return data;
  }
}
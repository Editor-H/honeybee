import { Article, Author, Platform, ArticleCategory } from '@/types/article';
import Parser from 'rss-parser';
import { calculateQualityScore, filterHighQualityArticles, suggestTags } from './content-quality-scorer';

// Velog API types
interface VelogUser {
  username: string;
  profile?: {
    display_name?: string;
    thumbnail?: string;
  };
}

interface VelogTag {
  name: string;
}

interface VelogPost {
  id: string;
  title: string;
  short_description?: string;
  url_slug: string;
  released_at?: string;
  updated_at: string;
  likes?: number;
  comments_count?: number;
  stats?: {
    total?: number;
  };
  user?: VelogUser;
  tags?: VelogTag[];
  thumbnail?: string;
}

export class VelogCollector {
  private baseUrl = 'https://v2.velog.io';
  
  async collectTrendingArticles(limit: number = 8): Promise<Article[]> {
    try {
      console.log('🔥 Velog 고품질 글 수집 시작...');
      
      // 우선 RSS에서 가져와서 고품질 필터링
      console.log('🔄 RSS에서 가져와서 고품질 필터링...');
      return await this.collectFromRSS(limit);
      
    } catch (error) {
      console.error('❌ Velog 수집 실패:', error);
      return [];
    }
  }

  private isHighQualityPost(post: VelogPost): boolean {
    // 고품질 글 판별 기준
    const likes = post.likes || 0;
    const commentsCount = post.comments_count || 0;
    const totalStats = post.stats?.total || 0;
    const hasDescription = post.short_description && post.short_description.length > 50;
    const hasTags = post.tags && post.tags.length > 0;
    
    // 최소 기준: 좋아요 5개 이상 또는 댓글 2개 이상 또는 조회수 100 이상
    const hasEngagement = likes >= 5 || commentsCount >= 2 || totalStats >= 100;
    
    // 기술 관련 태그 확인
    const techTags = ['javascript', 'react', 'vue', 'typescript', 'python', 'java', 
                     'node', 'frontend', 'backend', 'web', 'app', 'dev', 'programming',
                     '개발', '프론트엔드', '백엔드', '웹개발', '앱개발', 'AI', 'ML'];
    
    const hasTechTags = post.tags?.some(tag => 
      techTags.some(techTag => 
        tag.name.toLowerCase().includes(techTag.toLowerCase())
      )
    ) || false;

    return hasEngagement && hasDescription && hasTechTags;
  }

  private transformToArticle(post: VelogPost): Article {
    const author: Author = {
      id: `velog-${post.user?.username || 'unknown'}`,
      name: post.user?.profile?.display_name || post.user?.username || 'Unknown',
      company: 'Velog',
      expertise: ['Tech'],
      articleCount: 0,
      avatar: post.user?.profile?.thumbnail
    };

    const platform: Platform = {
      id: 'velog',
      name: 'Velog',
      type: 'community' as const,
      baseUrl: 'https://velog.io',
      logoUrl: '/icons/velog.svg',
      description: 'Velog 기술 블로그 플랫폼',
      isActive: true
    };

    const url = `https://velog.io/@${post.user?.username}/${post.url_slug}`;
    
    return {
      id: `velog-${post.id}`,
      title: post.title,
      content: post.short_description || '',
      excerpt: (post.short_description || '').substring(0, 200),
      summary: post.short_description || '',
      url,
      publishedAt: new Date(post.released_at || post.updated_at),
      author,
      platform,
      tags: post.tags?.map(tag => tag.name) || [],
      category: this.categorizePost(post.tags),
      contentType: 'article' as const,
      readingTime: Math.max(1, Math.ceil((post.short_description || '').length / 200)),
      trending: (post.likes || 0) > 10,
      featured: (post.likes || 0) > 20,
      qualityScore: this.calculateVelogQualityScore(post),
      thumbnailUrl: post.thumbnail,
      viewCount: post.stats?.total,
      likeCount: post.likes,
      commentCount: post.comments_count
    };
  }

  private categorizePost(tags: VelogTag[]): ArticleCategory {
    if (!tags || tags.length === 0) return 'general';
    
    const tagNames = tags.map(tag => tag.name.toLowerCase());
    
    if (tagNames.some(tag => ['react', 'vue', 'frontend', '프론트엔드'].includes(tag))) {
      return 'frontend';
    }
    if (tagNames.some(tag => ['backend', 'server', '백엔드', 'api'].includes(tag))) {
      return 'backend';
    }
    if (tagNames.some(tag => ['ui', 'ux', 'design', '디자인'].includes(tag))) {
      return 'design';
    }
    if (tagNames.some(tag => ['ai', 'ml', 'machine learning', '인공지능'].includes(tag))) {
      return 'ai-ml';
    }
    
    return 'general';
  }

  private calculateVelogQualityScore(post: VelogPost): number {
    let score = 50; // 기본 점수
    
    // 좋아요 기반 점수 (최대 +25점)
    score += Math.min(post.likes * 2, 25);
    
    // 댓글 수 기반 점수 (최대 +15점)
    score += Math.min(post.comments_count * 3, 15);
    
    // 조회수 기반 점수 (최대 +10점)
    if (post.stats?.total) {
      score += Math.min(Math.floor(post.stats.total / 100), 10);
    }
    
    return Math.min(score, 100);
  }

  // RSS 폴백 방식 (기존 방식)
  private async collectFromRSS(limit: number): Promise<Article[]> {
    try {
      const parser = new Parser();
      
      const feed = await parser.parseURL('https://v2.velog.io/rss');
      const allItems = feed.items || [];
      
      // 고품질 기준으로 필터링
      const qualityItems = allItems.filter(item => {
        const title = item.title || '';
        const content = item.contentSnippet || '';
        
        // 엄격한 품질 기준
        const hasGoodLength = title.length > 10 && content.length > 100;
        const hasDevKeywords = this.hasDevKeywords(title + ' ' + content);
        const notTooOld = new Date(item.pubDate || 0) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30일 이내
        const hasReasonableTitle = !this.hasSpamIndicators(title);
        
        console.log(`🔍 "${title.substring(0, 50)}" - Length: ${hasGoodLength}, DevKeywords: ${hasDevKeywords}, Recent: ${notTooOld}, Clean: ${hasReasonableTitle}`);
        
        return hasGoodLength && hasDevKeywords && notTooOld && hasReasonableTitle; // 모든 조건 AND
      });
      
      // 상위 항목만 선택
      const items = qualityItems.slice(0, limit);
      
      return items.map((item, index) => {
        const author: Author = {
          id: `velog-${item.creator || item.author || 'unknown'}`,
          name: item.creator || item.author || 'Velog User',
          company: 'Velog',
          expertise: ['Tech'],
          articleCount: 0
        };

        const platform: Platform = {
          id: 'velog',
          name: 'Velog',
          type: 'community' as const,
          baseUrl: 'https://velog.io',
          logoUrl: '/icons/velog.svg',
          description: 'Velog 기술 블로그 플랫폼',
          isActive: true
        };

        const article: Article = {
          id: `velog-rss-${Date.now()}-${index}`,
          title: item.title || 'Untitled',
          content: item.contentSnippet || item.content || '',
          excerpt: (item.contentSnippet || item.content || '').substring(0, 200),
          summary: item.contentSnippet?.substring(0, 200) || '',
          url: item.link || '',
          publishedAt: new Date(item.pubDate || Date.now()),
          author,
          platform,
          tags: [], // 임시로 빈 배열
          category: 'general' as ArticleCategory,
          contentType: 'article' as const,
          readingTime: Math.max(1, Math.ceil((item.contentSnippet || '').length / 200)),
          trending: false,
          featured: false,
          qualityScore: 50 // Default quality score for Velog articles
        };

        // 태그 추가
        article.tags = suggestTags(article);

        // 품질 점수 계산 (Article 객체가 완전히 구성된 후)
        const qualityMetrics = calculateQualityScore(article);
        article.qualityScore = qualityMetrics.finalScore;
        
        return article;
      });
    } catch (error) {
      console.error('❌ Velog RSS 폴백 실패:', error);
      return [];
    }
  }

  private hasDevKeywords(text: string): boolean {
    // IT 개발 관련 필수 키워드 (더 엄격하게)
    const devKeywords = [
      'javascript', 'typescript', 'react', 'vue', 'nodejs', 'python', 'java',
      'spring', 'django', 'flask', 'express', 'api', 'database', 'sql',
      'frontend', 'backend', 'fullstack', 'web', 'app', 'mobile', 'android', 'ios',
      '개발', '프로그래밍', '코딩', '프론트엔드', '백엔드', '웹개발', '앱개발',
      'css', 'html', 'git', 'docker', 'kubernetes', 'aws', 'cloud', 'server',
      'algorithm', '알고리즘', '자료구조', 'coding', 'programming', 'developer',
      'framework', 'library', 'component', 'function', 'class', 'method',
      'angular', 'svelte', 'nextjs', 'nestjs', 'webpack', 'vite', 'npm',
      'github', 'gitlab', 'devops', 'ci/cd', 'testing', 'debug', '디버깅',
      '백준', '프로그래머스', 'leetcode', 'codingtest', '코딩테스트'
    ];
    
    // 제외할 키워드 (IT와 관련 없는 분야)
    const excludeKeywords = [
      'market', 'marketing', 'business', 'hair', 'beauty', 'food', 'printing',
      'extension', '시장', '마케팅', '비즈니스', '미용', '뷰티', '음식', '요리',
      '부동산', 'real estate', 'construction', '건설', '건축', '인테리어',
      'fashion', '패션', 'clothing', '의류', 'finance', '금융', '투자', 'investment',
      '폴리올', 'polyol', 'foam', '폼', '화학', 'chemical', '제조', 'manufacturing',
      '공동주택', '아파트', '주택', 'apartment', 'housing', '카드깡', '대출'
    ];
    
    const lowerText = text.toLowerCase();
    
    // 제외 키워드가 있으면 false
    if (excludeKeywords.some(keyword => lowerText.includes(keyword.toLowerCase()))) {
      return false;
    }
    
    // 개발 키워드가 있어야 true
    return devKeywords.some(keyword => lowerText.includes(keyword.toLowerCase()));
  }

  private hasSpamIndicators(title: string): boolean {
    const spamIndicators = [
      // 의미불명 제목들
      /^\d{6}$/, // 6자리 숫자만 있는 경우 (예: 250904)
      /^[a-zA-Z]{1,3}$/, // 1-3자 영문자만 (예: UI, UX)
      
      // 광고성 문구들
      /선택.*가이드/, /완벽한.*선택/, /perfect.*choose/i,
      /시장.*전망/, /market.*reach.*usd/i, /시장.*규모.*도달/,
      /카드깡/, /대출/, /현금화/,
      
      // 너무 일반적이거나 모호한 제목
      /^.{1,5}$/, // 5자 이하 제목
      /^\d+$/, // 숫자만 있는 제목
    ];

    return spamIndicators.some(pattern => pattern.test(title));
  }
}
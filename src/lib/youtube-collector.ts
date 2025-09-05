import { Article, Author, Platform, ArticleCategory } from '@/types/article';

// YouTube Data API를 활용한 IT 카테고리 수집기
export class YouTubeCollector {
  private apiKey: string;
  private baseUrl = 'https://www.googleapis.com/youtube/v3';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  // IT 관련 키워드들
  private readonly IT_KEYWORDS = [
    // 개발 관련
    'javascript', 'typescript', 'react', 'vue', 'angular', 'nodejs', 'python', 'java', 'spring',
    'flutter', 'react native', 'swift', 'kotlin', '개발', '프로그래밍', '코딩', '웹개발', '앱개발',
    'frontend', 'backend', 'fullstack', 'api', 'database', 'mysql', 'mongodb', 'postgresql',
    
    // 클라우드/인프라
    'aws', 'gcp', 'azure', 'docker', 'kubernetes', 'devops', 'ci/cd', '클라우드', '인프라',
    'terraform', 'jenkins', 'github actions',
    
    // 디자인/기획
    'ui', 'ux', 'figma', 'sketch', 'adobe xd', '디자인', '사용자경험', '사용자인터페이스',
    '웹디자인', '앱디자인', 'prototyping', '프로토타입', '기획', 'product manager', 'pm',
    
    // 데이터/AI
    'machine learning', 'deep learning', 'ai', '인공지능', 'data science', '데이터분석', 'tensorflow',
    'pytorch', 'pandas', 'jupyter', 'data visualization',
    
    // 기타 IT
    'cybersecurity', '보안', 'blockchain', '블록체인', 'web3', 'crypto', 'nft',
    'startup', '스타트업', 'tech', 'technology', '기술', 'innovation', '혁신'
  ];

  // IT 관련 채널 카테고리 ID들 (YouTube API 카테고리)
  private readonly IT_CATEGORY_IDS = [
    '27', // Education
    '28', // Science & Technology
    '22'  // People & Blogs (기술 블로거들)
  ];

  /**
   * 최신 IT 관련 인기 영상들을 수집
   */
  async collectTrendingITVideos(maxResults: number = 50): Promise<Article[]> {
    const articles: Article[] = [];
    
    try {
      // 각 키워드별로 검색하여 다양성 확보
      const keywordGroups = this.chunkArray(this.IT_KEYWORDS, 10);
      
      for (const keywords of keywordGroups.slice(0, 3)) { // 처음 3개 그룹만 사용
        const searchQuery = keywords.join(' OR ');
        const videos = await this.searchVideos(searchQuery, Math.floor(maxResults / 3));
        
        for (const video of videos) {
          const article = await this.convertVideoToArticle(video);
          if (article && this.isHighQualityVideo(video)) {
            articles.push(article);
          }
        }
        
        // API 요청 제한을 위한 딜레이
        await this.delay(1000);
      }
      
      // 중복 제거 및 품질 기준으로 정렬
      return this.deduplicateAndSort(articles);
      
    } catch (error) {
      console.error('YouTube 수집 실패:', error);
      return [];
    }
  }

  /**
   * YouTube 검색 API 호출
   */
  private async searchVideos(query: string, maxResults: number = 20) {
    const params = new URLSearchParams({
      part: 'id,snippet',
      q: query,
      type: 'video',
      order: 'relevance', // 관련도순
      publishedAfter: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 최근 30일
      maxResults: maxResults.toString(),
      regionCode: 'KR',
      relevanceLanguage: 'ko',
      key: this.apiKey
    });

    const response = await fetch(`${this.baseUrl}/search?${params}`);
    if (!response.ok) {
      throw new Error(`YouTube API 에러: ${response.status}`);
    }

    const data = await response.json();
    
    // 비디오 상세 정보 (조회수, 좋아요 등) 추가 조회
    if (data.items && data.items.length > 0) {
      const videoIds = data.items.map((item: any) => item.id.videoId).join(',');
      return this.getVideoDetails(videoIds);
    }
    
    return [];
  }

  /**
   * 비디오 상세 정보 조회 (조회수, 좋아요, 등)
   */
  private async getVideoDetails(videoIds: string) {
    const params = new URLSearchParams({
      part: 'snippet,statistics,contentDetails',
      id: videoIds,
      key: this.apiKey
    });

    const response = await fetch(`${this.baseUrl}/videos?${params}`);
    if (!response.ok) {
      throw new Error(`YouTube API 에러: ${response.status}`);
    }

    const data = await response.json();
    return data.items || [];
  }

  /**
   * YouTube 비디오를 Article 형태로 변환
   */
  private async convertVideoToArticle(video: any): Promise<Article | null> {
    try {
      const snippet = video.snippet;
      const statistics = video.statistics;
      const contentDetails = video.contentDetails;

      // 채널 정보 가져오기
      const channelInfo = await this.getChannelInfo(snippet.channelId);
      
      const author: Author = {
        id: `youtube-${snippet.channelId}`,
        name: snippet.channelTitle,
        company: 'YouTube',
        expertise: this.extractExpertiseFromVideo(snippet),
        articleCount: channelInfo?.statistics?.videoCount ? parseInt(channelInfo.statistics.videoCount) : 0,
        followerCount: channelInfo?.statistics?.subscriberCount ? parseInt(channelInfo.statistics.subscriberCount) : 0
      };

      const platform: Platform = {
        id: 'youtube',
        name: 'YouTube',
        type: 'educational',
        baseUrl: 'https://www.youtube.com',
        channelName: snippet.channelTitle,
        description: 'YouTube IT 콘텐츠',
        isActive: true,
        lastCrawled: new Date()
      };

      const article: Article = {
        id: `youtube-${video.id}`,
        title: snippet.title,
        content: snippet.description || '',
        excerpt: this.createExcerpt(snippet.description || '', snippet.title),
        author,
        platform,
        category: this.categorizeVideo(snippet),
        tags: this.extractTags(snippet),
        publishedAt: new Date(snippet.publishedAt),
        viewCount: statistics?.viewCount ? parseInt(statistics.viewCount) : 0,
        likeCount: statistics?.likeCount ? parseInt(statistics.likeCount) : 0,
        commentCount: statistics?.commentCount ? parseInt(statistics.commentCount) : 0,
        readingTime: this.parseDuration(contentDetails?.duration),
        trending: this.isTrending(statistics),
        featured: this.isFeatured(statistics, snippet),
        url: `https://www.youtube.com/watch?v=${video.id}`,
        contentType: 'video',
        videoUrl: `https://www.youtube.com/watch?v=${video.id}`,
        videoDuration: this.parseDurationInSeconds(contentDetails?.duration),
        thumbnailUrl: snippet.thumbnails?.high?.url || snippet.thumbnails?.medium?.url || snippet.thumbnails?.default?.url
      };

      return article;
    } catch (error) {
      console.error('비디오 변환 실패:', error);
      return null;
    }
  }

  /**
   * 채널 정보 조회
   */
  private async getChannelInfo(channelId: string) {
    try {
      const params = new URLSearchParams({
        part: 'snippet,statistics',
        id: channelId,
        key: this.apiKey
      });

      const response = await fetch(`${this.baseUrl}/channels?${params}`);
      if (!response.ok) return null;

      const data = await response.json();
      return data.items?.[0] || null;
    } catch {
      return null;
    }
  }

  /**
   * 비디오 품질 평가
   */
  private isHighQualityVideo(video: any): boolean {
    const stats = video.statistics;
    const snippet = video.snippet;
    
    // 기본 품질 기준
    const viewCount = parseInt(stats?.viewCount || '0');
    const likeCount = parseInt(stats?.likeCount || '0');
    const duration = this.parseDurationInSeconds(video.contentDetails?.duration);
    
    // 품질 기준들
    const hasMinViews = viewCount >= 1000; // 최소 1천 조회
    const hasEngagement = likeCount >= 10; // 최소 10 좋아요
    const hasReasonableDuration = duration >= 300 && duration <= 3600; // 5분~1시간
    const isRecentEnough = (Date.now() - new Date(snippet.publishedAt).getTime()) <= 90 * 24 * 60 * 60 * 1000; // 90일 이내
    
    return hasMinViews && hasEngagement && hasReasonableDuration && isRecentEnough;
  }

  /**
   * 유틸리티 메서드들
   */
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private createExcerpt(description: string, title: string): string {
    if (!description) return title.substring(0, 200) + '...';
    return description.substring(0, 200) + '...';
  }

  private extractExpertiseFromVideo(snippet: any): string[] {
    const text = (snippet.title + ' ' + snippet.description).toLowerCase();
    const expertise = [];
    
    if (text.includes('react') || text.includes('vue') || text.includes('angular') || text.includes('frontend') || text.includes('프론트엔드')) {
      expertise.push('Frontend');
    }
    if (text.includes('backend') || text.includes('server') || text.includes('api') || text.includes('백엔드')) {
      expertise.push('Backend');
    }
    if (text.includes('ui') || text.includes('ux') || text.includes('design') || text.includes('디자인')) {
      expertise.push('Design');
    }
    if (text.includes('ai') || text.includes('machine learning') || text.includes('인공지능')) {
      expertise.push('AI/ML');
    }
    
    return expertise.length > 0 ? expertise : ['Tech'];
  }

  private categorizeVideo(snippet: any): ArticleCategory {
    const text = (snippet.title + ' ' + snippet.description).toLowerCase();
    
    if (text.includes('react') || text.includes('vue') || text.includes('frontend') || text.includes('javascript')) {
      return 'frontend';
    }
    if (text.includes('backend') || text.includes('server') || text.includes('database') || text.includes('api')) {
      return 'backend';
    }
    if (text.includes('ui') || text.includes('ux') || text.includes('design') || text.includes('figma')) {
      return 'design';
    }
    if (text.includes('ai') || text.includes('machine learning') || text.includes('데이터')) {
      return 'ai-ml';
    }
    if (text.includes('aws') || text.includes('cloud') || text.includes('docker') || text.includes('kubernetes')) {
      return 'cloud-infra';
    }
    if (text.includes('mobile') || text.includes('ios') || text.includes('android') || text.includes('flutter')) {
      return 'mobile';
    }
    
    return 'general';
  }

  private extractTags(snippet: any): string[] {
    const text = (snippet.title + ' ' + snippet.description).toLowerCase();
    const tags = ['YouTube', 'Video'];
    
    // 기술 스택 태그 추출
    this.IT_KEYWORDS.forEach(keyword => {
      if (text.includes(keyword.toLowerCase())) {
        tags.push(keyword);
      }
    });
    
    return [...new Set(tags)].slice(0, 5); // 중복 제거 후 최대 5개
  }

  private parseDuration(duration: string): number {
    if (!duration) return 10;
    
    // ISO 8601 duration (PT4M20S) 파싱
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 10;
    
    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    const seconds = parseInt(match[3] || '0');
    
    return Math.ceil((hours * 60 + minutes + seconds / 60));
  }

  private parseDurationInSeconds(duration: string): number {
    if (!duration) return 600;
    
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 600;
    
    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    const seconds = parseInt(match[3] || '0');
    
    return hours * 3600 + minutes * 60 + seconds;
  }

  private isTrending(statistics: any): boolean {
    const viewCount = parseInt(statistics?.viewCount || '0');
    const likeCount = parseInt(statistics?.likeCount || '0');
    
    return viewCount >= 10000 || likeCount >= 100;
  }

  private isFeatured(statistics: any, snippet: any): boolean {
    const viewCount = parseInt(statistics?.viewCount || '0');
    const likeCount = parseInt(statistics?.likeCount || '0');
    const daysSincePublished = (Date.now() - new Date(snippet.publishedAt).getTime()) / (1000 * 60 * 60 * 24);
    
    // 최근 발행되고 높은 인기를 얻은 영상
    return viewCount >= 50000 && likeCount >= 500 && daysSincePublished <= 30;
  }

  private deduplicateAndSort(articles: Article[]): Article[] {
    // URL 기준 중복 제거
    const unique = articles.filter((article, index, self) => 
      index === self.findIndex(a => a.url === article.url)
    );
    
    // 조회수 기준으로 정렬
    return unique.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
  }
}

export default YouTubeCollector;
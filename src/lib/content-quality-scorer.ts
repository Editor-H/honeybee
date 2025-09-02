import { Article } from '@/types/article';

// 품질 점수 계산을 위한 인터페이스
interface QualityMetrics {
  engagementScore: number;
  authorScore: number;
  contentScore: number;
  recencyScore: number;
  sourceScore: number;
  finalScore: number;
}

// 신뢰할 수 있는 도메인 점수
const TRUSTED_DOMAINS: Record<string, number> = {
  'github.com': 1.5,
  'stackoverflow.com': 1.4,
  'medium.com': 1.2,
  'dev.to': 1.2,
  'blog.google.com': 1.4,
  'engineering.fb.com': 1.4,
  'netflixtechblog.com': 1.4,
  'aws.amazon.com': 1.3,
  'docs.microsoft.com': 1.3,
  'web.dev': 1.3,
  'reactjs.org': 1.3,
  'nodejs.org': 1.3,
  'python.org': 1.3,
  'mozilla.org': 1.2,
  'css-tricks.com': 1.2,
  'smashingmagazine.com': 1.2,
  'techcrunch.com': 1.1,
  'arstechnica.com': 1.1,
  'wired.com': 1.1,
  'theverge.com': 1.0
};

// 프로그래밍 관련 키워드 가중치
const PROGRAMMING_KEYWORDS: Record<string, number> = {
  'react': 1.3,
  'javascript': 1.2,
  'typescript': 1.3,
  'python': 1.2,
  'ai': 1.4,
  'machine learning': 1.4,
  'api': 1.2,
  'database': 1.2,
  'frontend': 1.2,
  'backend': 1.2,
  'nodejs': 1.2,
  'github': 1.1,
  'open source': 1.2,
  'algorithm': 1.3,
  'data science': 1.3,
  'web development': 1.2,
  'mobile': 1.1,
  'cloud': 1.2,
  'devops': 1.2,
  'security': 1.3
};

// 참여도 점수 계산 (조회수, 좋아요, 댓글 기반)
function calculateEngagementScore(article: Article): number {
  const views = article.viewCount || 0;
  const likes = article.likeCount || 0;
  const comments = article.commentCount || 0;
  
  // 가중 평균으로 참여도 점수 계산
  const viewScore = Math.log10(Math.max(views, 1)) * 0.4;
  const likeScore = Math.log10(Math.max(likes, 1)) * 0.4;
  const commentScore = Math.log10(Math.max(comments, 1)) * 0.2;
  
  return Math.min(viewScore + likeScore + commentScore, 10);
}

// 작성자 신뢰도 점수 계산
function calculateAuthorScore(article: Article): number {
  const author = article.author;
  let score = 1.0;
  
  // 유명한 개발자나 회사인지 확인
  const trustedAuthors = [
    'dan abramov', 'kent c. dodds', 'sindre sorhus', 'tj holowaychuk',
    'ryan dahl', 'evan you', 'rich harris', 'sebastian markbage',
    'google', 'facebook', 'microsoft', 'netflix', 'airbnb', 'uber'
  ];
  
  const authorName = author.name.toLowerCase();
  if (trustedAuthors.some(trusted => authorName.includes(trusted))) {
    score += 0.5;
  }
  
  // 팔로워 수나 기여도가 있다면 추가 점수
  if (author.followerCount && author.followerCount > 1000) {
    score += Math.log10(author.followerCount / 1000) * 0.2;
  }
  
  if (author.articleCount && author.articleCount > 10) {
    score += Math.log10(author.articleCount / 10) * 0.1;
  }
  
  return Math.min(score, 2.0);
}

// 콘텐츠 품질 점수 계산 (제목과 내용 키워드 분석)
function calculateContentScore(article: Article): number {
  const title = article.title.toLowerCase();
  const content = article.content.toLowerCase();
  
  let score = 1.0;
  
  // 프로그래밍 키워드 점수
  for (const [keyword, weight] of Object.entries(PROGRAMMING_KEYWORDS)) {
    if (title.includes(keyword) || content.includes(keyword)) {
      score += (weight - 1.0) * 0.5;
    }
  }
  
  // 제목 품질 (너무 짧거나 긴 제목 페널티)
  const titleLength = article.title.length;
  if (titleLength < 20 || titleLength > 120) {
    score -= 0.2;
  }
  
  // 스팸성 키워드 페널티
  const spamKeywords = ['click here', 'free', 'download now', '광고', '홍보'];
  if (spamKeywords.some(spam => title.includes(spam) || content.includes(spam))) {
    score -= 0.5;
  }
  
  return Math.max(score, 0.1);
}

// 최신성 점수 계산
function calculateRecencyScore(article: Article): number {
  const now = new Date();
  const published = new Date(article.publishedAt);
  const daysDiff = (now.getTime() - published.getTime()) / (1000 * 60 * 60 * 24);
  
  // 7일 이내는 최고 점수, 그 이후로는 감소
  if (daysDiff <= 7) return 1.0;
  if (daysDiff <= 30) return 0.8;
  if (daysDiff <= 90) return 0.6;
  if (daysDiff <= 365) return 0.4;
  return 0.2;
}

// 소스 신뢰도 점수 계산
function calculateSourceScore(article: Article): number {
  try {
    const url = new URL(article.url);
    const domain = url.hostname.replace('www.', '');
    
    return TRUSTED_DOMAINS[domain] || 1.0;
  } catch {
    return 0.8; // 잘못된 URL은 낮은 점수
  }
}

// 종합 품질 점수 계산
export function calculateQualityScore(article: Article): QualityMetrics {
  const engagementScore = calculateEngagementScore(article);
  const authorScore = calculateAuthorScore(article);
  const contentScore = calculateContentScore(article);
  const recencyScore = calculateRecencyScore(article);
  const sourceScore = calculateSourceScore(article);
  
  // 가중 평균으로 최종 점수 계산
  const finalScore = (
    engagementScore * 0.3 +
    authorScore * 0.2 +
    contentScore * 0.25 +
    recencyScore * 0.15 +
    sourceScore * 0.1
  );
  
  return {
    engagementScore,
    authorScore,
    contentScore,
    recencyScore,
    sourceScore,
    finalScore: Math.round(finalScore * 100) / 100
  };
}

// 품질 기준으로 아티클 필터링
export function filterHighQualityArticles(articles: Article[], minScore: number = 5.0): Article[] {
  return articles
    .map(article => ({
      ...article,
      qualityMetrics: calculateQualityScore(article)
    }))
    .filter(article => article.qualityMetrics.finalScore >= minScore)
    .sort((a, b) => b.qualityMetrics.finalScore - a.qualityMetrics.finalScore);
}

// 자동 태그 추천 시스템
export function suggestTags(article: Article): string[] {
  const title = article.title.toLowerCase();
  const content = article.content.toLowerCase();
  const suggestedTags: string[] = [];
  
  // 기존 태그 유지
  suggestedTags.push(...article.tags);
  
  // 프로그래밍 언어 태그
  const languages = {
    'javascript': 'JavaScript',
    'typescript': 'TypeScript', 
    'python': 'Python',
    'java': 'Java',
    'react': 'React',
    'vue': 'Vue',
    'angular': 'Angular',
    'nodejs': 'Node.js',
    'golang': 'Go',
    'rust': 'Rust'
  };
  
  for (const [keyword, tag] of Object.entries(languages)) {
    if ((title.includes(keyword) || content.includes(keyword)) && !suggestedTags.includes(tag)) {
      suggestedTags.push(tag);
    }
  }
  
  // 기술 영역 태그
  const techAreas = {
    'frontend': 'Frontend',
    'backend': 'Backend',
    'fullstack': 'Full Stack',
    'mobile': 'Mobile',
    'ai': 'AI',
    'machine learning': 'Machine Learning',
    'devops': 'DevOps',
    'database': 'Database'
  };
  
  for (const [keyword, tag] of Object.entries(techAreas)) {
    if ((title.includes(keyword) || content.includes(keyword)) && !suggestedTags.includes(tag)) {
      suggestedTags.push(tag);
    }
  }
  
  return [...new Set(suggestedTags)]; // 중복 제거
}
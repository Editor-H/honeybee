import { Article } from '@/types/article';

// 웹 스크래핑을 위한 기본 인터페이스
interface ScrapingConfig {
  id: string;
  name: string;
  baseUrl: string;
  logoUrl: string;
  description: string;
  isActive: boolean;
  scrapeFunction: () => Promise<Article[]>;
  maxArticles?: number;
  category?: string;
}

// 스크래핑 설정
const scrapingConfigs: Record<string, ScrapingConfig> = {
  huggingface_papers: {
    id: 'huggingface_papers',
    name: 'HuggingFace Papers',
    baseUrl: 'https://huggingface.co/papers/trending',
    logoUrl: 'https://www.google.com/s2/favicons?domain=huggingface.co&sz=64',
    description: 'ML/AI 분야 최신 논문 트렌딩',
    isActive: true,
    maxArticles: 10,
    category: 'AI/ML',
    scrapeFunction: scrapeHuggingFacePapers
  },
  gpters_newsletter: {
    id: 'gpters_newsletter',
    name: 'GPTers 뉴스레터',
    baseUrl: 'https://www.gpters.org/newsletter',
    logoUrl: 'https://www.google.com/s2/favicons?domain=gpters.org&sz=64',
    description: 'AI/GPT 관련 전문 뉴스레터',
    isActive: true,
    maxArticles: 5,
    category: 'AI/ML',
    scrapeFunction: scrapeGptersNewsletter
  },
  hacker_news_trending: {
    id: 'hacker_news_trending',
    name: 'Hacker News Trending',
    baseUrl: 'https://news.ycombinator.com',
    logoUrl: 'https://www.google.com/s2/favicons?domain=news.ycombinator.com&sz=64',
    description: 'Hacker News 고득점 프로그래밍 스토리',
    isActive: true,
    maxArticles: 4,
    category: 'Programming',
    scrapeFunction: scrapeHackerNewsTrending
  },
  github_trending: {
    id: 'github_trending',
    name: 'GitHub Trending',
    baseUrl: 'https://github.com/trending',
    logoUrl: 'https://www.google.com/s2/favicons?domain=github.com&sz=64',
    description: 'GitHub 트렌딩 프로그래밍 레포지토리',
    isActive: true,
    maxArticles: 6,
    category: 'Programming',
    scrapeFunction: scrapeGitHubTrending
  },
  reddit_programming: {
    id: 'reddit_programming',
    name: 'Reddit Programming',
    baseUrl: 'https://www.reddit.com/r/programming',
    logoUrl: 'https://www.google.com/s2/favicons?domain=reddit.com&sz=64',
    description: 'Reddit 프로그래밍 커뮤니티 인기 포스트',
    isActive: true,
    maxArticles: 5,
    category: 'Programming',
    scrapeFunction: scrapeRedditProgramming
  }
};

// HuggingFace Papers 스크래핑 함수
async function scrapeHuggingFacePapers(): Promise<Article[]> {
  try {
    console.log('--- HuggingFace Papers 스크래핑 시작 ---');
    
    const response = await fetch('https://huggingface.co/papers/trending', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; HoneybeeBot/1.0)',
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const html = await response.text();
    
    // 기본적인 HTML 파싱 (실제로는 cheerio 등 라이브러리 사용 권장)
    const articles: Article[] = [];
    
    // HuggingFace API를 통한 데이터 수집 시도
    try {
      const apiResponse = await fetch('https://huggingface.co/api/papers', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; HoneybeeBot/1.0)',
        }
      });
      
      if (apiResponse.ok) {
        const data = await apiResponse.json();
        
        // API 응답 구조에 따라 파싱 (구조 확인 필요)
        if (data && Array.isArray(data)) {
          data.slice(0, 10).forEach((paper: Record<string, unknown>) => {
            if (paper.title && paper.url) {
              const title = typeof paper.title === 'string' ? paper.title : String(paper.title);
              const summary = typeof paper.summary === 'string' ? paper.summary : 
                             typeof paper.abstract === 'string' ? paper.abstract : '';
              const url = typeof paper.url === 'string' ? paper.url : String(paper.url);
              const publishedAt = paper.publishedAt ? new Date(String(paper.publishedAt)) : new Date();
              const authors = Array.isArray(paper.authors) ? paper.authors : [];
              const authorName = authors.length > 0 && typeof authors[0] === 'string' ? 
                               authors[0] : 'HuggingFace Community';
              const authorUrl = typeof paper.authorUrl === 'string' ? paper.authorUrl : 'https://huggingface.co';
              
              articles.push({
                title,
                content: summary,
                url: url.startsWith('http') ? url : `https://huggingface.co${url}`,
                publishedAt,
                author: {
                  name: authorName,
                  url: authorUrl
                },
                platform: {
                  id: 'huggingface_papers',
                  name: 'HuggingFace Papers',
                  logoUrl: 'https://www.google.com/s2/favicons?domain=huggingface.co&sz=64'
                },
                category: 'AI/ML',
                tags: ['AI', 'Machine Learning', 'Papers', 'Research'],
                readTime: 10,
                isBookmarked: false,
                contentType: 'article' as const
              });
            }
          });
        }
      }
    } catch (apiError) {
      console.warn('HuggingFace API 접근 실패, HTML 파싱으로 대체:', apiError);
      // TODO: HTML 파싱 구현
    }
    
    console.log(`✅ HuggingFace Papers: ${articles.length}개 수집 완료`);
    return articles;
    
  } catch (error) {
    console.error('❌ HuggingFace Papers 스크래핑 실패:', error);
    return [];
  }
}

// GPTers 뉴스레터 스크래핑 함수
async function scrapeGptersNewsletter(): Promise<Article[]> {
  try {
    console.log('--- GPTers 뉴스레터 스크래핑 시작 ---');
    
    const response = await fetch('https://www.gpters.org/newsletter', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; HoneybeeBot/1.0)',
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const html = await response.text();
    const articles: Article[] = [];
    
    // 간단한 패턴 매칭으로 뉴스레터 링크 추출
    const newsletterPattern = /<a[^>]*href="([^"]*newsletter[^"]*)"[^>]*>([^<]+)</gi;
    const titlePattern = /<h[1-6][^>]*>([^<]*(?:뉴스레터|GPT|AI)[^<]*)</gi;
    
    let match;
    const links = new Set<string>();
    
    // 뉴스레터 관련 링크 수집
    while ((match = newsletterPattern.exec(html)) !== null) {
      const url = match[1];
      const title = match[2]?.trim();
      
      if (title && url && !links.has(url)) {
        links.add(url);
        
        articles.push({
          title: title,
          content: 'GPTers 뉴스레터에서 제공하는 AI/GPT 관련 최신 소식',
          url: url.startsWith('http') ? url : `https://www.gpters.org${url}`,
          publishedAt: new Date(),
          author: {
            name: 'GPTers',
            url: 'https://www.gpters.org'
          },
          platform: {
            id: 'gpters_newsletter',
            name: 'GPTers 뉴스레터',
            logoUrl: 'https://www.google.com/s2/favicons?domain=gpters.org&sz=64'
          },
          category: 'AI/ML',
          tags: ['AI', 'GPT', 'Newsletter', '뉴스레터'],
          readTime: 5,
          isBookmarked: false,
          contentType: 'article' as const
        });
        
        if (articles.length >= 5) break;
      }
    }
    
    console.log(`✅ GPTers 뉴스레터: ${articles.length}개 수집 완료`);
    return articles;
    
  } catch (error) {
    console.error('❌ GPTers 뉴스레터 스크래핑 실패:', error);
    return [];
  }
}

// Hacker News 트렌딩 스토리 스크래핑 함수
async function scrapeHackerNewsTrending(): Promise<Article[]> {
  try {
    console.log('--- Hacker News 트렌딩 스토리 스크래핑 시작 ---');
    
    // Hacker News API를 통해 top stories 가져오기
    const topStoriesResponse = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');
    const topStoryIds = await topStoriesResponse.json() as number[];
    
    const articles: Article[] = [];
    const minScore = 100; // 최소 100점 이상인 스토리만 수집
    
    // 상위 50개 스토리만 확인 (API 호출 최적화)
    const storiesToCheck = topStoryIds.slice(0, 50);
    
    for (const storyId of storiesToCheck) {
      try {
        const storyResponse = await fetch(`https://hacker-news.firebaseio.com/v0/item/${storyId}.json`);
        const story = await storyResponse.json() as Record<string, unknown>;
        
        // 점수 필터링 및 프로그래밍 관련 키워드 확인
        if (story && typeof story.score === 'number' && story.score >= minScore && 
            typeof story.title === 'string' && typeof story.url === 'string') {
          const title = story.title.toLowerCase();
          const programmingKeywords = [
            'javascript', 'python', 'react', 'node', 'typescript', 'api', 'programming', 
            'code', 'developer', 'software', 'web', 'frontend', 'backend', 'database',
            'ai', 'ml', 'machine learning', 'algorithm', 'github', 'open source'
          ];
          
          const isProgrammingRelated = programmingKeywords.some(keyword => 
            title.includes(keyword)
          );
          
          if (isProgrammingRelated) {
            articles.push({
              title: story.title,
              content: (typeof story.text === 'string' ? story.text : '') || `Hacker News에서 ${story.score}점을 받은 인기 프로그래밍 스토리`,
              url: story.url,
              publishedAt: new Date((typeof story.time === 'number' ? story.time : Date.now() / 1000) * 1000),
              author: {
                name: (typeof story.by === 'string' ? story.by : '') || 'Hacker News User',
                url: `https://news.ycombinator.com/user?id=${story.by || 'unknown'}`
              },
              platform: {
                id: 'hacker_news_trending',
                name: 'Hacker News Trending',
                logoUrl: 'https://www.google.com/s2/favicons?domain=news.ycombinator.com&sz=64'
              },
              category: 'Programming',
              tags: ['Hacker News', 'Trending', 'Programming'],
              readTime: 5,
              isBookmarked: false,
              contentType: 'article' as const,
              viewCount: typeof story.score === 'number' ? story.score : 0,
              likeCount: typeof story.score === 'number' ? story.score : 0,
              commentCount: typeof story.descendants === 'number' ? story.descendants : 0
            });
            
            if (articles.length >= 4) break;
          }
        }
      } catch (error) {
        console.warn(`Hacker News 스토리 ${storyId} 처리 실패:`, error);
      }
    }
    
    console.log(`✅ Hacker News Trending: ${articles.length}개 수집 완료`);
    return articles;
    
  } catch (error) {
    console.error('❌ Hacker News Trending 스크래핑 실패:', error);
    return [];
  }
}

// GitHub 트렌딩 레포지토리 스크래핑 함수
async function scrapeGitHubTrending(): Promise<Article[]> {
  try {
    console.log('--- GitHub 트렌딩 레포지토리 스크래핑 시작 ---');
    
    const response = await fetch('https://api.github.com/search/repositories?q=created:>2024-08-01&sort=stars&order=desc&per_page=20', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; HoneybeeBot/1.0)',
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`GitHub API HTTP ${response.status}`);
    }
    
    const data = await response.json();
    const articles: Article[] = [];
    
    if (data.items && Array.isArray(data.items)) {
      for (const repo of data.items.slice(0, 6)) {
        if (repo.name && repo.html_url && repo.stargazers_count > 100) {
          const programmingLanguages = ['JavaScript', 'TypeScript', 'Python', 'Go', 'Rust', 'Java', 'C++', 'C#', 'Swift', 'Kotlin'];
          const isProgRelevant = !repo.language || programmingLanguages.includes(repo.language);
          
          if (isProgRelevant) {
            articles.push({
              title: `${repo.name}: ${repo.description || '인기 프로그래밍 레포지토리'}`,
              content: repo.description || `GitHub에서 ⭐${repo.stargazers_count}개 별을 받은 인기 ${repo.language || 'Programming'} 프로젝트`,
              url: repo.html_url,
              publishedAt: new Date(repo.created_at),
              author: {
                name: repo.owner?.login || 'GitHub User',
                url: repo.owner?.html_url || 'https://github.com'
              },
              platform: {
                id: 'github_trending',
                name: 'GitHub Trending',
                logoUrl: 'https://www.google.com/s2/favicons?domain=github.com&sz=64'
              },
              category: 'Programming',
              tags: ['GitHub', 'Trending', 'Open Source', repo.language || 'Programming'].filter(Boolean),
              readTime: 3,
              isBookmarked: false,
              contentType: 'article' as const,
              viewCount: repo.stargazers_count,
              likeCount: repo.stargazers_count,
              commentCount: repo.open_issues_count || 0
            });
          }
        }
      }
    }
    
    console.log(`✅ GitHub Trending: ${articles.length}개 수집 완료`);
    return articles;
    
  } catch (error) {
    console.error('❌ GitHub Trending 스크래핑 실패:', error);
    return [];
  }
}

// Reddit 프로그래밍 서브레딧 스크래핑 함수
async function scrapeRedditProgramming(): Promise<Article[]> {
  try {
    console.log('--- Reddit 프로그래밍 서브레딧 스크래핑 시작 ---');
    
    const response = await fetch('https://www.reddit.com/r/programming/hot.json?limit=20', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; HoneybeeBot/1.0)',
      }
    });
    
    if (!response.ok) {
      throw new Error(`Reddit API HTTP ${response.status}`);
    }
    
    const data = await response.json();
    const articles: Article[] = [];
    const minScore = 50; // 최소 50점 이상
    
    if (data.data?.children && Array.isArray(data.data.children)) {
      for (const post of data.data.children) {
        const postData = post.data;
        
        if (postData && postData.score >= minScore && postData.title && postData.url && 
            !postData.is_self && !postData.stickied) {
          
          articles.push({
            title: postData.title,
            content: postData.selftext || `Reddit r/programming에서 ${postData.score}점을 받은 인기 포스트`,
            url: postData.url,
            publishedAt: new Date(postData.created_utc * 1000),
            author: {
              name: postData.author || 'Reddit User',
              url: `https://www.reddit.com/user/${postData.author}`
            },
            platform: {
              id: 'reddit_programming',
              name: 'Reddit Programming',
              logoUrl: 'https://www.google.com/s2/favicons?domain=reddit.com&sz=64'
            },
            category: 'Programming',
            tags: ['Reddit', 'Programming', 'Community'],
            readTime: 4,
            isBookmarked: false,
            contentType: 'article' as const,
            viewCount: postData.score,
            likeCount: postData.ups || postData.score,
            commentCount: postData.num_comments || 0
          });
          
          if (articles.length >= 5) break;
        }
      }
    }
    
    console.log(`✅ Reddit Programming: ${articles.length}개 수집 완료`);
    return articles;
    
  } catch (error) {
    console.error('❌ Reddit Programming 스크래핑 실패:', error);
    return [];
  }
}

// 웹 스크래핑 실행 함수
export async function collectScrapedArticles(): Promise<Article[]> {
  const allArticles: Article[] = [];
  
  for (const config of Object.values(scrapingConfigs)) {
    if (!config.isActive) continue;
    
    try {
      const articles = await config.scrapeFunction();
      allArticles.push(...articles);
    } catch (error) {
      console.error(`스크래핑 실패: ${config.name}`, error);
    }
  }
  
  console.log(`총 스크래핑 수집: ${allArticles.length}개 아티클`);
  return allArticles;
}

// 향후 확장을 위한 스크래핑 설정 추가 함수
export function addScrapingConfig(config: ScrapingConfig) {
  scrapingConfigs[config.id] = config;
}
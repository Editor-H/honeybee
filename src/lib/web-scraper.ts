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
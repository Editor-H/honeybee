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
          data.slice(0, 10).forEach((paper: any) => {
            if (paper.title && paper.url) {
              articles.push({
                title: paper.title,
                content: paper.summary || paper.abstract || '',
                url: paper.url.startsWith('http') ? paper.url : `https://huggingface.co${paper.url}`,
                publishedAt: new Date(paper.publishedAt || Date.now()),
                author: {
                  name: paper.authors?.[0] || 'HuggingFace Community',
                  url: paper.authorUrl || 'https://huggingface.co'
                },
                platform: {
                  id: 'huggingface_papers',
                  name: 'HuggingFace Papers',
                  logoUrl: 'https://www.google.com/s2/favicons?domain=huggingface.co&sz=64'
                },
                category: 'AI/ML',
                tags: ['AI', 'Machine Learning', 'Papers', 'Research'],
                readTime: 10,
                isBookmarked: false
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

// 뉴스레터 아카이브 스크래핑 함수 (기본 구조)
async function scrapeNewsletterArchive(archiveUrl: string): Promise<Article[]> {
  try {
    console.log('--- 뉴스레터 아카이브 스크래핑 시작 ---');
    
    const response = await fetch(archiveUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; HoneybeeBot/1.0)',
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const html = await response.text();
    const articles: Article[] = [];
    
    // TODO: Mailchimp 아카이브 구조에 맞는 파싱 구현
    // 일반적으로 제목, 날짜, 링크를 추출
    
    console.log(`✅ 뉴스레터 아카이브: ${articles.length}개 수집 완료`);
    return articles;
    
  } catch (error) {
    console.error('❌ 뉴스레터 아카이브 스크래핑 실패:', error);
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
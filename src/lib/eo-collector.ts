import { Article, Author, Platform, ArticleCategory } from '@/types/article';

// EO article raw data interface
interface EOArticleRaw {
  title: string;
  url: string;
  authorName: string;
  tags: string[];
  thumbnailUrl: string;
  summary: string;
  publishedAt: string;
}
import { calculateQualityScore, suggestTags } from './content-quality-scorer';
import * as playwright from 'playwright';

export class EOCollector {
  private baseUrl = 'https://eopla.net';
  
  async collectArticles(limit: number = 8): Promise<Article[]> {
    try {
      console.log('📰 EO 매거진 수집 시작...');
      
      let browser;
      try {
        browser = await playwright.chromium.launch({ 
          headless: true,
          args: ['--disable-dev-shm-usage', '--no-sandbox']
        });
        
        const page = await browser.newPage();
        await page.setViewportSize({ width: 1200, height: 800 });
        
        // User-Agent 설정으로 봇 탐지 회피
        await page.setExtraHTTPHeaders({
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        });
        
        console.log(`🌐 EO 메인 페이지 접근: ${this.baseUrl}`);
        await page.goto(this.baseUrl, { 
          waitUntil: 'networkidle',
          timeout: 30000 
        });
        
        // 페이지가 로드될 때까지 기다리기
        await page.waitForSelector('.magazine-container', { timeout: 10000 });
        
        const articles = await page.evaluate((limit) => {
          const containers = document.querySelectorAll('.magazine-container');
          const results: {
            title: string;
            url: string;
            authorName: string;
            tags: string[];
            thumbnailUrl: string;
            summary: string;
            publishedAt: string;
          }[] = [];
          
          for (let i = 0; i < Math.min(containers.length, limit); i++) {
            const container = containers[i];
            
            try {
              // 제목 추출
              const titleElement = container.querySelector('.title');
              const title = titleElement?.textContent?.trim() || '';
              
              // 링크 추출
              const linkElement = container.querySelector('a') || titleElement?.closest('a');
              let url = linkElement?.getAttribute('href') || '';
              
              // 상대 경로인 경우 절대 경로로 변환
              if (url && url.startsWith('/')) {
                url = 'https://eopla.net' + url;
              }
              
              // 작성자 정보
              const authorElement = container.querySelector('.info .name');
              const authorName = authorElement?.textContent?.trim() || 'EO Editor';
              
              // 태그 정보
              const tagElements = container.querySelectorAll('.tag-container .tag');
              const tags = Array.from(tagElements).map(tag => tag.textContent?.trim()).filter(Boolean);
              
              // 이미지 URL
              const imageElement = container.querySelector('.image-container img.magazine-image');
              const thumbnailUrl = imageElement?.getAttribute('src') || '';
              
              // 요약/설명 (제목에서 추출하거나 기본값)
              let summary = '';
              const descElement = container.querySelector('.description, .excerpt, .summary');
              if (descElement) {
                summary = descElement.textContent?.trim() || '';
              }
              
              // 날짜 정보 (있는 경우)
              const dateElement = container.querySelector('.date, .published, .created');
              let publishedAt = new Date();
              if (dateElement) {
                const dateText = dateElement.textContent?.trim();
                if (dateText) {
                  const parsed = new Date(dateText);
                  if (!isNaN(parsed.getTime())) {
                    publishedAt = parsed;
                  }
                }
              }
              
              if (title && url) {
                results.push({
                  title,
                  url,
                  authorName,
                  tags,
                  thumbnailUrl,
                  summary: summary || title.substring(0, 150),
                  publishedAt: publishedAt.toISOString()
                });
              }
            } catch (error) {
              console.warn('EO 아티클 파싱 오류:', error);
            }
          }
          
          return results;
        }, limit);
        
        console.log(`✅ EO에서 ${articles.length}개 아티클 추출 완료`);
        
        return articles.map((item, index) => this.transformToArticle(item, index));
        
      } finally {
        if (browser) {
          await browser.close();
        }
      }
      
    } catch (error) {
      console.error('❌ EO 수집 실패:', error);
      return [];
    }
  }
  
  private transformToArticle(item: EOArticleRaw, index: number): Article {
    const author: Author = {
      id: `eo-${item.authorName || 'editor'}`,
      name: item.authorName || 'EO Editor',
      company: 'EO 매거진',
      expertise: ['Tech'],
      articleCount: 0
    };

    const platform: Platform = {
      id: 'eo',
      name: 'EO 매거진',
      type: 'media' as const,
      baseUrl: this.baseUrl,
      logoUrl: '/icons/eo.svg',
      description: 'EO 매거진 기술 아티클',
      isActive: true
    };

    const article: Article = {
      id: `eo-${Date.now()}-${index}`,
      title: item.title,
      content: item.summary || item.title,
      excerpt: (item.summary || item.title).substring(0, 200),
      summary: item.summary || item.title.substring(0, 200),
      url: item.url,
      publishedAt: new Date(item.publishedAt),
      author,
      platform,
      tags: item.tags || [],
      category: this.categorizeArticle(item.tags),
      contentType: 'article' as const,
      readingTime: Math.max(1, Math.ceil((item.summary || item.title).length / 200)),
      trending: false,
      featured: false,
      qualityScore: 50, // Default quality score for EO articles
      thumbnailUrl: item.thumbnailUrl || undefined
    };

    // 태그가 없는 경우 자동 추천
    if (!article.tags || article.tags.length === 0) {
      article.tags = suggestTags(article);
    }

    // 품질 점수 계산 (Article 객체가 완전히 구성된 후)
    const qualityMetrics = calculateQualityScore(article);
    article.qualityScore = qualityMetrics.finalScore;
    
    return article;
  }
  
  private categorizeArticle(tags: string[]): ArticleCategory {
    if (!tags || tags.length === 0) return 'general';
    
    const tagStr = tags.join(' ').toLowerCase();
    
    if (tagStr.includes('frontend') || tagStr.includes('react') || tagStr.includes('vue') || tagStr.includes('프론트엔드')) {
      return 'frontend';
    }
    if (tagStr.includes('backend') || tagStr.includes('서버') || tagStr.includes('api') || tagStr.includes('백엔드')) {
      return 'backend';
    }
    if (tagStr.includes('design') || tagStr.includes('ui') || tagStr.includes('ux') || tagStr.includes('디자인')) {
      return 'design';
    }
    if (tagStr.includes('ai') || tagStr.includes('ml') || tagStr.includes('인공지능') || tagStr.includes('머신러닝')) {
      return 'ai-ml';
    }
    if (tagStr.includes('devops') || tagStr.includes('인프라') || tagStr.includes('배포') || tagStr.includes('docker')) {
      return 'cloud-infra';
    }
    
    return 'general';
  }
}
import { Article, Author, Platform, ArticleCategory } from '@/types/article';

// GPTERS article raw data interface
interface GPTERSArticleRaw {
  title: string;
  content: string;
  url: string;
  authorName: string;
  publishedAt: string;
}
import { calculateQualityScore, suggestTags } from './content-quality-scorer';
import * as playwright from 'playwright';

export class GPTERSCollector {
  private baseUrl = 'https://www.gpters.org/newsletter';
  
  async collectArticles(limit: number = 8): Promise<Article[]> {
    try {
      console.log('📧 GPTERS 뉴스레터 수집 시작...');
      
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
        
        console.log(`🌐 GPTERS 뉴스레터 페이지 접근: ${this.baseUrl}`);
        await page.goto(this.baseUrl, { 
          waitUntil: 'networkidle',
          timeout: 45000 
        });
        
        // 페이지가 완전히 로드될 때까지 기다리기 (React 앱이므로 더 오래 기다림)
        await page.waitForTimeout(8000);
        
        // 다양한 선택자로 뉴스레터 아이템 찾기 시도
        const possibleSelectors = [
          '[data-testid="newsletter-item"]',
          '.newsletter-item',
          '.newsletter-post',
          '.post-item',
          '.article-item',
          '.newsletter-card',
          '[class*="newsletter"]',
          '[class*="post"]',
          '.card',
          '.list-item',
          'article',
          '.content-item'
        ];
        
        let articlesFound = false;
        let articles = [];
        
        for (const selector of possibleSelectors) {
          try {
            await page.waitForSelector(selector, { timeout: 2000 });
            console.log(`✅ 발견된 선택자: ${selector}`);
            
            articles = await page.evaluate((selector, limit) => {
              const items = document.querySelectorAll(selector);
              const results = [];
              
              for (let i = 0; i < Math.min(items.length, limit); i++) {
                const item = items[i];
                
                try {
                  // 제목 찾기
                  let title = '';
                  const titleSelectors = ['h1', 'h2', 'h3', '.title', '.headline', '[class*="title"]', '.subject'];
                  for (const titleSel of titleSelectors) {
                    const titleEl = item.querySelector(titleSel);
                    if (titleEl?.textContent?.trim()) {
                      title = titleEl.textContent.trim();
                      break;
                    }
                  }
                  
                  // 링크 찾기
                  let url = '';
                  const linkEl = item.querySelector('a') || item.closest('a');
                  if (linkEl) {
                    url = linkEl.getAttribute('href') || '';
                    if (url.startsWith('/')) {
                      url = 'https://www.gpters.org' + url;
                    }
                  }
                  
                  // 내용/요약 찾기
                  let content = '';
                  const contentSelectors = ['.content', '.description', '.excerpt', '.summary', 'p'];
                  for (const contentSel of contentSelectors) {
                    const contentEl = item.querySelector(contentSel);
                    if (contentEl?.textContent?.trim()) {
                      content = contentEl.textContent.trim();
                      break;
                    }
                  }
                  
                  // 날짜 찾기
                  let dateStr = '';
                  const dateSelectors = ['.date', '.published', '.created', 'time', '[datetime]'];
                  for (const dateSel of dateSelectors) {
                    const dateEl = item.querySelector(dateSel);
                    if (dateEl) {
                      dateStr = dateEl.textContent?.trim() || dateEl.getAttribute('datetime') || '';
                      if (dateStr) break;
                    }
                  }
                  
                  // 작성자 정보
                  let authorName = 'GPTERS';
                  const authorSelectors = ['.author', '.writer', '.by', '[class*="author"]'];
                  for (const authorSel of authorSelectors) {
                    const authorEl = item.querySelector(authorSel);
                    if (authorEl?.textContent?.trim()) {
                      authorName = authorEl.textContent.trim();
                      break;
                    }
                  }
                  
                  if (title || content) {
                    let publishedAt = new Date();
                    if (dateStr) {
                      const parsed = new Date(dateStr);
                      if (!isNaN(parsed.getTime())) {
                        publishedAt = parsed;
                      }
                    }
                    
                    results.push({
                      title: title || content.substring(0, 50) + '...',
                      content: content || title,
                      url: url || 'https://www.gpters.org/newsletter',
                      authorName,
                      publishedAt: publishedAt.toISOString()
                    });
                  }
                } catch (error) {
                  console.warn('GPTERS 아이템 파싱 오류:', error);
                }
              }
              
              return results;
            }, selector, limit);
            
            if (articles.length > 0) {
              articlesFound = true;
              console.log(`✅ ${selector}로 ${articles.length}개 아티클 발견`);
              break;
            }
          } catch {
            // 이 선택자로는 찾을 수 없음, 다음 시도
            continue;
          }
        }
        
        // 아무것도 찾지 못한 경우, 전체 페이지에서 텍스트 기반으로 뉴스레터 콘텐츠 추출
        if (!articlesFound) {
          console.log('🔍 선택자로 찾지 못함, 텍스트 기반 추출 시도...');
          
          articles = await page.evaluate((limit) => {
            const results = [];
            
            // 페이지 제목을 기본 아티클로 추가
            const pageTitle = document.title || '';
            const metaDescription = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
            
            if (pageTitle.includes('뉴스레터')) {
              results.push({
                title: pageTitle,
                content: metaDescription || '지피터스 커뮤니티에서 발행하는 AI 뉴스레터입니다.',
                url: window.location.href,
                authorName: 'GPTERS',
                publishedAt: new Date().toISOString()
              });
            }
            
            // AI 관련 텍스트가 있는 헤딩 요소들을 찾아서 뉴스레터 콘텐츠로 추출
            const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
            for (const heading of headings) {
              const text = heading.textContent?.trim() || '';
              if (text.length > 10 && (
                text.includes('AI') || 
                text.includes('GPT') || 
                text.includes('뉴스레터') ||
                text.includes('인공지능') ||
                text.includes('기술') ||
                text.includes('개발')
              )) {
                const nextEl = heading.nextElementSibling;
                const content = nextEl?.textContent?.trim() || text;
                
                results.push({
                  title: text,
                  content: content.substring(0, 200),
                  url: window.location.href,
                  authorName: 'GPTERS',
                  publishedAt: new Date().toISOString()
                });
                
                if (results.length >= limit) break;
              }
            }
            
            return results;
          }, limit);
        }
        
        console.log(`✅ GPTERS에서 ${articles.length}개 아티클 추출 완료`);
        
        return articles.map((item, index) => this.transformToArticle(item, index));
        
      } finally {
        if (browser) {
          await browser.close();
        }
      }
      
    } catch (error) {
      console.error('❌ GPTERS 수집 실패:', error);
      return [];
    }
  }
  
  private transformToArticle(item: GPTERSArticleRaw, index: number): Article {
    const author: Author = {
      id: `gpters-${item.authorName || 'gpters'}`,
      name: item.authorName || 'GPTERS',
      company: 'GPTERS',
      expertise: ['AI', 'GPT'],
      articleCount: 0
    };

    const platform: Platform = {
      id: 'gpters',
      name: 'GPTERS 뉴스레터',
      type: 'community' as const,
      baseUrl: 'https://www.gpters.org',
      logoUrl: '/icons/gpters.svg',
      description: 'GPTERS AI 뉴스레터',
      isActive: true
    };

    const article: Article = {
      id: `gpters-${Date.now()}-${index}`,
      title: item.title,
      content: item.content || item.title,
      excerpt: (item.content || item.title).substring(0, 200),
      summary: (item.content || item.title).substring(0, 200),
      url: item.url,
      publishedAt: new Date(item.publishedAt),
      author,
      platform,
      tags: ['AI', 'GPT', '뉴스레터', '인공지능'],
      category: 'ai-ml' as ArticleCategory,
      contentType: 'article' as const,
      readingTime: Math.max(1, Math.ceil((item.content || item.title).length / 200)),
      trending: false,
      featured: false,
      qualityScore: 50 // Default quality score for GPTERS articles
    };

    // 내용 기반 추가 태그 제안
    const additionalTags = suggestTags(article);
    article.tags = [...new Set([...article.tags, ...additionalTags])];

    // 품질 점수 계산 (Article 객체가 완전히 구성된 후)
    const qualityMetrics = calculateQualityScore(article);
    article.qualityScore = qualityMetrics.finalScore;
    
    return article;
  }
}
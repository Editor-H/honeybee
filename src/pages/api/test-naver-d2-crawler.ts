import { NextApiRequest, NextApiResponse } from 'next';
import { SmartNaverD2Collector } from '@/lib/playwright/smart-naver-d2-collector';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const startTime = performance.now();
  
  try {
    console.log('🔍 네이버 D2 스마트 크롤러 테스트 시작...');
    
    const collector = new SmartNaverD2Collector();
    const articles = await collector.collectArticles(6);
    
    const endTime = performance.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    // 브라우저 리소스 정리
    await collector.closeBrowser();
    
    return res.status(200).json({
      success: true,
      duration: `${duration}s`,
      articlesCount: articles.length,
      articles: articles.map(article => ({
        id: article.id,
        title: article.title,
        excerpt: article.excerpt,
        url: article.url,
        publishedAt: article.publishedAt,
        author: article.author.name,
        tags: article.tags,
        category: article.category,
        qualityScore: article.qualityScore
      })),
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    const endTime = performance.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    console.error('❌ 네이버 D2 크롤러 테스트 실패:', error);
    
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      duration: `${duration}s`,
      timestamp: new Date().toISOString()
    });
  }
}
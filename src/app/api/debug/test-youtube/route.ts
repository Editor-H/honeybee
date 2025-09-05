import { NextResponse } from 'next/server';
import YouTubeCollector from '@/lib/youtube-collector';

export async function GET() {
  try {
    console.log('🧪 YouTube 수집기 테스트 시작...');
    
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey || apiKey === 'your_youtube_api_key_here') {
      return NextResponse.json({
        success: false,
        message: 'YouTube API 키가 설정되지 않았습니다',
        instructions: [
          '1. Google Cloud Console에서 프로젝트 생성',
          '2. YouTube Data API v3 활성화', 
          '3. API 키 생성',
          '4. .env.local에서 YOUTUBE_API_KEY=실제_키_값 설정',
          '5. 서버 재시작'
        ],
        mockData: {
          example: 'API 키 설정 후 실제 YouTube 데이터 수집 가능',
          keywords: ['javascript', 'react', 'vue', 'python', '개발', '프로그래밍', 'UI/UX', '디자인'],
          categories: ['Science & Technology', 'Education'],
          filters: {
            minViews: 1000,
            minLikes: 10,
            duration: '5분-1시간',
            publishedWithin: '90일 이내'
          }
        }
      });
    }

    // YouTube 수집기 테스트 (소량)
    const youtubeCollector = new YouTubeCollector(apiKey);
    const articles = await youtubeCollector.collectTrendingITVideos(5); // 테스트용 5개만
    
    const summary = {
      totalVideos: articles.length,
      platforms: articles.map(a => a.platform.name),
      categories: [...new Set(articles.map(a => a.category))],
      viewCounts: articles.map(a => ({ title: a.title.substring(0, 50) + '...', views: a.viewCount })),
      channels: [...new Set(articles.map(a => a.platform.channelName))].filter(Boolean),
      contentTypes: [...new Set(articles.map(a => a.contentType))]
    };
    
    console.log('✅ YouTube 수집기 테스트 완료');
    
    return NextResponse.json({
      success: true,
      message: 'YouTube IT 카테고리 수집 테스트 완료',
      summary,
      sampleVideo: articles.length > 0 ? {
        title: articles[0].title,
        channel: articles[0].platform.channelName,
        views: articles[0].viewCount,
        category: articles[0].category,
        tags: articles[0].tags.slice(0, 5),
        url: articles[0].url
      } : null,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ YouTube 테스트 실패:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
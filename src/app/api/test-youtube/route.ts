import { NextResponse } from 'next/server';
import Parser from 'rss-parser';

const parser = new Parser();

export async function GET() {
  try {
    console.log('🔄 YouTube 교육 채널 테스트 시작');
    
    const platforms = {
      jocoding: {
        id: 'jocoding',
        name: 'YouTube',
        channelName: '조코딩',
        rssUrl: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCQNE2JmbasNYbjGAcuBiRRg'
      },
      opentutorials: {
        id: 'opentutorials', 
        name: 'YouTube',
        channelName: '생활코딩',
        rssUrl: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCvc8kv-i5fvFTJBFAk6n1SA'
      }
    };

    const results = [];

    for (const [platformKey, platformData] of Object.entries(platforms)) {
      try {
        console.log(`🔄 ${platformData.channelName} RSS 파싱 중...`);
        
        const feed = await parser.parseURL(platformData.rssUrl);
        console.log(`✓ ${platformData.channelName}: ${feed.items?.length || 0}개 아이템`);

        const educationalChannels = ['jocoding', 'opentutorials'];
        const isEducational = educationalChannels.includes(platformKey);

        const articles = feed.items?.slice(0, 3).map((item, index) => {
          const videoId = item.link ? item.link.split('v=')[1]?.split('&')[0] : null;
          
          return {
            id: `${platformKey}-${index}`,
            title: item.title || '제목 없음',
            contentType: isEducational ? 'lecture' : 'video',
            platform: platformData.channelName,
            publishedAt: item.pubDate,
            videoUrl: item.link,
            videoId,
            isEducational,
            platformKey
          };
        }) || [];

        results.push({
          platform: platformData.channelName,
          platformKey,
          isEducational,
          itemCount: feed.items?.length || 0,
          articles
        });

      } catch (error) {
        console.error(`❌ ${platformData.channelName} 실패:`, error);
        results.push({
          platform: platformData.channelName,
          platformKey,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return NextResponse.json({
      success: true,
      results
    });

  } catch (error) {
    console.error('YouTube 테스트 실패:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
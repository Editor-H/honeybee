import { PlatformConfig } from '@/config/platforms';
import { addNewPlatform } from '@/lib/rss-collector-refactored';

// 📚 새 플랫폼 추가 예제들

// 1. RSS 기반 기업 블로그 추가
export const addCompanyBlog = async () => {
  const newPlatform: PlatformConfig = {
    id: 'new_company',
    name: '새로운 기업 기술블로그',
    type: 'corporate',
    baseUrl: 'https://tech.newcompany.com',
    description: '새로운 회사의 기술 블로그',
    isActive: true,
    collectionMethod: 'rss',
    rssUrl: 'https://tech.newcompany.com/feed.xml',
    limit: 10,
    timeout: 15000
  };

  try {
    await addNewPlatform(newPlatform);
    console.log('✅ 새 기업 블로그 추가 성공!');
  } catch (error) {
    console.error('❌ 플랫폼 추가 실패:', error);
  }
};

// 2. 크롤러 기반 교육 플랫폼 추가
export const addEducationalPlatform = async () => {
  const newPlatform: PlatformConfig = {
    id: 'new_edu',
    name: '새로운 교육 플랫폼',
    type: 'educational',
    baseUrl: 'https://learn.newsite.com',
    description: '온라인 교육 플랫폼',
    isActive: true,
    collectionMethod: 'crawler',
    crawlerType: 'new_edu', // 새 크롤러 타입 (별도 구현 필요)
    limit: 8,
    timeout: 30000,
    retries: 3
  };

  try {
    await addNewPlatform(newPlatform);
    console.log('✅ 새 교육 플랫폼 추가 성공!');
  } catch (error) {
    console.error('❌ 플랫폼 추가 실패:', error);
  }
};

// 3. YouTube 채널 추가
export const addYouTubeChannel = async () => {
  const newPlatform: PlatformConfig = {
    id: 'new_youtube',
    name: 'YouTube',
    type: 'educational',
    baseUrl: 'https://www.youtube.com/@newchannel',
    channelName: '새로운 개발 채널',
    description: '새로운 프로그래밍 교육 채널',
    isActive: true,
    collectionMethod: 'rss',
    rssUrl: 'https://www.youtube.com/feeds/videos.xml?channel_id=UC_NEW_CHANNEL_ID',
    limit: 5
  };

  try {
    await addNewPlatform(newPlatform);
    console.log('✅ 새 YouTube 채널 추가 성공!');
  } catch (error) {
    console.error('❌ 플랫폼 추가 실패:', error);
  }
};

// 4. 미디어/뉴스 사이트 추가
export const addMediaSite = async () => {
  const newPlatform: PlatformConfig = {
    id: 'new_media',
    name: '새로운 IT 미디어',
    type: 'media',
    baseUrl: 'https://newmedia.com',
    description: 'IT 업계 뉴스와 트렌드',
    isActive: true,
    collectionMethod: 'rss',
    rssUrl: 'https://newmedia.com/tech/feed',
    limit: 6
  };

  try {
    await addNewPlatform(newPlatform);
    console.log('✅ 새 미디어 사이트 추가 성공!');
  } catch (error) {
    console.error('❌ 플랫폼 추가 실패:', error);
  }
};

// 5. 배치로 여러 플랫폼 추가
export const addMultiplePlatforms = async () => {
  const platforms: PlatformConfig[] = [
    {
      id: 'platform1',
      name: '플랫폼 1',
      type: 'corporate',
      baseUrl: 'https://platform1.com',
      description: '첫 번째 플랫폼',
      isActive: true,
      collectionMethod: 'rss',
      rssUrl: 'https://platform1.com/feed',
      limit: 8
    },
    {
      id: 'platform2',
      name: '플랫폼 2',
      type: 'community',
      baseUrl: 'https://platform2.com',
      description: '두 번째 플랫폼',
      isActive: true,
      collectionMethod: 'rss',
      rssUrl: 'https://platform2.com/rss',
      limit: 5
    }
  ];

  for (const platform of platforms) {
    try {
      await addNewPlatform(platform);
      console.log(`✅ ${platform.name} 추가 성공!`);
    } catch (error) {
      console.error(`❌ ${platform.name} 추가 실패:`, error);
    }
  }
};

// 💡 사용법 예시:
export const usageExample = () => {
  console.log(`
// 📖 새 플랫폼 추가 방법

// 1. 간단한 RSS 플랫폼
const simplePlatform: PlatformConfig = {
  id: 'unique_id',           // 고유 ID (필수)
  name: '플랫폼 이름',        // 표시 이름 (필수)  
  type: 'corporate',         // 타입: corporate, educational, media, community, personal
  baseUrl: 'https://...',    // 기본 URL (필수)
  description: '설명',       // 플랫폼 설명
  isActive: true,            // 활성화 여부 (필수)
  collectionMethod: 'rss',   // 수집 방법: rss, crawler, api (필수)
  rssUrl: 'https://.../feed', // RSS URL (RSS 방식시 필수)
  limit: 10                  // 수집 한도 (필수)
};

// 2. 크롤러 기반 플랫폼
const crawlerPlatform: PlatformConfig = {
  id: 'crawler_id',
  name: '크롤러 플랫폼',
  type: 'educational', 
  baseUrl: 'https://...',
  description: '크롤러로 수집하는 플랫폼',
  isActive: true,
  collectionMethod: 'crawler',
  crawlerType: 'custom_crawler', // 크롤러 타입 (크롤러 방식시 필수)
  limit: 8,
  timeout: 30000,  // 타임아웃 (선택사항)
  retries: 3       // 재시도 횟수 (선택사항)
};

// 3. 플랫폼 추가 실행
await addNewPlatform(simplePlatform);
  `);
};

// 🚀 즉시 실행 예제 (개발 시에만 사용)
if (process.env.NODE_ENV === 'development') {
  // addCompanyBlog();
  // addYouTubeChannel();
  // usageExample();
}
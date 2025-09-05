// 📋 플랫폼 프로필 시스템 사용 가이드 및 예제

/**
 * 🚀 플랫폼 프로필 시스템 개요
 * 
 * 이 시스템은 새로운 플랫폼을 추가할 때 자동으로 상세한 프로필 정보를 생성하고 관리합니다.
 * 
 * 주요 기능:
 * 1. 자동 플랫폼 메타데이터 생성
 * 2. 회사/기관 정보 자동 매핑
 * 3. 기술 스택 및 콘텐츠 특성 분석
 * 4. RSS URL 자동 감지
 * 5. 수집 방법 자동 추론
 */

import { PlatformProfileManager } from '@/lib/platform-profile-manager';
import { getActiveProfiles, getProfilesByType } from '@/config/platform-profiles';

// =====================================
// 🔧 1. 자동 플랫폼 프로필 생성 예제
// =====================================

export const autoGenerateExamples = {
  
  // 예제 1: URL만으로 완전 자동 생성
  async generateFromUrlOnly() {
    console.log('📍 예제 1: URL만으로 자동 생성');
    
    const profile = await PlatformProfileManager.autoGenerateProfile(
      'https://engineering.linecorp.com/ko'
    );
    
    console.log('✅ 생성된 프로필:', profile);
    return profile;
  },

  // 예제 2: 기본 정보와 함께 자동 생성
  async generateWithBasicInfo() {
    console.log('📍 예제 2: 기본 정보 포함 자동 생성');
    
    const profile = await PlatformProfileManager.autoGenerateProfile(
      'https://blog.example.com',
      '예제 회사 블로그',
      {
        type: 'corporate',
        limit: 10
      }
    );
    
    console.log('✅ 생성된 프로필:', profile);
    return profile;
  },

  // 예제 3: 한국 스타트업 기술 블로그 생성
  async generateKoreanStartupBlog() {
    console.log('📍 예제 3: 한국 스타트업 자동 생성');
    
    const profile = await PlatformProfileManager.autoGenerateProfile(
      'https://tech.startup.com',
      '스타트업 기술블로그',
      {
        type: 'corporate',
        description: 'AI 스타트업의 기술 경험 공유',
        limit: 8
      }
    );
    
    // 자동 생성된 프로필의 특성 확인
    console.log('🏢 회사 정보:', profile.company);
    console.log('🛠️ 기술 스택:', profile.techStack);
    console.log('📝 콘텐츠 특성:', profile.content);
    
    return profile;
  }
};

// =====================================
// 🔍 2. 프로필 조회 및 분석 예제
// =====================================

export const profileAnalysisExamples = {
  
  // 예제 1: 활성 플랫폼 프로필 분석
  analyzeActiveProfiles() {
    console.log('📍 예제 1: 활성 플랫폼 분석');
    
    const activeProfiles = getActiveProfiles();
    
    // 타입별 분포
    const byType = activeProfiles.reduce((acc, profile) => {
      acc[profile.type] = (acc[profile.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // 언어별 분포
    const byLanguage = activeProfiles.reduce((acc, profile) => {
      const lang = profile.content?.language || 'unknown';
      acc[lang] = (acc[lang] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // 기술 스택 분석
    const allTechStack = activeProfiles
      .flatMap(profile => profile.techStack || [])
      .reduce((acc, tech) => {
        acc[tech] = (acc[tech] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
    
    console.log('📊 분석 결과:');
    console.log('- 타입별 분포:', byType);
    console.log('- 언어별 분포:', byLanguage);
    console.log('- 인기 기술 스택:', Object.entries(allTechStack).sort(([,a], [,b]) => b - a).slice(0, 10));
    
    return {
      total: activeProfiles.length,
      byType,
      byLanguage,
      popularTechStack: allTechStack
    };
  },

  // 예제 2: 기업 블로그 심화 분석
  analyzeCompanyBlogs() {
    console.log('📍 예제 2: 기업 블로그 분석');
    
    const corporateProfiles = getProfilesByType('corporate');
    
    // 회사 규모별 분포
    const bySizeDistribution = corporateProfiles.reduce((acc, profile) => {
      const size = profile.company?.size || 'unknown';
      acc[size] = (acc[size] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // 산업별 분포
    const byIndustry = corporateProfiles.reduce((acc, profile) => {
      const industry = profile.company?.industry || 'unknown';
      acc[industry] = (acc[industry] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // 콘텐츠 품질 점수 분석
    const qualityScores = corporateProfiles
      .filter(p => p.automated?.contentQualityScore)
      .map(p => ({ name: p.name, score: p.automated!.contentQualityScore! }))
      .sort((a, b) => b.score - a.score);
    
    console.log('🏢 기업 블로그 분석:');
    console.log('- 회사 규모별:', bySizeDistribution);
    console.log('- 산업별 분포:', byIndustry);
    console.log('- 품질 점수 상위 5:', qualityScores.slice(0, 5));
    
    return {
      bySizeDistribution,
      byIndustry,
      topQualityBlogs: qualityScores
    };
  }
};

// =====================================
// 🛠️ 3. API 사용 예제
// =====================================

export const apiUsageExamples = {
  
  // 예제 1: 자동 플랫폼 추가 API 호출
  async addPlatformWithAutoGeneration() {
    console.log('📍 예제 1: 자동 프로필 생성으로 플랫폼 추가');
    
    try {
      const response = await fetch('/api/platforms/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          autoGenerate: true,
          baseUrl: 'https://engineering.example.com',
          name: '예제 엔지니어링 블로그'
        })
      });
      
      const result = await response.json();
      console.log('✅ API 응답:', result);
      return result;
      
    } catch (error) {
      console.error('❌ API 호출 실패:', error);
      throw error;
    }
  },

  // 예제 2: 프로필 조회 API 호출
  async fetchPlatformProfiles() {
    console.log('📍 예제 2: 플랫폼 프로필 조회');
    
    try {
      // 모든 활성 프로필 조회
      const activeResponse = await fetch('/api/platforms/profiles?active=true');
      const activeResult = await activeResponse.json();
      
      console.log('✅ 활성 프로필:', activeResult.stats);
      
      // 특정 타입 프로필 조회
      const corporateResponse = await fetch('/api/platforms/profiles?type=corporate');
      const corporateResult = await corporateResponse.json();
      
      console.log('✅ 기업 프로필:', corporateResult.profiles.length, '개');
      
      return {
        active: activeResult,
        corporate: corporateResult
      };
      
    } catch (error) {
      console.error('❌ API 호출 실패:', error);
      throw error;
    }
  }
};

// =====================================
// 📝 4. 새 플랫폼 추가 가이드
// =====================================

export const newPlatformGuide = {
  
  // 가이드: RSS 기반 플랫폼 추가
  rssBasedPlatform: {
    title: '🔄 RSS 기반 플랫폼 추가하기',
    steps: [
      '1. 플랫폼 URL 확인',
      '2. RSS 피드 URL 찾기 (자동 감지 또는 수동 설정)',
      '3. 자동 프로필 생성 API 호출',
      '4. 생성된 프로필 검토 및 필요시 수정',
      '5. 테스트 수집 실행'
    ],
    example: `
// 자동 프로필 생성으로 추가
const response = await fetch('/api/platforms/add', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    autoGenerate: true,
    baseUrl: 'https://newblog.example.com'
  })
});
    `,
    tips: [
      '대부분의 WordPress 블로그는 /feed 또는 /rss.xml을 지원합니다',
      'Medium은 /feed/[publication-name] 형태입니다',
      'YouTube는 채널 ID가 필요합니다'
    ]
  },
  
  // 가이드: 크롤러 기반 플랫폼 추가
  crawlerBasedPlatform: {
    title: '🕷️ 크롤러 기반 플랫폼 추가하기',
    steps: [
      '1. 플랫폼 구조 분석 (CSS 선택자, API 엔드포인트)',
      '2. 전용 크롤러 개발',
      '3. 크롤러 팩토리에 등록',
      '4. 프로필 생성 및 테스트'
    ],
    example: `
// 크롤러가 필요한 플랫폼 추가
const response = await fetch('/api/platforms/add', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    id: 'new_platform',
    name: '새 플랫폼',
    type: 'educational',
    baseUrl: 'https://newplatform.com',
    collectionMethod: 'crawler',
    crawlerType: 'new_platform_crawler'
  })
});
    `,
    requirements: [
      '크롤러 클래스 구현 필요',
      'CollectorFactory에 등록 필요',
      '적절한 선택자와 파싱 로직 필요'
    ]
  }
};

// =====================================
// 🧪 5. 테스트 및 검증 예제
// =====================================

export const testingExamples = {
  
  // 프로필 유효성 검사
  validateProfile(profile: Record<string, unknown>) {
    console.log('📍 프로필 유효성 검사');
    
    const requiredFields = ['id', 'name', 'type', 'baseUrl', 'isActive', 'collectionMethod'];
    const missingFields = requiredFields.filter(field => !profile[field]);
    
    if (missingFields.length > 0) {
      console.error('❌ 필수 필드 누락:', missingFields);
      return false;
    }
    
    // RSS 방식인 경우 RSS URL 확인
    if (profile.collectionMethod === 'rss' && !profile.rssUrl) {
      console.error('❌ RSS 방식인데 rssUrl이 없습니다');
      return false;
    }
    
    // 크롤러 방식인 경우 크롤러 타입 확인
    if (profile.collectionMethod === 'crawler' && !profile.crawlerType) {
      console.error('❌ 크롤러 방식인데 crawlerType이 없습니다');
      return false;
    }
    
    console.log('✅ 프로필 유효성 검사 통과');
    return true;
  },
  
  // 수집 테스트
  async testCollection(platformId: string) {
    console.log(`📍 플랫폼 ${platformId} 수집 테스트`);
    
    try {
      const response = await fetch('/api/feeds/refresh', { method: 'POST' });
      const result = await response.json();
      
      console.log('✅ 수집 테스트 완료:', result.totalArticles, '개 수집');
      return result;
      
    } catch (error) {
      console.error('❌ 수집 테스트 실패:', error);
      throw error;
    }
  }
};

// 사용법 예시 실행
export function runExamples() {
  console.log(`
🚀 플랫폼 프로필 시스템 사용법

1. 자동 프로필 생성:
   await autoGenerateExamples.generateFromUrlOnly();

2. 프로필 분석:
   profileAnalysisExamples.analyzeActiveProfiles();

3. API로 플랫폼 추가:
   await apiUsageExamples.addPlatformWithAutoGeneration();

4. 수집 테스트:
   await testingExamples.testCollection('platform_id');
  `);
}
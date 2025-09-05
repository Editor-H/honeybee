import { Article } from '@/types/article';
import { CacheManager } from './cache-manager';
import { PLATFORM_CONFIGS, getActivePlatforms, PlatformConfig } from '@/config/platforms';
import { PlatformCollector, CollectionResult } from './collectors/platform-collector';
import { calculateQualityScore, filterHighQualityArticles } from './content-quality-scorer';

export class ContentCollectionService {
  private platformCollector = new PlatformCollector();

  async collectAllContent(): Promise<Article[]> {
    console.log('🚀 === 통합 콘텐츠 수집 시작 ===');
    const startTime = Date.now();
    
    const activePlatforms = getActivePlatforms();
    console.log(`활성화된 플랫폼: ${activePlatforms.length}개`);
    
    // 병렬 수집 처리
    const results = await this.collectInBatches(activePlatforms);
    
    // 결과 통계
    const successCount = results.filter(r => r.success).length;
    const totalArticles = results.reduce((sum, r) => sum + r.articles.length, 0);
    
    console.log(`📊 수집 완료: ${successCount}/${activePlatforms.length} 성공, ${totalArticles}개 아티클`);
    
    // 모든 아티클 합치기
    const allArticles = results.flatMap(result => result.articles);
    
    // 큐레이션 및 품질 필터링
    const curatedArticles = this.curateArticles(allArticles);
    
    // 캐시 저장
    await CacheManager.setCachedArticles(curatedArticles);
    
    const totalTime = Date.now() - startTime;
    console.log(`✅ 전체 프로세스 완료: ${curatedArticles.length}개 아티클 (총 ${Math.round(totalTime/1000)}초)`);
    
    // 실패한 플랫폼 로깅
    const failedPlatforms = results.filter(r => !r.success);
    if (failedPlatforms.length > 0) {
      console.log('❌ 실패한 플랫폼들:');
      failedPlatforms.forEach(result => {
        console.log(`  - ${result.platformName}: ${result.error}`);
      });
    }
    
    console.log('=== 통합 콘텐츠 수집 종료 ===\n');
    
    return curatedArticles;
  }

  private async collectInBatches(platforms: PlatformConfig[]): Promise<CollectionResult[]> {
    const batchSize = 8; // 병렬 처리 배치 크기
    const allResults: CollectionResult[] = [];
    
    for (let i = 0; i < platforms.length; i += batchSize) {
      const batch = platforms.slice(i, i + batchSize);
      const batchNum = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(platforms.length / batchSize);
      
      console.log(`\n📦 배치 ${batchNum}/${totalBatches}: ${batch.length}개 플랫폼`);
      
      // 배치 병렬 처리
      const batchPromises = batch.map(platform => 
        this.collectWithTimeout(platform)
      );
      
      const batchResults = await Promise.allSettled(batchPromises);
      
      // 결과 처리
      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          allResults.push(result.value);
        } else {
          const platform = batch[index];
          allResults.push({
            platformId: platform.id,
            platformName: platform.name,
            articles: [],
            success: false,
            error: `Promise rejected: ${result.reason}`,
            duration: 0,
            method: platform.collectionMethod
          });
        }
      });
      
      const batchSuccess = batchResults.filter(r => r.status === 'fulfilled').length;
      console.log(`배치 ${batchNum} 완료: ${batchSuccess}/${batch.length} 성공`);
      
      // 다음 배치 전 짧은 대기
      if (i + batchSize < platforms.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    return allResults;
  }

  private async collectWithTimeout(platform: PlatformConfig): Promise<CollectionResult> {
    const timeout = platform.timeout || 15000;
    
    return Promise.race([
      this.platformCollector.collectFromPlatform(platform),
      new Promise<CollectionResult>((_, reject) => 
        setTimeout(() => reject(new Error(`타임아웃 (${timeout}ms)`)), timeout)
      )
    ]);
  }

  private curateArticles(articles: Article[]): Article[] {
    console.log(`📝 큐레이션 시작: ${articles.length}개 아티클`);
    
    // 중복 제거 (URL 기준)
    const uniqueArticles = this.removeDuplicates(articles);
    console.log(`🔄 중복 제거 후: ${uniqueArticles.length}개 아티클`);
    
    // 품질 점수 계산
    const scoredArticles = uniqueArticles.map(article => {
      if (!article.qualityScore) {
        article.qualityScore = calculateQualityScore({
          title: article.title,
          content: article.content,
          author: article.author.name
        });
      }
      return article;
    });
    
    // 품질 필터링 비활성화 (모든 아티클 통과)
    const filteredArticles = scoredArticles;
    
    // 최신순 정렬
    const sortedArticles = filteredArticles.sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
    
    console.log(`✨ 큐레이션 완료: ${sortedArticles.length}개 고품질 아티클`);
    
    return sortedArticles;
  }

  private removeDuplicates(articles: Article[]): Article[] {
    const seen = new Set<string>();
    return articles.filter(article => {
      if (seen.has(article.url)) {
        return false;
      }
      seen.add(article.url);
      return true;
    });
  }

  // 플랫폼 관리 메소드들
  async addNewPlatform(config: PlatformConfig): Promise<void> {
    console.log(`➕ 새 플랫폼 추가: ${config.name}`);
    
    // 설정 검증
    this.validatePlatformConfig(config);
    
    // 플랫폼 추가
    PLATFORM_CONFIGS[config.id] = config;
    
    // 테스트 수집
    console.log(`🧪 ${config.name} 테스트 수집 중...`);
    const result = await this.platformCollector.collectFromPlatform(config);
    
    if (result.success) {
      console.log(`✅ ${config.name} 테스트 성공: ${result.articles.length}개 아티클`);
    } else {
      console.warn(`⚠️ ${config.name} 테스트 실패: ${result.error}`);
      throw new Error(`플랫폼 테스트 실패: ${result.error}`);
    }
  }

  private validatePlatformConfig(config: PlatformConfig): void {
    if (!config.id || !config.name || !config.baseUrl) {
      throw new Error('필수 필드가 누락되었습니다: id, name, baseUrl');
    }
    
    if (PLATFORM_CONFIGS[config.id]) {
      throw new Error(`이미 존재하는 플랫폼 ID: ${config.id}`);
    }
    
    if (config.collectionMethod === 'rss' && !config.rssUrl) {
      throw new Error('RSS 수집 방식인 경우 rssUrl이 필요합니다');
    }
    
    if (config.collectionMethod === 'crawler' && !config.crawlerType) {
      throw new Error('크롤러 수집 방식인 경우 crawlerType이 필요합니다');
    }
  }

  // 통계 및 모니터링
  getCollectionStats(): {
    totalPlatforms: number;
    activePlatforms: number;
    platformsByType: Record<string, number>;
    platformsByMethod: Record<string, number>;
  } {
    const allPlatforms = Object.values(PLATFORM_CONFIGS);
    const activePlatforms = allPlatforms.filter(p => p.isActive);
    
    const byType = activePlatforms.reduce((acc, platform) => {
      acc[platform.type] = (acc[platform.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const byMethod = activePlatforms.reduce((acc, platform) => {
      acc[platform.collectionMethod] = (acc[platform.collectionMethod] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      totalPlatforms: allPlatforms.length,
      activePlatforms: activePlatforms.length,
      platformsByType: byType,
      platformsByMethod: byMethod
    };
  }
}

// 기존 함수와의 호환성을 위한 래퍼 함수들
export async function collectFreshFeedsOptimized(): Promise<Article[]> {
  const service = new ContentCollectionService();
  return await service.collectAllContent();
}

export async function collectAllFeedsOptimized(): Promise<Article[]> {
  const cachedArticles = await CacheManager.getCachedArticles();
  if (cachedArticles) {
    console.log(`✅ 캐시된 데이터 반환: ${cachedArticles.length}개 아티클`);
    return cachedArticles;
  }
  return await collectFreshFeedsOptimized();
}

// 새 플랫폼 추가를 위한 헬퍼 함수
export async function addNewPlatform(config: PlatformConfig): Promise<void> {
  const service = new ContentCollectionService();
  await service.addNewPlatform(config);
}
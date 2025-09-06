import { Page, BrowserContext } from 'playwright';

/**
 * 성능 최적화 설정 인터페이스
 */
export interface PerformanceConfig {
  // 리소스 차단
  blockResources: {
    images: boolean;
    stylesheets: boolean;
    fonts: boolean;
    media: boolean;
    websockets: boolean;
  };
  
  // 네트워크 최적화
  network: {
    timeout: number;
    maxRetries: number;
    userAgent: string;
    headers: Record<string, string>;
    blockDomains: string[];
  };

  // 브라우저 최적화
  browser: {
    disableJavaScript: boolean;
    disableImages: boolean;
    viewport: { width: number; height: number };
    deviceScaleFactor: number;
  };

  // 메모리 관리
  memory: {
    maxPagesPerContext: number;
    pageCleanupInterval: number;
    memoryThreshold: number; // MB
    forceCleanupThreshold: number; // MB
  };

  // 캐싱
  cache: {
    enableHttpCache: boolean;
    maxCacheSize: number; // MB
    cacheHeaders: boolean;
  };
}

/**
 * 성능 메트릭 인터페이스
 */
export interface PerformanceMetrics {
  pageLoadTime: number;
  domContentLoadedTime: number;
  firstContentfulPaint?: number;
  largestContentfulPaint?: number;
  totalBlockedRequests: number;
  memorySaved: number; // bytes
  bandwidthSaved: number; // bytes
  networkRequests: number;
  failedRequests: number;
}

/**
 * 리소스 차단 통계
 */
export interface ResourceBlockStats {
  totalRequests: number;
  blockedRequests: number;
  allowedRequests: number;
  blockedByType: Record<string, number>;
  blockedByDomain: Record<string, number>;
  savedBandwidth: number;
}

/**
 * Playwright 기반 성능 최적화 시스템
 * - 불필요한 리소스 차단으로 속도 향상
 * - 메모리 사용량 최적화
 * - 네트워크 최적화
 * - 실시간 성능 모니터링
 */
export class PerformanceOptimizer {
  private config: PerformanceConfig;
  private blockStats: Map<string, ResourceBlockStats> = new Map();
  private performanceMetrics: Map<string, PerformanceMetrics> = new Map();
  private memoryMonitorTimer: NodeJS.Timeout | null = null;

  constructor(config?: Partial<PerformanceConfig>) {
    this.config = {
      blockResources: {
        images: true,
        stylesheets: false,
        fonts: true,
        media: true,
        websockets: false
      },
      network: {
        timeout: 30000,
        maxRetries: 3,
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
          'Accept-Encoding': 'gzip, deflate, br',
          'DNT': '1',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1'
        },
        blockDomains: [
          'googletag', 'googleads', 'google-analytics', 'googletagmanager',
          'facebook.com/tr', 'connect.facebook.net', 'facebook.net',
          'doubleclick.net', 'googlesyndication.com', 'adsystem.com',
          'outbrain.com', 'taboola.com', 'amazon-adsystem.com',
          'criteo.com', 'adsafeprotected.com', 'scorecardresearch.com',
          'quantserve.com', 'hotjar.com', 'fullstory.com'
        ]
      },
      browser: {
        disableJavaScript: false,
        disableImages: true,
        viewport: { width: 1200, height: 800 },
        deviceScaleFactor: 1
      },
      memory: {
        maxPagesPerContext: 5,
        pageCleanupInterval: 60000, // 1분
        memoryThreshold: 512, // 512MB
        forceCleanupThreshold: 1024 // 1GB
      },
      cache: {
        enableHttpCache: true,
        maxCacheSize: 100, // 100MB
        cacheHeaders: true
      },
      ...config
    };

    this.startMemoryMonitoring();
  }

  /**
   * 페이지 성능 최적화 적용
   */
  public async optimizePage(page: Page, sessionId?: string): Promise<void> {
    const startTime = Date.now();
    const sid = sessionId || this.generateSessionId();
    
    // 통계 초기화
    this.initializeStats(sid);

    try {
      // 기본 설정 적용
      await this.applyBasicOptimizations(page);
      
      // 리소스 차단 설정
      await this.setupResourceBlocking(page, sid);
      
      // 성능 모니터링 설정
      await this.setupPerformanceMonitoring(page, sid);
      
      // 메모리 최적화 설정
      await this.setupMemoryOptimizations(page);
      
      console.log(`⚡ 페이지 최적화 완료 [${sid}] (${Date.now() - startTime}ms)`);
      
    } catch (error) {
      console.error(`성능 최적화 설정 실패 [${sid}]:`, error);
      throw error;
    }
  }

  /**
   * 컨텍스트 성능 최적화
   */
  public async optimizeContext(context: BrowserContext): Promise<void> {
    try {
      // HTTP 캐시 설정
      if (this.config.cache.enableHttpCache) {
        await context.route('**/*', (route, request) => {
          const url = request.url();
          
          // 정적 리소스에 대한 캐시 헤더 설정
          if (this.isStaticResource(url)) {
            const headers = { ...request.headers() };
            if (this.config.cache.cacheHeaders) {
              headers['Cache-Control'] = 'public, max-age=86400'; // 24시간
            }
            route.continue({ headers });
          } else {
            route.continue();
          }
        });
      }

      // 기본 헤더 설정
      await context.setExtraHTTPHeaders(this.config.network.headers);

      console.log('🚀 컨텍스트 최적화 완료');
      
    } catch (error) {
      console.error('컨텍스트 최적화 실패:', error);
      throw error;
    }
  }

  /**
   * 기본 최적화 설정
   */
  private async applyBasicOptimizations(page: Page): Promise<void> {
    // 뷰포트 설정
    await page.setViewportSize(this.config.browser.viewport);

    // 타임아웃 설정
    page.setDefaultTimeout(this.config.network.timeout);
    page.setDefaultNavigationTimeout(this.config.network.timeout);

    // JavaScript 비활성화 (필요한 경우)
    if (this.config.browser.disableJavaScript) {
      await page.context().addInitScript(() => {
        Object.defineProperty(window, 'navigator', {
          value: new Proxy(navigator, {
            get: (target, prop) => {
              if (prop === 'webdriver') return undefined;
              return target[prop as keyof Navigator];
            }
          })
        });
      });
    }

    // 페이지 에러 무시 설정
    page.on('pageerror', () => {}); // 무시
    page.on('console', (msg) => {
      if (msg.type() === 'error' && !msg.text().includes('favicon')) {
        console.debug(`Console error: ${msg.text()}`);
      }
    });
  }

  /**
   * 리소스 차단 설정
   */
  private async setupResourceBlocking(page: Page, sessionId: string): Promise<void> {
    const stats = this.blockStats.get(sessionId)!;

    await page.route('**/*', (route, request) => {
      const url = request.url();
      const resourceType = request.resourceType();
      
      stats.totalRequests++;

      try {
        // 도메인 차단 확인
        if (this.shouldBlockDomain(url)) {
          stats.blockedRequests++;
          stats.blockedByDomain[this.extractDomain(url)] = 
            (stats.blockedByDomain[this.extractDomain(url)] || 0) + 1;
          route.abort();
          return;
        }

        // 리소스 타입 차단 확인
        if (this.shouldBlockResourceType(resourceType)) {
          stats.blockedRequests++;
          stats.blockedByType[resourceType] = (stats.blockedByType[resourceType] || 0) + 1;
          
          // 대략적인 대역폭 절약 계산
          stats.savedBandwidth += this.estimateResourceSize(resourceType);
          
          route.abort();
          return;
        }

        // 허용된 요청
        stats.allowedRequests++;
        route.continue();

      } catch (error) {
        console.debug('리소스 차단 처리 중 오류:', error);
        stats.allowedRequests++;
        route.continue();
      }
    });
  }

  /**
   * 성능 모니터링 설정
   */
  private async setupPerformanceMonitoring(page: Page, sessionId: string): Promise<void> {
    const startTime = Date.now();
    let domContentLoadedTime = 0;
    let pageLoadTime = 0;
    let networkRequests = 0;
    let failedRequests = 0;

    // DOM 이벤트 리스너
    page.on('domcontentloaded', () => {
      domContentLoadedTime = Date.now() - startTime;
    });

    page.on('load', () => {
      pageLoadTime = Date.now() - startTime;
    });

    // 네트워크 요청 모니터링
    page.on('request', () => {
      networkRequests++;
    });

    page.on('requestfailed', () => {
      failedRequests++;
    });

    // 페이지가 로드된 후 성능 메트릭 수집
    page.on('load', async () => {
      try {
        // Web Vitals 수집
        const vitals = await page.evaluate(() => {
          return new Promise((resolve) => {
            // Performance Observer 사용 (브라우저가 지원하는 경우)
            if ('PerformanceObserver' in window) {
              const metrics: Record<string, number> = {};
              let pendingMetrics = 2; // FCP, LCP

              const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                  if (entry.entryType === 'paint' && entry.name === 'first-contentful-paint') {
                    metrics.firstContentfulPaint = entry.startTime;
                    pendingMetrics--;
                  } else if (entry.entryType === 'largest-contentful-paint') {
                    metrics.largestContentfulPaint = entry.startTime;
                    pendingMetrics--;
                  }
                }

                if (pendingMetrics <= 0) {
                  observer.disconnect();
                  resolve(metrics);
                }
              });

              observer.observe({ entryTypes: ['paint', 'largest-contentful-paint'] });

              // 타임아웃 설정 (3초 후 현재까지의 메트릭 반환)
              setTimeout(() => {
                observer.disconnect();
                resolve(metrics);
              }, 3000);
            } else {
              resolve({});
            }
          });
        });

        const stats = this.blockStats.get(sessionId)!;
        
        const metrics: PerformanceMetrics = {
          pageLoadTime,
          domContentLoadedTime,
          firstContentfulPaint: (vitals as Record<string, number>).firstContentfulPaint,
          largestContentfulPaint: (vitals as Record<string, number>).largestContentfulPaint,
          totalBlockedRequests: stats.blockedRequests,
          memorySaved: this.calculateMemorySaved(stats),
          bandwidthSaved: stats.savedBandwidth,
          networkRequests,
          failedRequests
        };

        this.performanceMetrics.set(sessionId, metrics);
        
      } catch (error) {
        console.debug('성능 메트릭 수집 실패:', error);
      }
    });
  }

  /**
   * 메모리 최적화 설정
   */
  private async setupMemoryOptimizations(page: Page): Promise<void> {
    // 페이지 메모리 사용량 모니터링
    const checkMemoryUsage = async () => {
      try {
        const memoryUsage = process.memoryUsage();
        const heapUsedMB = memoryUsage.heapUsed / 1024 / 1024;

        if (heapUsedMB > this.config.memory.forceCleanupThreshold) {
          console.warn(`Critical memory usage: ${heapUsedMB.toFixed(2)}MB`);
          await this.forceMemoryCleanup(page);
        } else if (heapUsedMB > this.config.memory.memoryThreshold) {
          console.warn(`High memory usage: ${heapUsedMB.toFixed(2)}MB`);
          await this.gentleMemoryCleanup(page);
        }

      } catch (error) {
        console.debug('메모리 사용량 확인 실패:', error);
      }
    };

    // 주기적 메모리 체크
    const memoryCheckInterval = setInterval(checkMemoryUsage, this.config.memory.pageCleanupInterval);

    // 페이지 종료 시 인터벌 정리
    page.on('close', () => {
      clearInterval(memoryCheckInterval);
    });
  }

  /**
   * 도메인 차단 여부 확인
   */
  private shouldBlockDomain(url: string): boolean {
    const domain = this.extractDomain(url);
    return this.config.network.blockDomains.some(blockedDomain =>
      domain.includes(blockedDomain)
    );
  }

  /**
   * 리소스 타입 차단 여부 확인
   */
  private shouldBlockResourceType(resourceType: string): boolean {
    const blockConfig = this.config.blockResources;
    
    switch (resourceType) {
      case 'image':
        return blockConfig.images;
      case 'stylesheet':
        return blockConfig.stylesheets;
      case 'font':
        return blockConfig.fonts;
      case 'media':
        return blockConfig.media;
      case 'websocket':
        return blockConfig.websockets;
      default:
        return false;
    }
  }

  /**
   * 정적 리소스 여부 확인
   */
  private isStaticResource(url: string): boolean {
    const staticExtensions = ['.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.woff', '.woff2'];
    return staticExtensions.some(ext => url.toLowerCase().includes(ext));
  }

  /**
   * 도메인 추출
   */
  private extractDomain(url: string): string {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  }

  /**
   * 리소스 크기 추정 (대략적)
   */
  private estimateResourceSize(resourceType: string): number {
    const estimatedSizes: Record<string, number> = {
      'image': 50 * 1024, // 50KB
      'stylesheet': 20 * 1024, // 20KB  
      'font': 100 * 1024, // 100KB
      'media': 500 * 1024, // 500KB
      'script': 30 * 1024, // 30KB
    };

    return estimatedSizes[resourceType] || 10 * 1024; // 기본 10KB
  }

  /**
   * 메모리 절약량 계산
   */
  private calculateMemorySaved(stats: ResourceBlockStats): number {
    // 차단된 리소스로 인한 메모리 절약량 추정
    let memorySaved = 0;
    
    for (const [resourceType, count] of Object.entries(stats.blockedByType)) {
      memorySaved += count * this.estimateResourceSize(resourceType);
    }
    
    return memorySaved;
  }

  /**
   * 강제 메모리 정리
   */
  private async forceMemoryCleanup(page: Page): Promise<void> {
    try {
      // JavaScript 가비지 컬렉션 강제 실행
      await page.evaluate(() => {
        if (window.gc) {
          window.gc();
        }
      });

      // Node.js 가비지 컬렉션 강제 실행 (가능한 경우)
      if (global.gc) {
        global.gc();
      }

      console.log('🗑️ 강제 메모리 정리 완료');

    } catch (error) {
      console.debug('강제 메모리 정리 실패:', error);
    }
  }

  /**
   * 부드러운 메모리 정리
   */
  private async gentleMemoryCleanup(page: Page): Promise<void> {
    try {
      // 페이지 내 불필요한 DOM 요소 정리
      await page.evaluate(() => {
        // 숨겨진 요소들 제거
        const hiddenElements = document.querySelectorAll('[style*="display: none"], [hidden]');
        hiddenElements.forEach(el => el.remove());

        // 빈 텍스트 노드 제거
        const walker = document.createTreeWalker(
          document.body,
          NodeFilter.SHOW_TEXT,
          {
            acceptNode: (node) => {
              return node.nodeValue && node.nodeValue.trim() === '' ? 
                NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
            }
          }
        );

        const emptyTextNodes: Node[] = [];
        let node;
        while (node = walker.nextNode()) {
          emptyTextNodes.push(node);
        }
        emptyTextNodes.forEach(node => node.parentNode?.removeChild(node));
      });

      console.log('🧹 부드러운 메모리 정리 완료');

    } catch (error) {
      console.debug('부드러운 메모리 정리 실패:', error);
    }
  }

  /**
   * 메모리 모니터링 시작
   */
  private startMemoryMonitoring(): void {
    this.memoryMonitorTimer = setInterval(() => {
      const memoryUsage = process.memoryUsage();
      const heapUsedMB = memoryUsage.heapUsed / 1024 / 1024;

      if (heapUsedMB > this.config.memory.memoryThreshold) {
        console.warn(`🚨 높은 메모리 사용량: ${heapUsedMB.toFixed(2)}MB`);
      }

      // 극한 상황에서는 프로세스 재시작 권고
      if (heapUsedMB > this.config.memory.forceCleanupThreshold * 1.5) {
        console.error(`❌ 임계 메모리 사용량: ${heapUsedMB.toFixed(2)}MB - 프로세스 재시작 권고`);
      }

    }, 30000); // 30초마다
  }

  /**
   * 통계 초기화
   */
  private initializeStats(sessionId: string): void {
    this.blockStats.set(sessionId, {
      totalRequests: 0,
      blockedRequests: 0,
      allowedRequests: 0,
      blockedByType: {},
      blockedByDomain: {},
      savedBandwidth: 0
    });
  }

  /**
   * 세션 ID 생성
   */
  private generateSessionId(): string {
    return `perf-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 성능 통계 조회
   */
  public getPerformanceStats(sessionId: string): {
    blockStats: ResourceBlockStats | undefined;
    performanceMetrics: PerformanceMetrics | undefined;
  } {
    return {
      blockStats: this.blockStats.get(sessionId),
      performanceMetrics: this.performanceMetrics.get(sessionId)
    };
  }

  /**
   * 전체 성능 요약
   */
  public getPerformanceSummary(): {
    totalSessions: number;
    averagePageLoadTime: number;
    totalBlockedRequests: number;
    totalSavedBandwidth: number;
    averageMemorySaved: number;
    blockingEfficiency: number;
  } {
    const allBlockStats = Array.from(this.blockStats.values());
    const allPerformanceMetrics = Array.from(this.performanceMetrics.values());

    const totalSessions = allBlockStats.length;
    const averagePageLoadTime = allPerformanceMetrics.length > 0
      ? allPerformanceMetrics.reduce((sum, m) => sum + m.pageLoadTime, 0) / allPerformanceMetrics.length
      : 0;

    const totalBlockedRequests = allBlockStats.reduce((sum, s) => sum + s.blockedRequests, 0);
    const totalRequests = allBlockStats.reduce((sum, s) => sum + s.totalRequests, 0);
    const totalSavedBandwidth = allBlockStats.reduce((sum, s) => sum + s.savedBandwidth, 0);
    const averageMemorySaved = allPerformanceMetrics.length > 0
      ? allPerformanceMetrics.reduce((sum, m) => sum + m.memorySaved, 0) / allPerformanceMetrics.length
      : 0;

    const blockingEfficiency = totalRequests > 0 ? (totalBlockedRequests / totalRequests) * 100 : 0;

    return {
      totalSessions,
      averagePageLoadTime,
      totalBlockedRequests,
      totalSavedBandwidth,
      averageMemorySaved,
      blockingEfficiency
    };
  }

  /**
   * 설정 업데이트
   */
  public updateConfig(updates: Partial<PerformanceConfig>): void {
    this.config = { ...this.config, ...updates };
    console.log('⚙️ 성능 최적화 설정 업데이트됨');
  }

  /**
   * 정리
   */
  public cleanup(): void {
    if (this.memoryMonitorTimer) {
      clearInterval(this.memoryMonitorTimer);
    }

    // 통계 데이터 정리
    this.blockStats.clear();
    this.performanceMetrics.clear();

    console.log('🧹 성능 최적화 시스템 정리 완료');
  }
}

/**
 * 기본 성능 최적화 설정 프리셋
 */
export const PerformancePresets = {
  /**
   * 최대 성능 (리소스를 최대한 차단)
   */
  maxPerformance: (): PerformanceConfig => ({
    blockResources: {
      images: true,
      stylesheets: true,
      fonts: true,
      media: true,
      websockets: true
    },
    network: {
      timeout: 15000,
      maxRetries: 1,
      userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
      headers: {
        'Accept': 'text/html,application/xhtml+xml',
        'Connection': 'close'
      },
      blockDomains: [
        'googletag', 'googleads', 'google-analytics', 'googletagmanager',
        'facebook.com', 'twitter.com', 'instagram.com',
        'doubleclick.net', 'adsystem.com', 'outbrain.com', 'taboola.com'
      ]
    },
    browser: {
      disableJavaScript: true,
      disableImages: true,
      viewport: { width: 800, height: 600 },
      deviceScaleFactor: 1
    },
    memory: {
      maxPagesPerContext: 3,
      pageCleanupInterval: 30000,
      memoryThreshold: 256,
      forceCleanupThreshold: 512
    },
    cache: {
      enableHttpCache: false,
      maxCacheSize: 50,
      cacheHeaders: false
    }
  }),

  /**
   * 균형 설정 (기본값)
   */
  balanced: (): PerformanceConfig => ({
    blockResources: {
      images: true,
      stylesheets: false,
      fonts: true,
      media: true,
      websockets: false
    },
    network: {
      timeout: 30000,
      maxRetries: 3,
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8'
      },
      blockDomains: [
        'googletag', 'googleads', 'google-analytics',
        'facebook.com/tr', 'doubleclick.net', 'adsystem.com'
      ]
    },
    browser: {
      disableJavaScript: false,
      disableImages: true,
      viewport: { width: 1200, height: 800 },
      deviceScaleFactor: 1
    },
    memory: {
      maxPagesPerContext: 5,
      pageCleanupInterval: 60000,
      memoryThreshold: 512,
      forceCleanupThreshold: 1024
    },
    cache: {
      enableHttpCache: true,
      maxCacheSize: 100,
      cacheHeaders: true
    }
  }),

  /**
   * 호환성 우선 (최소 차단)
   */
  compatible: (): PerformanceConfig => ({
    blockResources: {
      images: false,
      stylesheets: false,
      fonts: false,
      media: false,
      websockets: false
    },
    network: {
      timeout: 60000,
      maxRetries: 5,
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br'
      },
      blockDomains: []
    },
    browser: {
      disableJavaScript: false,
      disableImages: false,
      viewport: { width: 1920, height: 1080 },
      deviceScaleFactor: 1
    },
    memory: {
      maxPagesPerContext: 10,
      pageCleanupInterval: 120000,
      memoryThreshold: 1024,
      forceCleanupThreshold: 2048
    },
    cache: {
      enableHttpCache: true,
      maxCacheSize: 200,
      cacheHeaders: true
    }
  })
};
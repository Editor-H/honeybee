import { chromium, Browser, BrowserContext, Page } from 'playwright';

/**
 * 브라우저 풀 설정 인터페이스
 */
interface BrowserPoolConfig {
  maxBrowsers: number;
  maxContextsPerBrowser: number;
  maxPagesPerContext: number;
  browserOptions: {
    headless: boolean;
    args: string[];
  };
  contextOptions: {
    viewport: { width: number; height: number };
    userAgent: string;
    locale: string;
  };
  healthCheck: {
    interval: number; // ms
    timeout: number; // ms
  };
}

/**
 * 브라우저 인스턴스 정보
 */
interface BrowserInstance {
  id: string;
  browser: Browser;
  contexts: Map<string, BrowserContext>;
  pages: Map<string, Page>;
  isHealthy: boolean;
  lastUsed: number;
  createdAt: number;
}

/**
 * 효율적인 브라우저 풀 관리 시스템
 * - 브라우저 인스턴스 재사용으로 리소스 절약
 * - 컨텍스트 격리로 안전성 보장
 * - 자동 헬스체크 및 복구
 */
export class BrowserPool {
  private static instance: BrowserPool;
  private browsers: Map<string, BrowserInstance> = new Map();
  private config: BrowserPoolConfig;
  private healthCheckTimer: NodeJS.Timeout | null = null;
  private isShuttingDown = false;

  private constructor(config?: Partial<BrowserPoolConfig>) {
    this.config = {
      maxBrowsers: 3,
      maxContextsPerBrowser: 5,
      maxPagesPerContext: 3,
      browserOptions: {
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      },
      contextOptions: {
        viewport: { width: 1200, height: 800 },
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        locale: 'ko-KR'
      },
      healthCheck: {
        interval: 30000, // 30초
        timeout: 5000   // 5초
      },
      ...config
    };

    this.startHealthCheck();
  }

  /**
   * 브라우저 풀 싱글톤 인스턴스 획득
   */
  public static getInstance(config?: Partial<BrowserPoolConfig>): BrowserPool {
    if (!BrowserPool.instance) {
      BrowserPool.instance = new BrowserPool(config);
    }
    return BrowserPool.instance;
  }

  /**
   * 새 브라우저 페이지 획득
   */
  public async acquirePage(sessionId?: string): Promise<{ page: Page; cleanup: () => Promise<void> }> {
    if (this.isShuttingDown) {
      throw new Error('Browser pool is shutting down');
    }

    const browserId = await this.getOrCreateBrowser();
    const contextId = await this.getOrCreateContext(browserId, sessionId);
    const page = await this.getOrCreatePage(browserId, contextId);

    // 페이지 설정
    await this.configurePage(page);

    const cleanup = async () => {
      await this.releasePage(browserId, contextId, page);
    };

    return { page, cleanup };
  }

  /**
   * 브라우저 인스턴스 생성 또는 기존 인스턴스 반환
   */
  private async getOrCreateBrowser(): Promise<string> {
    // 건강한 브라우저 찾기
    for (const [id, instance] of this.browsers) {
      if (instance.isHealthy && instance.contexts.size < this.config.maxContextsPerBrowser) {
        instance.lastUsed = Date.now();
        return id;
      }
    }

    // 새 브라우저 생성 필요한지 확인
    if (this.browsers.size >= this.config.maxBrowsers) {
      // 가장 오래된 브라우저 정리
      const oldestBrowser = this.getOldestBrowser();
      if (oldestBrowser) {
        await this.closeBrowser(oldestBrowser);
      }
    }

    // 새 브라우저 생성
    const browserId = `browser-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const browser = await chromium.launch(this.config.browserOptions);

    const instance: BrowserInstance = {
      id: browserId,
      browser,
      contexts: new Map(),
      pages: new Map(),
      isHealthy: true,
      lastUsed: Date.now(),
      createdAt: Date.now()
    };

    this.browsers.set(browserId, instance);
    console.log(`🚀 새 브라우저 생성: ${browserId} (총 ${this.browsers.size}개)`);

    return browserId;
  }

  /**
   * 브라우저 컨텍스트 생성 또는 기존 컨텍스트 반환
   */
  private async getOrCreateContext(browserId: string, sessionId?: string): Promise<string> {
    const instance = this.browsers.get(browserId);
    if (!instance) {
      throw new Error(`Browser instance not found: ${browserId}`);
    }

    const contextId = sessionId || `context-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    if (instance.contexts.has(contextId)) {
      return contextId;
    }

    // 새 컨텍스트 생성
    const context = await instance.browser.newContext({
      ...this.config.contextOptions,
      // 각 컨텍스트마다 고유한 세션 격리
      storageState: undefined
    });

    // 요청 인터셉션 설정 (성능 최적화)
    await context.route('**/*', (route) => {
      const resourceType = route.request().resourceType();
      
      // 불필요한 리소스 차단
      if (['image', 'stylesheet', 'font', 'media'].includes(resourceType)) {
        route.abort();
      } else {
        route.continue();
      }
    });

    instance.contexts.set(contextId, context);
    console.log(`📝 새 컨텍스트 생성: ${contextId} (브라우저: ${browserId})`);

    return contextId;
  }

  /**
   * 페이지 생성 또는 기존 페이지 반환
   */
  private async getOrCreatePage(browserId: string, contextId: string): Promise<Page> {
    const instance = this.browsers.get(browserId);
    if (!instance) {
      throw new Error(`Browser instance not found: ${browserId}`);
    }

    const context = instance.contexts.get(contextId);
    if (!context) {
      throw new Error(`Context not found: ${contextId}`);
    }

    const pageId = `${contextId}-page-${Date.now()}`;
    
    // 새 페이지 생성
    const page = await context.newPage();
    instance.pages.set(pageId, page);

    console.log(`📄 새 페이지 생성: ${pageId}`);
    return page;
  }

  /**
   * 페이지 기본 설정
   */
  private async configurePage(page: Page): Promise<void> {
    // 타임아웃 설정
    page.setDefaultTimeout(30000);
    page.setDefaultNavigationTimeout(30000);

    // 추가 헤더 설정
    await page.setExtraHTTPHeaders({
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
      'Accept-Encoding': 'gzip, deflate, br',
      'DNT': '1',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
    });

    // JavaScript 실행 환경 개선
    await page.addInitScript(() => {
      // 웹드라이버 탐지 방지
      Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
      
      // Chrome 객체 추가
      (window as any).chrome = {
        runtime: {},
        loadTimes: function() {},
        csi: function() {},
        app: {}
      };

      // Permissions API 모킹
      const originalQuery = window.navigator.permissions.query;
      window.navigator.permissions.query = (parameters: PermissionDescriptor) => (
        parameters.name === 'notifications' ?
          Promise.resolve({ 
            state: Notification.permission, 
            name: parameters.name,
            onchange: null,
            addEventListener: () => {},
            removeEventListener: () => {},
            dispatchEvent: () => false
          } as PermissionStatus) :
          originalQuery(parameters)
      );

      // Plugin 배열 확장
      Object.defineProperty(navigator, 'plugins', {
        get: () => [1, 2, 3, 4, 5]
      });
    });
  }

  /**
   * 페이지 해제
   */
  private async releasePage(browserId: string, contextId: string, page: Page): Promise<void> {
    try {
      await page.close();
      
      const instance = this.browsers.get(browserId);
      if (instance) {
        // 페이지 맵에서 제거
        for (const [pageId, p] of instance.pages) {
          if (p === page) {
            instance.pages.delete(pageId);
            break;
          }
        }
      }
    } catch (error) {
      console.error('페이지 해제 중 오류:', error);
    }
  }

  /**
   * 헬스체크 시작
   */
  private startHealthCheck(): void {
    this.healthCheckTimer = setInterval(async () => {
      await this.performHealthCheck();
    }, this.config.healthCheck.interval);
  }

  /**
   * 브라우저 인스턴스 헬스체크 수행
   */
  private async performHealthCheck(): Promise<void> {
    const promises = Array.from(this.browsers.entries()).map(async ([id, instance]) => {
      try {
        // 간단한 페이지 로드 테스트
        const context = await instance.browser.newContext();
        const page = await context.newPage();
        
        await Promise.race([
          page.goto('data:text/html,<html><body>Health Check</body></html>'),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Health check timeout')), this.config.healthCheck.timeout)
          )
        ]);

        await context.close();
        instance.isHealthy = true;
        
      } catch (error) {
        console.error(`브라우저 ${id} 헬스체크 실패:`, error);
        instance.isHealthy = false;
        
        // 비정상 브라우저 재시작
        await this.restartBrowser(id);
      }
    });

    await Promise.allSettled(promises);
  }

  /**
   * 브라우저 재시작
   */
  private async restartBrowser(browserId: string): Promise<void> {
    const instance = this.browsers.get(browserId);
    if (!instance) return;

    try {
      console.log(`🔄 브라우저 재시작 중: ${browserId}`);
      
      // 기존 브라우저 정리
      await this.closeBrowser(browserId);
      
      // 새 브라우저로 교체
      await this.getOrCreateBrowser();
      
    } catch (error) {
      console.error(`브라우저 재시작 실패: ${browserId}`, error);
    }
  }

  /**
   * 가장 오래된 브라우저 찾기
   */
  private getOldestBrowser(): string | null {
    let oldest: { id: string; lastUsed: number } | null = null;
    
    for (const [id, instance] of this.browsers) {
      if (!oldest || instance.lastUsed < oldest.lastUsed) {
        oldest = { id, lastUsed: instance.lastUsed };
      }
    }
    
    return oldest?.id || null;
  }

  /**
   * 브라우저 인스턴스 정리
   */
  private async closeBrowser(browserId: string): Promise<void> {
    const instance = this.browsers.get(browserId);
    if (!instance) return;

    try {
      // 모든 컨텍스트 정리
      for (const context of instance.contexts.values()) {
        await context.close();
      }
      
      // 브라우저 정리
      await instance.browser.close();
      this.browsers.delete(browserId);
      
      console.log(`🗑️ 브라우저 정리 완료: ${browserId}`);
    } catch (error) {
      console.error(`브라우저 정리 실패: ${browserId}`, error);
    }
  }

  /**
   * 브라우저 풀 상태 정보
   */
  public getStatus(): {
    totalBrowsers: number;
    healthyBrowsers: number;
    totalContexts: number;
    totalPages: number;
    memoryUsage: NodeJS.MemoryUsage;
  } {
    let totalContexts = 0;
    let totalPages = 0;
    let healthyBrowsers = 0;

    for (const instance of this.browsers.values()) {
      if (instance.isHealthy) healthyBrowsers++;
      totalContexts += instance.contexts.size;
      totalPages += instance.pages.size;
    }

    return {
      totalBrowsers: this.browsers.size,
      healthyBrowsers,
      totalContexts,
      totalPages,
      memoryUsage: process.memoryUsage()
    };
  }

  /**
   * 브라우저 풀 종료
   */
  public async shutdown(): Promise<void> {
    this.isShuttingDown = true;
    
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
    }

    // 모든 브라우저 정리
    const closePromises = Array.from(this.browsers.keys()).map(id => this.closeBrowser(id));
    await Promise.allSettled(closePromises);

    console.log('🔽 브라우저 풀 종료 완료');
  }
}

// 프로세스 종료 시 자동 정리
process.on('exit', () => {
  const pool = BrowserPool.getInstance();
  pool.shutdown().catch(console.error);
});

process.on('SIGINT', async () => {
  const pool = BrowserPool.getInstance();
  await pool.shutdown();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  const pool = BrowserPool.getInstance();
  await pool.shutdown();
  process.exit(0);
});
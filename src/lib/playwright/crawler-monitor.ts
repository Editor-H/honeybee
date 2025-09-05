/**
 * 크롤링 세션 인터페이스
 */
export interface CrawlSession {
  id: string;
  startTime: number;
  endTime?: number;
  crawlerName?: string;
  url?: string;
  status: 'running' | 'completed' | 'failed';
}

/**
 * 크롤링 단계 인터페이스
 */
export interface CrawlStep {
  timestamp: number;
  step: string;
  duration?: number;
  metadata?: Record<string, any>;
}

/**
 * 크롤링 메트릭 인터페이스
 */
export interface CrawlMetrics {
  duration: number;
  itemsFound: number;
  itemsExtracted: number;
  errors: number;
  steps?: CrawlStep[];
  averageItemExtractionTime?: number;
  successRate?: number;
}

/**
 * 에러 정보 인터페이스
 */
export interface CrawlError {
  timestamp: number;
  sessionId: string;
  error: string;
  step?: string;
  metadata?: Record<string, any>;
}

/**
 * 성능 통계 인터페이스
 */
export interface PerformanceStats {
  totalSessions: number;
  activeSessions: number;
  completedSessions: number;
  failedSessions: number;
  averageDuration: number;
  averageItemsPerSession: number;
  errorRate: number;
  topErrors: Array<{ error: string; count: number }>;
}

/**
 * 크롤러 모니터링 시스템
 * - 실시간 세션 추적
 * - 성능 메트릭 수집
 * - 에러 패턴 분석
 * - 디버깅 지원
 */
export class CrawlerMonitor {
  private static instance: CrawlerMonitor;
  private sessions: Map<string, CrawlSession> = new Map();
  private steps: Map<string, CrawlStep[]> = new Map();
  private metrics: Map<string, Record<string, number>> = new Map();
  private errors: CrawlError[] = [];
  private maxHistorySize = 1000;
  private cleanupInterval = 5 * 60 * 1000; // 5분
  private cleanupTimer: NodeJS.Timeout | null = null;

  private constructor() {
    this.startCleanupTimer();
  }

  /**
   * 싱글톤 인스턴스 획득
   */
  public static getInstance(): CrawlerMonitor {
    if (!CrawlerMonitor.instance) {
      CrawlerMonitor.instance = new CrawlerMonitor();
    }
    return CrawlerMonitor.instance;
  }

  /**
   * 새 크롤링 세션 시작
   */
  public startSession(crawlerName: string, url?: string): CrawlSession {
    const session: CrawlSession = {
      id: this.generateSessionId(),
      startTime: Date.now(),
      crawlerName,
      url,
      status: 'running'
    };

    this.sessions.set(session.id, session);
    this.steps.set(session.id, []);
    this.metrics.set(session.id, {});

    console.log(`📊 크롤링 세션 시작: ${session.id} (${crawlerName})`);
    return session;
  }

  /**
   * 세션 종료 및 메트릭 계산
   */
  public endSession(sessionId: string, status: 'completed' | 'failed' = 'completed'): CrawlMetrics {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    const endTime = Date.now();
    session.endTime = endTime;
    session.status = status;

    const steps = this.steps.get(sessionId) || [];
    const sessionMetrics = this.metrics.get(sessionId) || {};

    // 메트릭 계산
    const duration = endTime - session.startTime;
    const itemsFound = sessionMetrics.itemsFound || 0;
    const itemsExtracted = sessionMetrics.itemsExtracted || 0;
    const errors = sessionMetrics.errors || 0;

    // 단계별 시간 계산
    const stepsWithDuration = this.calculateStepDurations(steps);
    
    const metrics: CrawlMetrics = {
      duration,
      itemsFound,
      itemsExtracted,
      errors,
      steps: stepsWithDuration,
      averageItemExtractionTime: itemsExtracted > 0 ? duration / itemsExtracted : 0,
      successRate: itemsFound > 0 ? (itemsExtracted / itemsFound) * 100 : 0
    };

    console.log(`📈 크롤링 세션 완료: ${sessionId} (${duration}ms, ${itemsExtracted}개 추출)`);
    return metrics;
  }

  /**
   * 크롤링 단계 기록
   */
  public recordStep(sessionId: string, step: string, metadata?: Record<string, any>): void {
    const steps = this.steps.get(sessionId);
    if (!steps) {
      console.warn(`Session not found for step recording: ${sessionId}`);
      return;
    }

    const stepInfo: CrawlStep = {
      timestamp: Date.now(),
      step,
      metadata
    };

    steps.push(stepInfo);
    
    // 디버그 로깅
    console.debug(`📝 [${sessionId}] ${step}`, metadata || '');
  }

  /**
   * 메트릭 기록
   */
  public recordMetric(sessionId: string, metric: string, value: number): void {
    const sessionMetrics = this.metrics.get(sessionId);
    if (!sessionMetrics) {
      console.warn(`Session not found for metric recording: ${sessionId}`);
      return;
    }

    sessionMetrics[metric] = value;
    
    console.debug(`📊 [${sessionId}] ${metric}: ${value}`);
  }

  /**
   * 에러 기록
   */
  public recordError(sessionId: string, error: string, step?: string, metadata?: Record<string, any>): void {
    const errorInfo: CrawlError = {
      timestamp: Date.now(),
      sessionId,
      error,
      step,
      metadata
    };

    this.errors.push(errorInfo);
    
    // 세션 에러 카운트 증가
    const sessionMetrics = this.metrics.get(sessionId);
    if (sessionMetrics) {
      sessionMetrics.errors = (sessionMetrics.errors || 0) + 1;
    }

    // 에러 히스토리 크기 제한
    if (this.errors.length > this.maxHistorySize) {
      this.errors = this.errors.slice(-Math.floor(this.maxHistorySize * 0.8));
    }

    console.error(`❌ [${sessionId}] ${step || 'Unknown step'}: ${error}`);
  }

  /**
   * 활성 세션 목록
   */
  public getActiveSessions(): CrawlSession[] {
    return Array.from(this.sessions.values())
      .filter(session => session.status === 'running')
      .sort((a, b) => b.startTime - a.startTime);
  }

  /**
   * 세션 상세 정보
   */
  public getSessionDetails(sessionId: string): {
    session: CrawlSession;
    steps: CrawlStep[];
    metrics: Record<string, number>;
    errors: CrawlError[];
  } | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    return {
      session,
      steps: this.steps.get(sessionId) || [],
      metrics: this.metrics.get(sessionId) || {},
      errors: this.errors.filter(e => e.sessionId === sessionId)
    };
  }

  /**
   * 전체 성능 통계
   */
  public getStatistics(): PerformanceStats {
    const sessions = Array.from(this.sessions.values());
    const totalSessions = sessions.length;
    const activeSessions = sessions.filter(s => s.status === 'running').length;
    const completedSessions = sessions.filter(s => s.status === 'completed').length;
    const failedSessions = sessions.filter(s => s.status === 'failed').length;

    // 완료된 세션들의 평균 수행 시간
    const completedSessionsWithDuration = sessions.filter(s => s.status === 'completed' && s.endTime);
    const averageDuration = completedSessionsWithDuration.length > 0
      ? completedSessionsWithDuration.reduce((sum, s) => sum + (s.endTime! - s.startTime), 0) / completedSessionsWithDuration.length
      : 0;

    // 평균 아이템 수집 개수
    const sessionMetrics = Array.from(this.metrics.values());
    const averageItemsPerSession = sessionMetrics.length > 0
      ? sessionMetrics.reduce((sum, m) => sum + (m.itemsExtracted || 0), 0) / sessionMetrics.length
      : 0;

    // 에러율
    const totalErrors = this.errors.length;
    const errorRate = totalSessions > 0 ? (totalErrors / totalSessions) * 100 : 0;

    // 상위 에러들
    const errorCounts = new Map<string, number>();
    this.errors.forEach(error => {
      const count = errorCounts.get(error.error) || 0;
      errorCounts.set(error.error, count + 1);
    });

    const topErrors = Array.from(errorCounts.entries())
      .map(([error, count]) => ({ error, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalSessions,
      activeSessions,
      completedSessions,
      failedSessions,
      averageDuration,
      averageItemsPerSession,
      errorRate,
      topErrors
    };
  }

  /**
   * 크롤러별 통계
   */
  public getCrawlerStatistics(): Record<string, PerformanceStats> {
    const crawlerSessions = new Map<string, CrawlSession[]>();
    
    // 크롤러별로 세션 그룹화
    for (const session of this.sessions.values()) {
      if (!session.crawlerName) continue;
      
      if (!crawlerSessions.has(session.crawlerName)) {
        crawlerSessions.set(session.crawlerName, []);
      }
      crawlerSessions.get(session.crawlerName)!.push(session);
    }

    const result: Record<string, PerformanceStats> = {};

    for (const [crawlerName, sessions] of crawlerSessions) {
      const totalSessions = sessions.length;
      const activeSessions = sessions.filter(s => s.status === 'running').length;
      const completedSessions = sessions.filter(s => s.status === 'completed').length;
      const failedSessions = sessions.filter(s => s.status === 'failed').length;

      const completedSessionsWithDuration = sessions.filter(s => s.status === 'completed' && s.endTime);
      const averageDuration = completedSessionsWithDuration.length > 0
        ? completedSessionsWithDuration.reduce((sum, s) => sum + (s.endTime! - s.startTime), 0) / completedSessionsWithDuration.length
        : 0;

      const sessionIds = new Set(sessions.map(s => s.id));
      const crawlerMetrics = Array.from(this.metrics.entries())
        .filter(([sessionId]) => sessionIds.has(sessionId))
        .map(([, metrics]) => metrics);

      const averageItemsPerSession = crawlerMetrics.length > 0
        ? crawlerMetrics.reduce((sum, m) => sum + (m.itemsExtracted || 0), 0) / crawlerMetrics.length
        : 0;

      const crawlerErrors = this.errors.filter(e => sessionIds.has(e.sessionId));
      const errorRate = totalSessions > 0 ? (crawlerErrors.length / totalSessions) * 100 : 0;

      const errorCounts = new Map<string, number>();
      crawlerErrors.forEach(error => {
        const count = errorCounts.get(error.error) || 0;
        errorCounts.set(error.error, count + 1);
      });

      const topErrors = Array.from(errorCounts.entries())
        .map(([error, count]) => ({ error, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      result[crawlerName] = {
        totalSessions,
        activeSessions,
        completedSessions,
        failedSessions,
        averageDuration,
        averageItemsPerSession,
        errorRate,
        topErrors
      };
    }

    return result;
  }

  /**
   * 최근 에러 조회
   */
  public getRecentErrors(limit = 50): CrawlError[] {
    return this.errors
      .slice(-limit)
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * 성능 트렌드 분석 (시간대별)
   */
  public getPerformanceTrends(hours = 24): {
    hourly: Array<{
      hour: number;
      sessions: number;
      avgDuration: number;
      avgItems: number;
      errorRate: number;
    }>;
  } {
    const now = Date.now();
    const hoursInMs = hours * 60 * 60 * 1000;
    const cutoffTime = now - hoursInMs;

    // 최근 N시간 내 완료된 세션들
    const recentSessions = Array.from(this.sessions.values())
      .filter(s => s.endTime && s.endTime >= cutoffTime && s.status === 'completed');

    const hourlyData = new Map<number, {
      sessions: CrawlSession[];
      errors: number;
    }>();

    // 시간대별로 세션 그룹화
    recentSessions.forEach(session => {
      const hour = Math.floor((session.endTime! - cutoffTime) / (60 * 60 * 1000));
      
      if (!hourlyData.has(hour)) {
        hourlyData.set(hour, { sessions: [], errors: 0 });
      }
      
      hourlyData.get(hour)!.sessions.push(session);
    });

    // 에러도 시간대별로 그룹화
    this.errors.filter(e => e.timestamp >= cutoffTime).forEach(error => {
      const hour = Math.floor((error.timestamp - cutoffTime) / (60 * 60 * 1000));
      const data = hourlyData.get(hour);
      if (data) {
        data.errors++;
      }
    });

    const hourly = Array.from({ length: hours }, (_, i) => {
      const data = hourlyData.get(i);
      if (!data || data.sessions.length === 0) {
        return {
          hour: i,
          sessions: 0,
          avgDuration: 0,
          avgItems: 0,
          errorRate: 0
        };
      }

      const avgDuration = data.sessions.reduce((sum, s) => sum + (s.endTime! - s.startTime), 0) / data.sessions.length;
      
      const sessionMetrics = data.sessions
        .map(s => this.metrics.get(s.id))
        .filter(m => m !== undefined) as Record<string, number>[];
      
      const avgItems = sessionMetrics.length > 0
        ? sessionMetrics.reduce((sum, m) => sum + (m.itemsExtracted || 0), 0) / sessionMetrics.length
        : 0;

      const errorRate = data.sessions.length > 0 ? (data.errors / data.sessions.length) * 100 : 0;

      return {
        hour: i,
        sessions: data.sessions.length,
        avgDuration,
        avgItems,
        errorRate
      };
    });

    return { hourly };
  }

  /**
   * 세션 ID 생성
   */
  private generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 단계별 수행 시간 계산
   */
  private calculateStepDurations(steps: CrawlStep[]): CrawlStep[] {
    const stepsWithDuration = [...steps];
    
    for (let i = 0; i < stepsWithDuration.length; i++) {
      if (i === stepsWithDuration.length - 1) {
        // 마지막 단계는 현재 시간까지
        stepsWithDuration[i].duration = Date.now() - stepsWithDuration[i].timestamp;
      } else {
        // 다음 단계까지의 시간
        stepsWithDuration[i].duration = stepsWithDuration[i + 1].timestamp - stepsWithDuration[i].timestamp;
      }
    }
    
    return stepsWithDuration;
  }

  /**
   * 정리 타이머 시작
   */
  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.cleanupInterval);
  }

  /**
   * 오래된 데이터 정리
   */
  private cleanup(): void {
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24시간
    
    // 오래된 세션 정리
    for (const [sessionId, session] of this.sessions) {
      if (session.status !== 'running' && (now - session.startTime) > maxAge) {
        this.sessions.delete(sessionId);
        this.steps.delete(sessionId);
        this.metrics.delete(sessionId);
      }
    }

    // 오래된 에러 정리
    this.errors = this.errors.filter(error => (now - error.timestamp) <= maxAge);
    
    // 메모리 사용량 체크
    const memoryUsage = process.memoryUsage();
    const heapUsedMB = memoryUsage.heapUsed / 1024 / 1024;
    
    if (heapUsedMB > 500) { // 500MB 이상 사용 시 추가 정리
      console.warn(`높은 메모리 사용량 감지 (${heapUsedMB.toFixed(2)}MB), 추가 정리 수행`);
      this.aggressiveCleanup();
    }
    
    console.debug(`🧹 모니터링 데이터 정리 완료 (세션: ${this.sessions.size}, 에러: ${this.errors.length})`);
  }

  /**
   * 적극적인 정리 (메모리 부족 시)
   */
  private aggressiveCleanup(): void {
    const now = Date.now();
    const shortMaxAge = 6 * 60 * 60 * 1000; // 6시간
    
    // 더 짧은 기간으로 정리
    for (const [sessionId, session] of this.sessions) {
      if (session.status !== 'running' && (now - session.startTime) > shortMaxAge) {
        this.sessions.delete(sessionId);
        this.steps.delete(sessionId);
        this.metrics.delete(sessionId);
      }
    }

    // 에러 로그 크기 강제 축소
    this.errors = this.errors.slice(-Math.floor(this.maxHistorySize * 0.5));
  }

  /**
   * 모니터 종료
   */
  public shutdown(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    
    console.log('🔽 크롤러 모니터 종료');
  }
}

// 프로세스 종료 시 정리
process.on('exit', () => {
  const monitor = CrawlerMonitor.getInstance();
  monitor.shutdown();
});

process.on('SIGINT', () => {
  const monitor = CrawlerMonitor.getInstance();
  monitor.shutdown();
});

process.on('SIGTERM', () => {
  const monitor = CrawlerMonitor.getInstance();
  monitor.shutdown();
});
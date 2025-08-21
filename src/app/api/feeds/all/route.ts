import { NextResponse } from 'next/server';
import { Article } from '@/types/article';

export async function GET() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    
    // 모든 피드를 병렬로 가져오기
    const [
      tossResponse, 
      daangnResponse, 
      naverResponse, 
      brunchResponse, 
      mediumResponse, 
      yozmResponse
    ] = await Promise.allSettled([
      fetch(`${baseUrl}/api/feeds/toss`),
      fetch(`${baseUrl}/api/feeds/daangn`),
      fetch(`${baseUrl}/api/feeds/naver-d2`),
      fetch(`${baseUrl}/api/feeds/brunch`),
      fetch(`${baseUrl}/api/feeds/medium`),
      fetch(`${baseUrl}/api/feeds/yozm`)
    ]);

    const allArticles: Article[] = [];
    const errors: string[] = [];

    // 토스 데이터 처리
    if (tossResponse.status === 'fulfilled' && tossResponse.value.ok) {
      const tossData = await tossResponse.value.json();
      if (tossData.success) {
        allArticles.push(...tossData.articles);
      }
    } else {
      errors.push('토스 RSS 수집 실패');
    }

    // 당근마켓 데이터 처리
    if (daangnResponse.status === 'fulfilled' && daangnResponse.value.ok) {
      const daangnData = await daangnResponse.value.json();
      if (daangnData.success) {
        allArticles.push(...daangnData.articles);
      }
    } else {
      errors.push('당근마켓 RSS 수집 실패');
    }

    // 네이버 D2 데이터 처리
    if (naverResponse.status === 'fulfilled' && naverResponse.value.ok) {
      const naverData = await naverResponse.value.json();
      if (naverData.success) {
        allArticles.push(...naverData.articles);
      }
    } else {
      errors.push('네이버 D2 RSS 수집 실패');
    }

    // 브런치 데이터 처리
    if (brunchResponse.status === 'fulfilled' && brunchResponse.value.ok) {
      const brunchData = await brunchResponse.value.json();
      if (brunchData.success) {
        allArticles.push(...brunchData.articles);
      }
    } else {
      errors.push('브런치 RSS 수집 실패');
    }

    // 미디엄 데이터 처리
    if (mediumResponse.status === 'fulfilled' && mediumResponse.value.ok) {
      const mediumData = await mediumResponse.value.json();
      if (mediumData.success) {
        allArticles.push(...mediumData.articles);
      }
    } else {
      errors.push('미디엄 RSS 수집 실패');
    }

    // 요즘IT 데이터 처리
    if (yozmResponse.status === 'fulfilled' && yozmResponse.value.ok) {
      const yozmData = await yozmResponse.value.json();
      if (yozmData.success) {
        allArticles.push(...yozmData.articles);
      }
    } else {
      errors.push('요즘IT RSS 수집 실패');
    }

    // 최신순으로 정렬
    allArticles.sort((a, b) => 
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );

    return NextResponse.json({
      success: true,
      totalArticles: allArticles.length,
      articles: allArticles,
      errors: errors.length > 0 ? errors : undefined,
      lastUpdated: new Date().toISOString(),
      platforms: ['toss', 'daangn', 'naver-d2', 'brunch', 'medium', 'yozm']
    });

  } catch (error) {
    console.error('전체 RSS 수집 에러:', error);
    return NextResponse.json({
      success: false,
      error: '전체 RSS 수집 실패',
      lastUpdated: new Date().toISOString()
    }, { status: 500 });
  }
}
import { NextResponse } from 'next/server';

/**
 * 간단한 Playwright 테스트 API
 */
export async function GET() {
  try {
    console.log('🧪 간단한 Playwright 테스트 시작...');
    
    // Step 1: Import 테스트
    const { chromium } = await import('playwright');
    console.log('✅ Playwright import 성공');
    
    // Step 2: 브라우저 시작 테스트
    const browser = await chromium.launch({ headless: true });
    console.log('✅ 브라우저 시작 성공');
    
    // Step 3: 페이지 생성 테스트
    const page = await browser.newPage();
    console.log('✅ 페이지 생성 성공');
    
    // Step 4: 간단한 페이지 로드 테스트
    await page.goto('data:text/html,<html><body><h1>Test</h1></body></html>');
    const title = await page.textContent('h1');
    console.log('✅ 페이지 로드 및 텍스트 추출 성공:', title);
    
    // Step 5: 정리
    await browser.close();
    console.log('✅ 브라우저 정리 완료');
    
    return NextResponse.json({
      success: true,
      message: 'Playwright 기본 테스트 성공',
      extractedText: title,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Playwright 테스트 실패:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
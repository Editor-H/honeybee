/**
 * 언어 감지 유틸리티
 * 한글 아티클만 필터링하기 위한 도구
 */

export function isKoreanText(text: string): boolean {
  if (!text) return false;
  
  // 한글 유니코드 범위: ㄱ-ㅎ, ㅏ-ㅣ, 가-힣
  const koreanRegex = /[ㄱ-ㅎㅏ-ㅣ가-힣]/;
  
  // 텍스트에서 한글 문자 비율 계산
  const koreanChars = text.match(/[ㄱ-ㅎㅏ-ㅣ가-힣]/g) || [];
  const totalChars = text.replace(/\s/g, '').length; // 공백 제외
  
  if (totalChars === 0) return false;
  
  const koreanRatio = koreanChars.length / totalChars;
  
  // 한글 문자가 전체의 30% 이상이면 한글 텍스트로 판단
  return koreanRatio >= 0.3;
}

export function isKoreanArticle(title: string, description?: string): boolean {
  // 제목에서 한글 체크
  const titleIsKorean = isKoreanText(title);
  
  // 설명이 있으면 설명도 체크
  if (description) {
    const descriptionIsKorean = isKoreanText(description);
    // 제목 또는 설명 중 하나라도 한글이면 한글 아티클로 판단
    return titleIsKorean || descriptionIsKorean;
  }
  
  return titleIsKorean;
}

export function shouldIncludeArticle(
  title: string, 
  description: string | undefined, 
  platformId: string
): boolean {
  // 미디엄 관련 플랫폼들만 한글 필터링 적용
  const mediumPlatforms = [
    'medium',
    'medium_ux_collective', 
    'medium_ux_writer'
  ];
  
  if (mediumPlatforms.includes(platformId)) {
    return isKoreanArticle(title, description);
  }
  
  // 다른 플랫폼은 모든 아티클 허용
  return true;
}
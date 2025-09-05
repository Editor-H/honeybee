import { Article } from '@/types/article';

// 카테고리-태그 매핑 시스템
export const categoryTagMapping = {
  // 프론트엔드 하위 카테고리
  'react': ['React', 'react', 'jsx', 'hooks', '리액트', 'next.js', 'nextjs'],
  'vue': ['Vue', 'vue', 'vue.js', 'vuejs', '뷰', 'nuxt', 'nuxt.js'],
  'angular': ['Angular', 'angular', '앵귤러', 'ng', 'typescript'],
  'javascript': ['JavaScript', 'javascript', 'js', '자바스크립트', 'es6', 'es2020', 'node.js', 'nodejs'],

  // 백엔드 하위 카테고리
  'nodejs': ['Node.js', 'nodejs', 'node', '노드', 'express', 'fastify'],
  'python': ['Python', 'python', '파이썬', 'django', 'flask', 'fastapi'],
  'java': ['Java', 'java', '자바', 'spring', 'springboot', 'maven', 'gradle'],
  'golang': ['Go', 'golang', 'go', 'gin', 'echo'],

  // AI/ML 하위 카테고리
  'machine-learning': ['machine learning', 'ml', '머신러닝', '기계학습', 'scikit-learn', 'pandas'],
  'deep-learning': ['deep learning', 'dl', '딥러닝', 'neural network', '신경망'],
  'nlp': ['nlp', 'natural language processing', '자연어처리', 'bert', 'gpt', 'transformer'],
  'computer-vision': ['computer vision', '컴퓨터비전', '컴퓨터 비전', 'opencv', 'yolo'],

  // 클라우드 하위 카테고리
  'aws': ['AWS', 'aws', 'amazon', 'ec2', 's3', 'lambda', 'cloudfront'],
  'azure': ['Azure', 'azure', 'microsoft', 'azure functions'],
  'gcp': ['GCP', 'gcp', 'google cloud', 'firebase', 'bigquery'],
  'kubernetes': ['kubernetes', 'k8s', '쿠버네티스', 'docker', 'container'],

  // 모바일 하위 카테고리
  'ios': ['iOS', 'ios', 'swift', 'xcode', 'app store', 'objective-c'],
  'android': ['Android', 'android', 'kotlin', 'java', 'android studio'],
  'react-native': ['React Native', 'react-native', 'expo', 'metro'],
  'flutter': ['Flutter', 'flutter', 'dart', 'firebase'],

  // 데이터 하위 카테고리
  'analytics': ['analytics', '데이터분석', '분석', 'pandas', 'numpy', 'matplotlib'],
  'database': ['database', 'db', '데이터베이스', 'sql', 'mysql', 'postgresql', 'mongodb'],
  'bigdata': ['big data', 'bigdata', '빅데이터', 'hadoop', 'spark', 'kafka'],
  'visualization': ['visualization', '시각화', 'd3.js', 'tableau', 'plotly'],

  // UX/UI 하위 카테고리
  'ui-design': ['UI', 'ui', 'user interface', '사용자인터페이스', '유아이', 'interface'],
  'ux-research': ['UX', 'ux', 'user experience', '사용자경험', '유엑스', 'research', '리서치'],
  'prototyping': ['prototype', 'prototyping', '프로토타입', 'figma', 'sketch', 'adobe xd'],
  'design-system': ['design system', '디자인시스템', '디자인 시스템', 'component', 'token'],

  // 프로덕트 하위 카테고리
  'product-management': ['product manager', 'pm', '프로덕트매니저', '프로덕트 매니저', 'product management'],
  'product-strategy': ['product strategy', '프로덕트전략', '프로덕트 전략', 'roadmap', '로드맵'],
  'service-planning': ['service planning', '서비스기획', '서비스 기획', '기획', '기획자'],
  'growth-hacking': ['growth hacking', '그로스해킹', '그로스 해킹', 'growth', 'marketing'],

  // 게임 하위 카테고리
  'unity': ['Unity', 'unity', '유니티', 'c#'],
  'unreal': ['Unreal', 'unreal engine', '언리얼', 'ue4', 'ue5'],
  'game-dev': ['game development', '게임개발', '게임 개발', 'gamedev'],
  'game-design': ['game design', '게임디자인', '게임 디자인', 'level design'],

  // 그래픽 하위 카테고리
  'webgl': ['WebGL', 'webgl', 'opengl', '웹지엘'],
  'threejs': ['Three.js', 'threejs', 'three.js', '쓰리제이에스'],
  'computer-graphics': ['computer graphics', '컴퓨터그래픽스', '컴퓨터 그래픽스', 'cg'],
  'shader': ['shader', '셰이더', 'glsl', 'hlsl'],

};

// 메인 카테고리와 ArticleCategory 매핑
export const mainCategoryMapping: Record<string, string> = {
  'frontend': 'frontend',
  'backend': 'backend',
  'ai': 'ai-ml',
  'cloud': 'cloud-infra',
  'mobile': 'mobile',
  'data': 'data',
  'design': 'design',
  'product': 'product',
  'game': 'game',
  'graphics': 'graphics',
  'lecture': 'lecture'
};

// 하위 카테고리가 속한 메인 카테고리 찾기
export function getMainCategoryForSubcategory(subcategoryId: string): string | null {
  // 사이드바 구조를 기반으로 매핑
  const subcategoryToMainCategory: Record<string, string> = {
    // 프론트엔드
    'react': 'frontend',
    'vue': 'frontend', 
    'angular': 'frontend',
    'javascript': 'frontend',
    
    // 백엔드
    'nodejs': 'backend',
    'python': 'backend',
    'java': 'backend',
    'golang': 'backend',
    
    // AI/ML
    'machine-learning': 'ai',
    'deep-learning': 'ai',
    'nlp': 'ai',
    'computer-vision': 'ai',
    
    // 클라우드
    'aws': 'cloud',
    'azure': 'cloud',
    'gcp': 'cloud',
    'kubernetes': 'cloud',
    
    // 모바일
    'ios': 'mobile',
    'android': 'mobile',
    'react-native': 'mobile',
    'flutter': 'mobile',
    
    // 데이터
    'analytics': 'data',
    'database': 'data',
    'bigdata': 'data',
    'visualization': 'data',
    
    // UX/UI
    'ui-design': 'design',
    'ux-research': 'design',
    'prototyping': 'design',
    'design-system': 'design',
    
    // 프로덕트
    'product-management': 'product',
    'product-strategy': 'product',
    'service-planning': 'product',
    'growth-hacking': 'product',
    
    // 게임
    'unity': 'game',
    'unreal': 'game',
    'game-dev': 'game',
    'game-design': 'game',
    
    // 그래픽
    'webgl': 'graphics',
    'threejs': 'graphics',
    'computer-graphics': 'graphics',
    'shader': 'graphics',
    
  };
  
  return subcategoryToMainCategory[subcategoryId] || null;
}

// 아티클이 특정 하위 카테고리에 속하는지 확인
export function isArticleInSubcategory(article: Article, subcategoryId: string): boolean {
  const tags = categoryTagMapping[subcategoryId as keyof typeof categoryTagMapping];
  if (!tags) return false;
  
  const articleText = `${article.title} ${article.content} ${article.tags.join(' ')}`.toLowerCase();
  
  return tags.some(tag => articleText.includes(tag.toLowerCase()));
}

// 아티클이 여러 하위 카테고리에 속할 수 있는지 확인
export function getMatchingSubcategories(article: Article): string[] {
  const matchingSubcategories: string[] = [];
  
  for (const subcategoryId of Object.keys(categoryTagMapping)) {
    if (isArticleInSubcategory(article, subcategoryId)) {
      matchingSubcategories.push(subcategoryId);
    }
  }
  
  return matchingSubcategories;
}
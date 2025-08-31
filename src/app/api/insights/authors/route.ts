import { NextRequest, NextResponse } from 'next/server';

interface AuthorData {
  name: string;
  platform: string;
  articleCount: number;
  totalEngagement: number;
  averageEngagement: number;
  specialties: string[];
  recentActivity: number; // 최근 30일 활동 점수
  influenceScore: number; // 영향력 점수 (0-100)
  potentialScore: number; // 잠재 저자 점수 (0-100)
}

// 기술 분야 키워드 매핑
const techSpecialties = {
  'AI/ML': ['AI', 'ChatGPT', '머신러닝', '딥러닝', 'TensorFlow', 'PyTorch', 'LLM', 'OpenAI', 'BERT', 'GPT'],
  'Frontend': ['React', 'Vue', 'Angular', 'JavaScript', 'TypeScript', 'Next.js', 'HTML', 'CSS', 'Svelte'],
  'Backend': ['Node.js', 'Python', 'Java', 'Spring', 'API', 'Express', 'Django', 'Flask', 'Go', 'Rust'],
  'Mobile': ['iOS', 'Android', 'React Native', 'Flutter', 'Swift', 'Kotlin', 'Xamarin'],
  'Cloud/DevOps': ['AWS', 'Docker', 'Kubernetes', 'Azure', 'CI/CD', 'DevOps', 'GCP', 'Jenkins'],
  'Data': ['데이터', '분석', '빅데이터', 'ETL', 'Spark', 'Kafka', 'Elasticsearch', '시각화'],
  '아키텍처': ['마이크로서비스', 'MSA', '아키텍처', '설계', 'DDD', '클린코드', '패턴']
};

// 전문 분야 분석 함수
function analyzeSpecialties(text: string): string[] {
  const specialties: string[] = [];
  const normalizedText = text.toLowerCase();
  
  Object.entries(techSpecialties).forEach(([specialty, keywords]) => {
    const matchCount = keywords.filter(keyword => 
      normalizedText.includes(keyword.toLowerCase())
    ).length;
    
    if (matchCount >= 2) { // 2개 이상의 관련 키워드가 있으면 해당 분야 전문가로 분류
      specialties.push(specialty);
    }
  });
  
  return specialties.length > 0 ? specialties : ['개발 일반'];
}

// 영향력 점수 계산
function calculateInfluenceScore(articleCount: number, avgEngagement: number, platform: string): number {
  const baseScore = Math.min(50, articleCount * 2); // 기본 점수 (최대 50점)
  const engagementScore = Math.min(30, avgEngagement / 10); // 참여도 점수 (최대 30점)
  
  // 플랫폼별 가중치
  const platformWeights: { [key: string]: number } = {
    '토스 기술블로그': 20,
    '카카오 기술블로그': 18,
    '네이버 D2': 17,
    '우아한형제들': 16,
    '당근마켓 기술블로그': 15,
    'Medium': 10
  };
  
  const platformScore = platformWeights[platform] || 5;
  
  return Math.min(100, Math.round(baseScore + engagementScore + platformScore));
}

// 잠재 저자 점수 계산
function calculatePotentialScore(
  articleCount: number, 
  specialties: string[], 
  recentActivity: number,
  influenceScore: number
): number {
  // 적절한 글 개수 (너무 많지도 적지도 않은)
  const idealArticleCount = articleCount >= 5 && articleCount <= 20 ? 25 : Math.max(0, 25 - Math.abs(articleCount - 12));
  
  // 전문 분야 다양성 점수
  const specialtyScore = Math.min(20, specialties.length * 10);
  
  // 최근 활동 점수
  const activityScore = Math.min(25, recentActivity);
  
  // 기본 영향력 점수의 30%
  const influenceBonus = influenceScore * 0.3;
  
  return Math.min(100, Math.round(idealArticleCount + specialtyScore + activityScore + influenceBonus));
}

export async function GET(request: NextRequest) {
  try {
    // RSS 수집 API를 통해 최신 아티클 가져오기
    const articlesResponse = await fetch(`${request.nextUrl.origin}/api/feeds/all`);
    const articlesData = await articlesResponse.json();
    
    if (!articlesData.success || !articlesData.articles) {
      return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 });
    }

    const articles = articlesData.articles;
    
    // 작가별 데이터 집계
    const authorMap = new Map<string, {
      name: string;
      platform: string;
      articles: Article[];
      totalEngagement: number;
    }>();

    articles.forEach((article: Article) => {
      const authorName = article.author?.name || 'Unknown Author';
      const platform = article.platform?.name || 'Unknown Platform';
      const key = `${authorName}@${platform}`;
      
      if (!authorMap.has(key)) {
        authorMap.set(key, {
          name: authorName,
          platform: platform,
          articles: [],
          totalEngagement: 0
        });
      }
      
      const authorData = authorMap.get(key)!;
      authorData.articles.push(article);
      // 임시 engagement 점수 (실제로는 조회수, 좋아요 등 데이터 필요)
      authorData.totalEngagement += Math.floor(Math.random() * 1000) + 100;
    });

    // 작가 분석 데이터 생성
    const authorsAnalysis: AuthorData[] = Array.from(authorMap.values())
      .filter(author => author.articles.length >= 2) // 최소 2개 이상 글 작성
      .map(author => {
        const articleCount = author.articles.length;
        const averageEngagement = Math.round(author.totalEngagement / articleCount);
        
        // 모든 글의 제목과 내용을 합쳐서 전문 분야 분석
        const allText = author.articles
          .map(article => `${article.title} ${article.excerpt || ''}`)
          .join(' ');
        
        const specialties = analyzeSpecialties(allText);
        
        // 최근 활동 점수 (임시 - 실제로는 날짜 기반 계산 필요)
        const recentActivity = Math.floor(Math.random() * 100);
        
        const influenceScore = calculateInfluenceScore(articleCount, averageEngagement, author.platform);
        const potentialScore = calculatePotentialScore(articleCount, specialties, recentActivity, influenceScore);
        
        return {
          name: author.name,
          platform: author.platform,
          articleCount,
          totalEngagement: author.totalEngagement,
          averageEngagement,
          specialties: specialties.slice(0, 3), // 최대 3개 전문 분야
          recentActivity,
          influenceScore,
          potentialScore
        };
      });

    // 다양한 기준으로 정렬된 리스트들
    const topInfluencers = [...authorsAnalysis]
      .sort((a, b) => b.influenceScore - a.influenceScore)
      .slice(0, 20);
    
    const potentialAuthors = [...authorsAnalysis]
      .sort((a, b) => b.potentialScore - a.potentialScore)
      .slice(0, 15);
    
    const activeWriters = [...authorsAnalysis]
      .sort((a, b) => b.recentActivity - a.recentActivity)
      .slice(0, 15);

    // 플랫폼별 Top 작가
    const platformLeaders: { [platform: string]: AuthorData[] } = {};
    authorsAnalysis.forEach(author => {
      if (!platformLeaders[author.platform]) {
        platformLeaders[author.platform] = [];
      }
      platformLeaders[author.platform].push(author);
    });

    Object.keys(platformLeaders).forEach(platform => {
      platformLeaders[platform] = platformLeaders[platform]
        .sort((a, b) => b.influenceScore - a.influenceScore)
        .slice(0, 5);
    });

    // 전문 분야별 Top 작가
    const specialtyLeaders: { [specialty: string]: AuthorData[] } = {};
    Object.keys(techSpecialties).forEach(specialty => {
      specialtyLeaders[specialty] = authorsAnalysis
        .filter(author => author.specialties.includes(specialty))
        .sort((a, b) => b.influenceScore - a.influenceScore)
        .slice(0, 10);
    });

    return NextResponse.json({
      success: true,
      data: {
        totalAuthors: authorsAnalysis.length,
        totalArticles: articles.length,
        topInfluencers,
        potentialAuthors,
        activeWriters,
        platformLeaders,
        specialtyLeaders,
        stats: {
          avgInfluenceScore: Math.round(authorsAnalysis.reduce((sum, author) => sum + author.influenceScore, 0) / authorsAnalysis.length),
          avgPotentialScore: Math.round(authorsAnalysis.reduce((sum, author) => sum + author.potentialScore, 0) / authorsAnalysis.length),
          topPlatforms: Object.keys(platformLeaders).sort((a, b) => platformLeaders[b].length - platformLeaders[a].length).slice(0, 5)
        }
      }
    });

  } catch (error) {
    console.error('Authors analysis error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
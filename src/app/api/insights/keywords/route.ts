import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// 기술 키워드 목록 (확장 가능)
const techKeywords = [
  // Frontend
  'React', 'Vue.js', 'Angular', 'JavaScript', 'TypeScript', 'Next.js', 'Svelte', 'HTML', 'CSS', 'Tailwind',
  // Backend
  'Node.js', 'Python', 'Java', 'Spring', 'Express', 'FastAPI', 'Django', 'Flask', 'Go', 'Rust', 'PHP', 'Laravel',
  // Database
  'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'SQLite', 'GraphQL', 'Prisma', 'Sequelize',
  // Cloud & DevOps
  'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'CI/CD', 'Jenkins', 'GitHub Actions', 'Terraform',
  // AI/ML
  '머신러닝', '딥러닝', 'TensorFlow', 'PyTorch', 'AI', 'ChatGPT', 'LLM', 'OpenAI', 'BERT', 'GPT',
  // Mobile
  'iOS', 'Android', 'React Native', 'Flutter', 'Swift', 'Kotlin', 'Xamarin',
  // Architecture
  '마이크로서비스', 'API', 'REST', 'MSA', '아키텍처', '설계', '패턴', 'DDD', 'TDD', '클린코드',
  // Data
  '데이터', '분석', '시각화', '빅데이터', 'ETL', 'Apache Spark', 'Kafka', 'Elasticsearch',
  // Security
  '보안', 'OAuth', 'JWT', 'HTTPS', '암호화', '인증', '인가',
  // Others
  '성능', '최적화', '배포', '모니터링', '테스트', '리팩토링', '개발자', '개발', '기술', '트렌드'
];

// 텍스트에서 키워드 추출 함수
function extractKeywords(text: string): { [key: string]: number } {
  const keywordCounts: { [key: string]: number } = {};
  const normalizedText = text.toLowerCase();
  
  techKeywords.forEach(keyword => {
    const normalizedKeyword = keyword.toLowerCase();
    // 정확한 단어 매칭을 위한 정규식 (단어 경계 고려)
    const regex = new RegExp(`\\b${normalizedKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    const matches = text.match(regex);
    if (matches) {
      keywordCounts[keyword] = matches.length;
    }
  });
  
  return keywordCounts;
}

// 시장성 점수 계산 (임시 로직 - 실제로는 더 복잡한 알고리즘 사용)
function calculateMarketScore(keyword: string, frequency: number, totalArticles: number): number {
  const baseScore = (frequency / totalArticles) * 100;
  
  // 인기 키워드에 가중치 부여
  const trendingKeywords = ['AI', 'ChatGPT', 'React', 'Next.js', 'TypeScript', 'Kubernetes', 'Docker'];
  const isTrending = trendingKeywords.some(tk => keyword.toLowerCase().includes(tk.toLowerCase()));
  const trendingBonus = isTrending ? 20 : 0;
  
  // 새로운 기술에 추가 점수
  const emergingKeywords = ['Bun', 'Deno', 'WebAssembly', 'Solid.js', 'Astro'];
  const isEmerging = emergingKeywords.some(ek => keyword.toLowerCase().includes(ek.toLowerCase()));
  const emergingBonus = isEmerging ? 15 : 0;
  
  return Math.min(100, Math.round(baseScore + trendingBonus + emergingBonus));
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
    const keywordFrequency: { [key: string]: number } = {};
    const keywordByPlatform: { [key: string]: { [platform: string]: number } } = {};
    
    // 모든 아티클에서 키워드 추출
    articles.forEach((article: any) => {
      const titleKeywords = extractKeywords(article.title || '');
      const excerptKeywords = extractKeywords(article.excerpt || '');
      const platform = article.platform?.name || 'Unknown';
      
      // 제목과 본문의 키워드 합치기 (제목 키워드에 가중치 2배)
      const allKeywords = { ...excerptKeywords };
      Object.entries(titleKeywords).forEach(([keyword, count]) => {
        allKeywords[keyword] = (allKeywords[keyword] || 0) + (count * 2);
      });
      
      // 전체 빈도 계산
      Object.entries(allKeywords).forEach(([keyword, count]) => {
        keywordFrequency[keyword] = (keywordFrequency[keyword] || 0) + count;
        
        // 플랫폼별 빈도 계산
        if (!keywordByPlatform[keyword]) {
          keywordByPlatform[keyword] = {};
        }
        keywordByPlatform[keyword][platform] = (keywordByPlatform[keyword][platform] || 0) + count;
      });
    });

    // 키워드 분석 결과 생성
    const keywordAnalysis = Object.entries(keywordFrequency)
      .filter(([_, frequency]) => frequency >= 2) // 최소 2회 이상 언급된 키워드만
      .map(([keyword, frequency]) => {
        const marketScore = calculateMarketScore(keyword, frequency, articles.length);
        const platforms = keywordByPlatform[keyword] || {};
        
        // 성장세 계산 (임시 - 실제로는 시간별 데이터 필요)
        const growth = Math.random() > 0.5 ? 
          Math.floor(Math.random() * 50) : 
          -Math.floor(Math.random() * 20);
        
        return {
          keyword,
          frequency,
          marketScore,
          growth,
          platforms: Object.entries(platforms)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3) // 상위 3개 플랫폼만
            .map(([platform, count]) => ({ platform, count }))
        };
      })
      .sort((a, b) => b.frequency - a.frequency) // 빈도순 정렬
      .slice(0, 50); // 상위 50개만

    // 카테고리별 키워드 분류
    const categories = {
      'AI/ML': keywordAnalysis.filter(k => 
        ['AI', 'ChatGPT', '머신러닝', '딥러닝', 'TensorFlow', 'PyTorch', 'LLM', 'OpenAI'].some(term => 
          k.keyword.toLowerCase().includes(term.toLowerCase())
        )
      ),
      'Frontend': keywordAnalysis.filter(k => 
        ['React', 'Vue', 'Angular', 'JavaScript', 'TypeScript', 'Next.js', 'HTML', 'CSS'].some(term => 
          k.keyword.toLowerCase().includes(term.toLowerCase())
        )
      ),
      'Backend': keywordAnalysis.filter(k => 
        ['Node.js', 'Python', 'Java', 'Spring', 'API', 'Express', 'Django'].some(term => 
          k.keyword.toLowerCase().includes(term.toLowerCase())
        )
      ),
      'Cloud/DevOps': keywordAnalysis.filter(k => 
        ['AWS', 'Docker', 'Kubernetes', 'Azure', 'CI/CD', 'DevOps'].some(term => 
          k.keyword.toLowerCase().includes(term.toLowerCase())
        )
      )
    };

    return NextResponse.json({
      success: true,
      data: {
        totalArticles: articles.length,
        totalKeywords: keywordAnalysis.length,
        topKeywords: keywordAnalysis.slice(0, 20),
        categories,
        trending: keywordAnalysis.filter(k => k.growth > 0).slice(0, 10),
        emerging: keywordAnalysis.filter(k => k.marketScore >= 70).slice(0, 10)
      }
    });

  } catch (error) {
    console.error('Keywords analysis error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
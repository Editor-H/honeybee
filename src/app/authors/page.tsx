import { User, ArrowLeft, Award, TrendingUp, Users } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { collectAllFeeds } from "@/lib/rss-collector";

export default async function AuthorsPage() {
  let allArticles;
  
  try {
    allArticles = await collectAllFeeds();
  } catch (error) {
    console.error('RSS 수집 실패:', error);
    const { getRecentArticles } = await import('@/data/mock-data');
    allArticles = getRecentArticles(50);
  }
  
  // 작가별 통계 수집
  const authorStats: Record<string, {
    name: string;
    company: string;
    articles: number;
    totalViews: number;
    totalLikes: number;
    platforms: Set<string>;
    categories: Set<string>;
    lastPublished: Date;
  }> = {};
  
  allArticles.forEach(article => {
    const authorKey = `${article.author.name}-${article.author.company}`;
    
    if (!authorStats[authorKey]) {
      authorStats[authorKey] = {
        name: article.author.name,
        company: article.author.company,
        articles: 0,
        totalViews: 0,
        totalLikes: 0,
        platforms: new Set(),
        categories: new Set(),
        lastPublished: article.publishedAt
      };
    }
    
    const stats = authorStats[authorKey];
    stats.articles++;
    stats.totalViews += article.viewCount || 0;
    stats.totalLikes += article.likeCount || 0;
    stats.platforms.add(article.platform.name);
    stats.categories.add(article.category);
    
    if (article.publishedAt > stats.lastPublished) {
      stats.lastPublished = article.publishedAt;
    }
  });
  
  // 영향력 점수로 정렬 (글 수 + 총 조회수/100 + 총 좋아요수/10)
  const topAuthors = Object.values(authorStats)
    .map(author => ({
      ...author,
      influenceScore: author.articles * 10 + author.totalViews / 100 + author.totalLikes / 10,
      platformCount: author.platforms.size,
      categoryCount: author.categories.size
    }))
    .sort((a, b) => b.influenceScore - a.influenceScore)
    .slice(0, 30);

  const getCompanyColor = (company: string) => {
    const hash = company.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    const colors = [
      "from-blue-500 to-cyan-500",
      "from-green-500 to-emerald-500", 
      "from-purple-500 to-pink-500",
      "from-red-500 to-orange-500",
      "from-yellow-500 to-amber-500",
      "from-indigo-500 to-violet-500",
      "from-teal-500 to-cyan-500"
    ];
    return colors[hash % colors.length];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full bg-gradient-to-br from-yellow-50/95 to-orange-50/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/">
                <Button variant="ghost" size="sm" className="mr-4">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  홈으로
                </Button>
              </Link>
              <Link 
                href="/" 
                className="text-2xl font-bold bg-gradient-to-r from-yellow-600 via-yellow-500 to-amber-600 bg-clip-text text-transparent"
              >
                HoneyBee
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
        {/* Page Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-100 to-red-100 rounded-full mb-4">
            <User className="w-8 h-8 text-orange-600" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">주목할 작가</h1>
          <p className="text-lg text-slate-600 mb-2">
            <strong>영향력 점수</strong>를 기준으로 정렬된 개발 커뮤니티의 주요 기술 작가들
          </p>
          <p className="text-sm text-slate-500 mb-4">
            영향력 점수 = (글 수 × 10) + (총 조회수 ÷ 100) + (총 좋아요 수 ÷ 10)으로 계산하여 상위 30명 표시
          </p>
          <div className="text-sm text-slate-500">
            총 {topAuthors.length}명의 활발한 작가들
          </div>
        </div>

        {/* Top 5 Authors */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center">
            <Award className="w-6 h-6 mr-2 text-yellow-600" />
            Top 5 영향력 있는 작가
          </h2>
          <div className="grid md:grid-cols-5 gap-4">
            {topAuthors.slice(0, 5).map((author, index) => (
              <Card key={`${author.name}-${author.company}`} className="text-center hover:shadow-lg transition-shadow relative">
                {index === 0 && (
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    👑
                  </div>
                )}
                <CardContent className="p-4">
                  <Avatar className="w-16 h-16 mx-auto mb-3">
                    <AvatarFallback className={`bg-gradient-to-r ${getCompanyColor(author.company)} text-white text-xl font-bold`}>
                      {author.name.slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="font-bold text-slate-900 mb-1">{author.name}</h3>
                  <p className="text-sm text-slate-600 mb-2">{author.company}</p>
                  <div className="space-y-1 text-xs text-slate-500">
                    <div className="flex items-center justify-center">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      {author.articles}개 글
                    </div>
                    <div className="flex items-center justify-center">
                      <Users className="w-3 h-3 mr-1" />
                      {author.totalViews.toLocaleString()} 뷰
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* All Authors */}
        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-4">전체 작가 랭킹</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topAuthors.map((author, index) => (
              <Card key={`${author.name}-${author.company}`} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">
                        #{index + 1}
                      </div>
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className={`bg-gradient-to-r ${getCompanyColor(author.company)} text-white font-bold`}>
                          {author.name.slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="text-right text-xs text-slate-500">
                      {Math.floor(author.influenceScore)} 점
                    </div>
                  </div>
                  
                  <div className="ml-11">
                    <h3 className="font-semibold text-slate-900 mb-1">{author.name}</h3>
                    <p className="text-sm text-slate-600 mb-2">{author.company}</p>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-500">
                      <div>글: {author.articles}개</div>
                      <div>조회: {author.totalViews.toLocaleString()}</div>
                      <div>플랫폼: {author.platformCount}개</div>
                      <div>카테고리: {author.categoryCount}개</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
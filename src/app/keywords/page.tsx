import { Star, ArrowLeft, TrendingUp } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { collectAllFeeds } from "@/lib/rss-collector";

export default async function KeywordsPage() {
  let allArticles;
  
  try {
    allArticles = await collectAllFeeds();
  } catch (error) {
    console.error('RSS 수집 실패:', error);
    const { getRecentArticles } = await import('@/data/mock-data');
    allArticles = getRecentArticles(50);
  }
  
  // 모든 태그를 수집하고 빈도 계산
  const tagFrequency: Record<string, { count: number, articles: string[] }> = {};
  
  allArticles.forEach(article => {
    article.tags.forEach(tag => {
      if (!tagFrequency[tag]) {
        tagFrequency[tag] = { count: 0, articles: [] };
      }
      tagFrequency[tag].count++;
      tagFrequency[tag].articles.push(article.id);
    });
  });
  
  // 빈도순으로 정렬하고 상위 50개 선택
  const trendingKeywords = Object.entries(tagFrequency)
    .sort(([,a], [,b]) => b.count - a.count)
    .slice(0, 50)
    .map(([keyword, data], index) => ({
      keyword,
      count: data.count,
      growth: Math.floor(Math.random() * 100) - 20, // 임시 성장률
      rank: index + 1,
      category: allArticles.find(article => article.tags.includes(keyword))?.category || 'general'
    }));

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      frontend: "from-blue-500 to-cyan-500",
      backend: "from-green-500 to-emerald-500",
      "ai-ml": "from-purple-500 to-pink-500",
      "cloud-infra": "from-sky-500 to-blue-500",
      game: "from-red-500 to-orange-500",
      office: "from-indigo-500 to-violet-500",
      design: "from-pink-500 to-rose-500",
      mobile: "from-teal-500 to-cyan-500",
      data: "from-orange-500 to-amber-500",
      security: "from-slate-500 to-gray-500",
      general: "from-yellow-500 to-amber-500"
    };
    return colors[category] || colors.general;
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
              <a 
                href="/" 
                className="text-2xl font-bold bg-gradient-to-r from-yellow-600 via-yellow-500 to-amber-600 bg-clip-text text-transparent"
              >
                HoneyBee
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
        {/* Page Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full mb-4">
            <Star className="w-8 h-8 text-amber-600" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">핫한 키워드</h1>
          <p className="text-lg text-slate-600 mb-2">
            <strong>태그 출현 빈도</strong>를 기준으로 정렬된 인기 기술 키워드들
          </p>
          <p className="text-sm text-slate-500 mb-4">
            모든 기사의 태그를 분석하여 언급된 횟수가 많은 순으로 정렬 (상위 50개 키워드 표시)
          </p>
          <div className="text-sm text-slate-500">
            총 {trendingKeywords.length}개의 트렌딩 키워드
          </div>
        </div>

        {/* Top 10 Keywords */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center">
            <TrendingUp className="w-6 h-6 mr-2 text-yellow-600" />
            Top 10 키워드
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
            {trendingKeywords.slice(0, 10).map((keyword) => (
              <Card key={keyword.keyword} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl font-bold text-slate-800">#{keyword.rank}</span>
                    {keyword.growth > 0 && (
                      <span className="text-sm text-green-600 font-medium">
                        +{keyword.growth}%
                      </span>
                    )}
                  </div>
                  <div className={`inline-block px-3 py-1 rounded-full bg-gradient-to-r ${getCategoryColor(keyword.category)} text-white text-sm font-medium mb-2`}>
                    {keyword.keyword}
                  </div>
                  <div className="text-sm text-slate-600">
                    {keyword.count}개 글에서 언급
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* All Keywords */}
        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-4">전체 키워드</h2>
          <div className="flex flex-wrap gap-3">
            {trendingKeywords.map((keyword) => (
              <div
                key={keyword.keyword}
                className={`inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r ${getCategoryColor(keyword.category)} text-white hover:shadow-lg transition-all cursor-pointer`}
              >
                <span className="font-medium mr-2">{keyword.keyword}</span>
                <span className="text-xs opacity-80">({keyword.count})</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
import { TrendingUp, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArticleCard } from "@/components/article-card";
import { collectAllFeeds } from "@/lib/rss-collector";

export default async function TrendingPage() {
  let allArticles;
  
  try {
    allArticles = await collectAllFeeds();
  } catch (error) {
    console.error('RSS 수집 실패:', error);
    const { getRecentArticles } = await import('@/data/mock-data');
    allArticles = getRecentArticles(20);
  }
  
  // 트렌딩 기사들만 필터링하고 조회수/좋아요 순으로 정렬
  const trendingArticles = allArticles
    .filter(article => article.trending || article.viewCount > 3000)
    .sort((a, b) => (b.viewCount || 0) + (b.likeCount || 0) - (a.viewCount || 0) - (a.likeCount || 0))
    .slice(0, 24);

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
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-100 to-amber-100 rounded-full mb-4">
            <TrendingUp className="w-8 h-8 text-yellow-600" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">핫한 글</h1>
          <p className="text-lg text-slate-600 mb-2">
            <strong>조회수와 좋아요 수를 합산한 점수</strong>를 기준으로 정렬된 인기 기술 아티클들
          </p>
          <p className="text-sm text-slate-500 mb-4">
            트렌딩 마크가 있거나 조회수 3,000 이상인 글들을 대상으로 (조회수 + 좋아요 수) 순으로 정렬
          </p>
          <div className="text-sm text-slate-500">
            총 {trendingArticles.length}개의 트렌딩 아티클
          </div>
        </div>

        {/* Trending Articles Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {trendingArticles.map((article, index) => (
            <div key={article.id} className="relative">
              {index < 3 && (
                <div className="absolute -top-2 -left-2 z-10 w-8 h-8 bg-gradient-to-r from-yellow-500 to-amber-500 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                  {index + 1}
                </div>
              )}
              <ArticleCard article={article} />
            </div>
          ))}
        </div>

        {trendingArticles.length === 0 && (
          <div className="text-center py-12">
            <TrendingUp className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 text-lg">현재 트렌딩 기사를 불러올 수 없습니다.</p>
          </div>
        )}
      </main>
    </div>
  );
}
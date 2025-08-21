import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnimatedStats } from "@/components/animated-stats";
import { ArticleCard } from "@/components/article-card";
import { collectAllFeeds } from "@/lib/rss-collector";
import { Article } from "@/types/article";

export default async function Home() {
  let allArticles: Article[] = [];
  
  try {
    allArticles = await collectAllFeeds();
  } catch (error) {
    console.error('RSS 수집 실패:', error);
    // fallback to mock data
    const { getRecentArticles } = await import('@/data/mock-data');
    allArticles = getRecentArticles(12);
  }
  
  // 카테고리별 필터링 함수
  const getArticlesByCategory = (category: string) => {
    return allArticles.filter(article => article.category === category);
  };

  const recentArticles = allArticles.slice(0, 12);
  const frontendArticles = getArticlesByCategory('frontend');
  const backendArticles = getArticlesByCategory('backend');
  const aiMlArticles = getArticlesByCategory('ai-ml');
  const devopsArticles = getArticlesByCategory('devops');
  const designArticles = getArticlesByCategory('design');

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full bg-gradient-to-br from-yellow-50/95 to-orange-50/95 backdrop-blur supports-[backdrop-filter]:bg-gradient-to-br supports-[backdrop-filter]:from-yellow-50/60 supports-[backdrop-filter]:to-orange-50/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <a 
                href="/" 
                className="text-3xl font-bold bg-gradient-to-r from-yellow-600 via-yellow-500 to-amber-600 bg-clip-text text-transparent hover:from-yellow-700 hover:via-yellow-600 hover:to-amber-700 transition-all duration-200 cursor-pointer"
              >
                HoneyBee
              </a>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="ghost" className="text-slate-700 hover:text-yellow-600">
                로그인
              </Button>
              <Button className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white shadow-md">
                회원가입
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-4">
        {/* Stats Section */}
        <div className="text-center mb-4">
          <AnimatedStats />
        </div>

        {/* Search Section */}
        <div className="text-center mb-4">
          <div className="max-w-2xl mx-auto relative">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="키워드, 기술명, 작가명으로 검색해보세요..."
                className="pl-12 pr-6 py-6 text-lg rounded-full border-0 shadow-lg bg-white/80 backdrop-blur-sm focus:bg-white transition-all"
              />
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex justify-center mb-4">
          <Tabs defaultValue="all" className="w-full max-w-4xl">
            <TabsList className="grid w-full grid-cols-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg h-12">
              <TabsTrigger value="all" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-amber-500 data-[state=active]:text-white">전체</TabsTrigger>
              <TabsTrigger value="frontend" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-500 data-[state=active]:text-white">프론트엔드</TabsTrigger>
              <TabsTrigger value="backend" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white">백엔드</TabsTrigger>
              <TabsTrigger value="ai" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-600 data-[state=active]:to-amber-600 data-[state=active]:text-white">AI/ML</TabsTrigger>
              <TabsTrigger value="devops" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-600 data-[state=active]:to-orange-600 data-[state=active]:text-white">DevOps</TabsTrigger>
              <TabsTrigger value="design" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-600 data-[state=active]:to-red-600 data-[state=active]:text-white">기획/디자인</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-8">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recentArticles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="frontend" className="mt-8">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {frontendArticles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="backend" className="mt-8">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {backendArticles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="ai" className="mt-8">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {aiMlArticles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="devops" className="mt-8">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {devopsArticles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="design" className="mt-8">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {designArticles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Load More Button */}
        <div className="text-center mt-6">
          <Button size="lg" className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white px-12 py-3 shadow-lg">
            더 많은 글 보기
          </Button>
        </div>
      </main>
    </div>
  );
}

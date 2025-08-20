import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnimatedStats } from "@/components/animated-stats";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-md">
                  <span className="text-white font-bold text-sm">🐝</span>
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  HoneyBee
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="ghost" className="text-slate-700 hover:text-amber-600">
                로그인
              </Button>
              <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md">
                회원가입
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search Section */}
        <div className="text-center mb-12">
          <div className="max-w-2xl mx-auto relative mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="키워드, 기술명, 작가명으로 검색해보세요..."
                className="pl-12 pr-6 py-6 text-lg rounded-full border-0 shadow-lg bg-white/80 backdrop-blur-sm focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Animated Quick Stats */}
          <AnimatedStats />
        </div>

        {/* Category Tabs */}
        <div className="flex justify-center mb-12">
          <Tabs defaultValue="all" className="w-full max-w-4xl">
            <TabsList className="grid w-full grid-cols-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg h-12">
              <TabsTrigger value="all" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-500 data-[state=active]:text-white">전체</TabsTrigger>
              <TabsTrigger value="frontend" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white">프론트엔드</TabsTrigger>
              <TabsTrigger value="backend" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white">백엔드</TabsTrigger>
              <TabsTrigger value="ai" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-violet-500 data-[state=active]:text-white">AI/ML</TabsTrigger>
              <TabsTrigger value="devops" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">DevOps</TabsTrigger>
              <TabsTrigger value="design" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white">기획/디자인</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-8">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((item) => (
                  <Card key={item} className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm hover:bg-white overflow-hidden cursor-pointer hover:scale-[1.02]">
                    <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center relative overflow-hidden">
                      <div className={`absolute inset-0 bg-gradient-to-br opacity-10 ${
                        item === 1 ? "from-blue-400 to-blue-600" :
                        item === 2 ? "from-green-400 to-green-600" :
                        item === 3 ? "from-purple-400 to-purple-600" :
                        item === 4 ? "from-orange-400 to-orange-600" :
                        item === 5 ? "from-red-400 to-red-600" :
                        "from-teal-400 to-teal-600"
                      }`} />
                      <div className={`font-bold text-lg ${
                        item === 1 ? "text-blue-700" :
                        item === 2 ? "text-green-700" :
                        item === 3 ? "text-purple-700" :
                        item === 4 ? "text-orange-700" :
                        item === 5 ? "text-red-700" :
                        "text-teal-700"
                      }`}>
                        {item === 1 && "Next.js 15"}
                        {item === 2 && "React 19"}
                        {item === 3 && "TypeScript"}
                        {item === 4 && "AI 개발"}
                        {item === 5 && "DevOps"}
                        {item === 6 && "UI/UX"}
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <div className="flex items-center text-sm text-slate-500 mb-3">
                        <Badge variant="secondary" className="mr-2 text-xs">
                          {item <= 2 ? "토스" : item <= 4 ? "당근마켓" : "네이버"}
                        </Badge>
                        <span>김개발</span>
                        <span className="mx-2">•</span>
                        <span>2시간 전</span>
                      </div>
                      <CardTitle className="text-lg mb-2 line-clamp-2 group-hover:text-amber-600 transition-colors">
                        {item === 1 && "Next.js 15의 새로운 기능들과 마이그레이션 가이드"}
                        {item === 2 && "React 19에서 달라진 것들: 완전 정리"}
                        {item === 3 && "타입스크립트 5.0 새로운 기능 총정리"}
                        {item === 4 && "AI 도구를 활용한 개발 생산성 향상 방법"}
                        {item === 5 && "Docker와 Kubernetes로 시작하는 DevOps"}
                        {item === 6 && "사용자 경험을 개선하는 디자인 시스템"}
                      </CardTitle>
                      <CardDescription className="mb-3 line-clamp-2">
                        실제 프로젝트에 적용해본 경험을 바탕으로 새로운 기능들을 자세히 살펴보고 마이그레이션 시 주의사항들을 정리했습니다.
                      </CardDescription>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="text-xs">
                          {item === 1 ? "#Next.js" : item === 2 ? "#React" : item === 3 ? "#TypeScript" : item === 4 ? "#AI" : item === 5 ? "#DevOps" : "#Design"}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {item <= 3 ? "#프론트엔드" : item === 4 ? "#개발도구" : item === 5 ? "#인프라" : "#기획"}
                        </Badge>
                        {item === 1 && <Badge variant="outline" className="text-xs">#React</Badge>}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Load More Button */}
        <div className="text-center mt-16">
          <Button size="lg" className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-12 py-3 shadow-lg">
            더 많은 글 보기
          </Button>
        </div>
      </main>
    </div>
  );
}

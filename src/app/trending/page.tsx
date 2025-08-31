import { TrendingUp, ArrowLeft, BarChart3, Building2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function TrendingPage() {

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
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-100 to-amber-100 rounded-full mb-4">
            <BarChart3 className="w-8 h-8 text-yellow-600" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">데이터 분석</h1>
          <p className="text-lg text-slate-600 mb-2">
            <strong>트렌드 및 플랫폼 분석</strong>을 통해 IT 생태계의 동향을 파악하세요
          </p>
          <p className="text-sm text-slate-500 mb-4">
            실시간 데이터 기반의 상세한 인사이트와 차트를 제공합니다
          </p>
        </div>

        {/* Analytics Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Trending Analysis Card */}
          <Link href="/analytics/trending">
            <Card className="h-full hover:shadow-lg transition-all duration-200 cursor-pointer group border-2 hover:border-[#DAA63E]/20">
              <CardHeader className="text-center pb-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#DAA63E]/10 to-[#DAA63E]/20 rounded-full mb-4 mx-auto group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-8 h-8 text-[#DAA63E]" />
                </div>
                <CardTitle className="text-2xl text-slate-900 group-hover:text-[#DAA63E] transition-colors">
                  트렌딩 분석
                </CardTitle>
                <CardDescription className="text-base">
                  인기 아티클, 태그, 플랫폼 동향 분석
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <div className="w-2 h-2 bg-[#DAA63E] rounded-full"></div>
                  인기 아티클 TOP 10
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  트렌딩 태그 워드클라우드
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  콘텐츠 타입별 분포
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  플랫폼별 활동 현황
                </div>
                <div className="pt-3">
                  <Button className="w-full bg-[#DAA63E] hover:bg-[#B8941F] text-white group-hover:shadow-md transition-all">
                    분석 보기 →
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Platform Analysis Card */}
          <Link href="/analytics/platform">
            <Card className="h-full hover:shadow-lg transition-all duration-200 cursor-pointer group border-2 hover:border-blue-500/20">
              <CardHeader className="text-center pb-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500/10 to-blue-500/20 rounded-full mb-4 mx-auto group-hover:scale-110 transition-transform">
                  <Building2 className="w-8 h-8 text-blue-500" />
                </div>
                <CardTitle className="text-2xl text-slate-900 group-hover:text-blue-500 transition-colors">
                  플랫폼 분석
                </CardTitle>
                <CardDescription className="text-base">
                  각 플랫폼별 상세한 활동 분석
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  플랫폼별 아티클 통계
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  생산성 및 활동 패턴
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  콘텐츠 유형별 분포
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  시간대별 발행 패턴
                </div>
                <div className="pt-3">
                  <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white group-hover:shadow-md transition-all">
                    분석 보기 →
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </main>
    </div>
  );
}
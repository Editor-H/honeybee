import { Globe, ArrowLeft, ExternalLink, Calendar, TrendingUp } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { collectAllFeeds } from "@/lib/rss-collector";

export default async function PlatformsPage() {
  let allArticles;
  
  try {
    allArticles = await collectAllFeeds();
  } catch (error) {
    console.error('RSS 수집 실패:', error);
    const { getRecentArticles } = await import('@/data/mock-data');
    allArticles = getRecentArticles(50);
  }
  
  // 플랫폼별 통계 수집
  const platformStats: Record<string, {
    id: string;
    name: string;
    type: string;
    baseUrl: string;
    description: string;
    articles: number;
    authors: Set<string>;
    totalViews: number;
    totalLikes: number;
    categories: Set<string>;
    lastUpdate: Date;
    isNew: boolean;
  }> = {};
  
  allArticles.forEach(article => {
    const platform = article.platform;
    
    if (!platformStats[platform.id]) {
      const isNew = platform.lastCrawled && 
        new Date().getTime() - new Date(platform.lastCrawled).getTime() < 30 * 24 * 60 * 60 * 1000; // 30일 이내
        
      platformStats[platform.id] = {
        id: platform.id,
        name: platform.name,
        type: platform.type,
        baseUrl: platform.baseUrl,
        description: platform.description,
        articles: 0,
        authors: new Set(),
        totalViews: 0,
        totalLikes: 0,
        categories: new Set(),
        lastUpdate: article.publishedAt,
        isNew: isNew || false
      };
    }
    
    const stats = platformStats[platform.id];
    stats.articles++;
    stats.authors.add(article.author.name);
    stats.totalViews += article.viewCount || 0;
    stats.totalLikes += article.likeCount || 0;
    stats.categories.add(article.category);
    
    if (article.publishedAt > stats.lastUpdate) {
      stats.lastUpdate = article.publishedAt;
    }
  });
  
  const platforms = Object.values(platformStats)
    .map(platform => ({
      ...platform,
      authorCount: platform.authors.size,
      categoryCount: platform.categories.size,
      avgViews: Math.floor(platform.totalViews / platform.articles) || 0
    }))
    .sort((a, b) => b.articles - a.articles);

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      corporate: "from-blue-500 to-cyan-500",
      community: "from-green-500 to-emerald-500",
      personal: "from-purple-500 to-pink-500"
    };
    return colors[type] || colors.community;
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      corporate: "기업 블로그",
      community: "커뮤니티",
      personal: "개인 블로그"
    };
    return labels[type] || "기타";
  };

  const newPlatforms = platforms.filter(p => p.isNew);
  const corporatePlatforms = platforms.filter(p => p.type === 'corporate');
  const communityPlatforms = platforms.filter(p => p.type === 'community');

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
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-100 to-pink-100 rounded-full mb-4">
            <Globe className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">새 플랫폼</h1>
          <p className="text-lg text-slate-600 mb-2">
            <strong>수집 기사 수</strong>를 기준으로 정렬된 HoneyBee의 기술 블로그 및 미디어 플랫폼들
          </p>
          <p className="text-sm text-slate-500 mb-4">
            각 플랫폼에서 수집된 기사 수가 많은 순으로 정렬하고, 기업 블로그와 커뮤니티 플랫폼으로 분류하여 표시
          </p>
          <div className="text-sm text-slate-500">
            총 {platforms.length}개의 활성 플랫폼
          </div>
        </div>

        {/* New Platforms */}
        {newPlatforms.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center">
              <TrendingUp className="w-6 h-6 mr-2 text-green-600" />
              새로 추가된 플랫폼
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {newPlatforms.map((platform) => (
                <Card key={platform.id} className="hover:shadow-lg transition-shadow border-2 border-green-200">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <h3 className="text-lg font-bold text-slate-900 mr-2">{platform.name}</h3>
                          <Badge className="bg-green-500 text-white">NEW</Badge>
                        </div>
                        <Badge className={`bg-gradient-to-r ${getTypeColor(platform.type)} text-white mb-2`}>
                          {getTypeLabel(platform.type)}
                        </Badge>
                      </div>
                    </div>
                    
                    <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                      {platform.description}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm text-slate-500 mb-4">
                      <div>
                        <div className="font-medium text-slate-700">{platform.articles}</div>
                        <div>글 수</div>
                      </div>
                      <div>
                        <div className="font-medium text-slate-700">{platform.authorCount}</div>
                        <div>작가 수</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-slate-500 flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {platform.lastUpdate.toLocaleDateString()}
                      </div>
                      <a 
                        href={platform.baseUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
                      >
                        방문 <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Corporate Platforms */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center">
            <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-cyan-500 rounded mr-2"></div>
            기업 기술 블로그
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {corporatePlatforms.map((platform) => (
              <Card key={platform.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 mb-2">{platform.name}</h3>
                      <Badge className={`bg-gradient-to-r ${getTypeColor(platform.type)} text-white`}>
                        {getTypeLabel(platform.type)}
                      </Badge>
                    </div>
                  </div>
                  
                  <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                    {platform.description}
                  </p>
                  
                  <div className="grid grid-cols-3 gap-2 text-sm text-slate-500 mb-4">
                    <div className="text-center">
                      <div className="font-medium text-slate-700">{platform.articles}</div>
                      <div className="text-xs">글</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-slate-700">{platform.authorCount}</div>
                      <div className="text-xs">작가</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-slate-700">{platform.avgViews.toLocaleString()}</div>
                      <div className="text-xs">평균 뷰</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-slate-500 flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {platform.lastUpdate.toLocaleDateString()}
                    </div>
                    <a 
                      href={platform.baseUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
                    >
                      방문 <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Community Platforms */}
        {communityPlatforms.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center">
              <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded mr-2"></div>
              커뮤니티 플랫폼
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {communityPlatforms.map((platform) => (
                <Card key={platform.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">{platform.name}</h3>
                        <Badge className={`bg-gradient-to-r ${getTypeColor(platform.type)} text-white`}>
                          {getTypeLabel(platform.type)}
                        </Badge>
                      </div>
                    </div>
                    
                    <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                      {platform.description}
                    </p>
                    
                    <div className="grid grid-cols-3 gap-2 text-sm text-slate-500 mb-4">
                      <div className="text-center">
                        <div className="font-medium text-slate-700">{platform.articles}</div>
                        <div className="text-xs">글</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-slate-700">{platform.authorCount}</div>
                        <div className="text-xs">작가</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-slate-700">{platform.categoryCount}</div>
                        <div className="text-xs">카테고리</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-slate-500 flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {platform.lastUpdate.toLocaleDateString()}
                      </div>
                      <a 
                        href={platform.baseUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
                      >
                        방문 <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
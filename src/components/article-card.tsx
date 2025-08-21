"use client";

import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Article } from "@/types/article";

interface ArticleCardProps {
  article: Article;
}

export function ArticleCard({ article }: ArticleCardProps) {
  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "방금 전";
    if (diffInHours < 24) return `${diffInHours}시간 전`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}일 전`;
    return date.toLocaleDateString('ko-KR');
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'frontend': return 'from-blue-400 to-blue-600';
      case 'backend': return 'from-green-400 to-green-600';
      case 'ai-ml': return 'from-purple-400 to-purple-600';
      case 'devops': return 'from-orange-400 to-orange-600';
      case 'design': return 'from-red-400 to-red-600';
      default: return 'from-teal-400 to-teal-600';
    }
  };

  const getCategoryTextColor = (category: string) => {
    switch (category) {
      case 'frontend': return 'text-blue-700';
      case 'backend': return 'text-green-700';
      case 'ai-ml': return 'text-purple-700';
      case 'devops': return 'text-orange-700';
      case 'design': return 'text-red-700';
      default: return 'text-teal-700';
    }
  };

  const getPlatformColor = (platformId: string) => {
    switch (platformId) {
      case 'toss': return 'from-blue-500 to-blue-600';
      case 'daangn': return 'from-orange-500 to-orange-600';
      case 'naver-d2': return 'from-green-500 to-green-600';
      case 'brunch': return 'from-amber-500 to-yellow-600';
      case 'medium': return 'from-slate-700 to-slate-800';
      case 'yozm': return 'from-purple-500 to-purple-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const handleCardClick = () => {
    window.open(article.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Card 
      className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm hover:bg-white overflow-hidden cursor-pointer hover:scale-[1.02]"
      onClick={handleCardClick}
    >
      <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center relative overflow-hidden">
        {article.thumbnail ? (
          <>
            <img 
              src={article.thumbnail} 
              alt={article.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                // 이미지 로드 실패 시 숨기기
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-black/20" />
            <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 rounded text-white text-xs font-medium">
              {article.platform.name.replace(' 기술블로그', '').replace('NAVER ', '')}
            </div>
          </>
        ) : (
          <>
            <div className={`absolute inset-0 bg-gradient-to-br opacity-20 ${getPlatformColor(article.platform.id)}`} />
            <div className="font-bold text-lg text-slate-700">
              {article.platform.name.replace(' 기술블로그', '').replace('NAVER ', '')}
            </div>
          </>
        )}
      </div>
      <CardContent className="p-6">
        <div className="flex items-center text-sm text-slate-500 mb-3">
          <Badge variant="secondary" className="mr-2 text-xs">
            {article.platform.name.replace(' 기술블로그', '').replace('NAVER ', '')}
          </Badge>
          <span>{article.author.name}</span>
          <span className="mx-2">•</span>
          <span>{formatDate(article.publishedAt)}</span>
        </div>
        <CardTitle className="text-lg mb-2 line-clamp-2 group-hover:text-yellow-600 transition-colors">
          {article.title}
        </CardTitle>
        <CardDescription className="mb-3 line-clamp-2">
          {article.excerpt}
        </CardDescription>
        <div className="flex flex-wrap gap-2">
          {article.tags.slice(0, 3).map((tag, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              #{tag}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
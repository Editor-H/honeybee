"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bookmark, BookmarkCheck, Clock } from "lucide-react";
import { Article } from "@/types/article";
import { useToastContext } from "@/contexts/toast-context";

interface ArticleCardProps {
  article: Article;
  isInitiallySaved?: boolean;
  onUnsave?: (articleUrl: string) => void;
  onSave?: (articleUrl: string) => void;
}

export function ArticleCard({ article, isInitiallySaved = false, onUnsave, onSave }: ArticleCardProps) {
  const { data: session } = useSession();
  const [isSaved, setIsSaved] = useState(isInitiallySaved);
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToastContext();
  
  const formatDate = (date: Date | string) => {
    const now = new Date();
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const diffInHours = Math.floor((now.getTime() - dateObj.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "방금 전";
    if (diffInHours < 24) return `${diffInHours}시간 전`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}일 전`;
    
    // 7일 이상된 경우 간단한 날짜 형식 사용
    const currentYear = now.getFullYear();
    const dateYear = dateObj.getFullYear();
    
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const day = dateObj.getDate().toString().padStart(2, '0');
    
    if (currentYear === dateYear) {
      // 같은 해면 MM.DD 형식
      return `${month}.${day}`;
    } else {
      // 다른 해면 YY.MM.DD 형식
      const year = dateYear.toString().slice(-2);
      return `${year}.${month}.${day}`;
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSaveClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!session?.user?.email) {
      showToast('아티클을 저장하려면 먼저 로그인해 주세요 😊', 'info');
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (isSaved) {
        // 아티클 삭제
        const response = await fetch(`/api/articles/save?url=${encodeURIComponent(article.url)}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          setIsSaved(false);
          showToast('저장이 해제되었습니다', 'success');
          if (onUnsave) {
            onUnsave(article.url);
          }
        } else {
          throw new Error('저장 삭제 실패');
        }
      } else {
        // 아티클 저장
        const response = await fetch('/api/articles/save', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            article: {
              url: article.url,
              title: article.title,
              excerpt: article.excerpt,
              image: null, // 이미지가 있다면 추가
              publishedAt: article.publishedAt,
              platform: article.platform.name,
            }
          }),
        });
        
        if (response.ok) {
          setIsSaved(true);
          showToast('아티클이 저장되었어요! 📚', 'success');
          if (onSave) {
            onSave(article.url);
          }
        } else {
          throw new Error('저장 실패');
        }
      }
    } catch (error) {
      console.error('Save/Delete error:', error);
      showToast(
        isSaved ? '저장 삭제 중 문제가 발생했어요 😅' : '저장하는 중 문제가 발생했어요 😅', 
        'error'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    return 'bg-[#DAA63E]';
  };

  const getCategoryTextColor = (category: string) => {
    return 'text-[#DAA63E]';
  };

  const getPlatformColor = (platformId: string) => {
    return '#DAA63E'; // 모든 플랫폼에 동일한 포인트 컬러 사용
  };

  const getPlatformLogoComponent = (platform: Article['platform']) => {
    // 실제 로고 이미지가 있으면 사용하고, 없으면 폴백 이니셜 사용
    if (platform.logoUrl) {
      return (
        <div className="relative w-8 h-8">
          <img 
            src={platform.logoUrl} 
            alt={`${platform.name} 로고`}
            className="w-8 h-8 rounded-full object-cover border border-gray-200"
            onError={(e) => {
              // 이미지 로드 실패 시 폴백 표시
              const fallback = e.currentTarget.nextElementSibling;
              e.currentTarget.style.display = 'none';
              if (fallback) fallback.classList.remove('hidden');
            }}
          />
          {/* 폴백 이니셜 로고 (기본적으로 숨김) */}
          <div className="hidden absolute inset-0 w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center">
            <span className="text-sm font-semibold text-white">
              {platform.name.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
      );
    }

    // 폴백 이니셜 로고
    const logoStyles = {
      '토스 기술블로그': { bg: 'bg-blue-500', text: 'T', color: 'text-white' },
      '카카오 기술블로그': { bg: 'bg-yellow-400', text: 'K', color: 'text-black' },
      '당근마켓 기술블로그': { bg: 'bg-orange-500', text: '당', color: 'text-white' },
      '우아한형제들': { bg: 'bg-gray-800', text: '우', color: 'text-white' },
      '네이버 D2': { bg: 'bg-green-500', text: 'N', color: 'text-white' },
      '넷마블 기술블로그': { bg: 'bg-red-500', text: 'N', color: 'text-white' },
      '마켓컬리 기술 블로그': { bg: 'bg-purple-500', text: 'K', color: 'text-white' },
      '생활코딩': { bg: 'bg-green-600', text: '생', color: 'text-white' },
      '조코딩': { bg: 'bg-blue-600', text: '조', color: 'text-white' },
      '코딩애플': { bg: 'bg-red-400', text: '코', color: 'text-white' }
    };

    const style = logoStyles[platform.name as keyof typeof logoStyles];
    
    if (style) {
      return (
        <div className={`w-8 h-8 rounded-full ${style.bg} flex items-center justify-center border border-gray-200`}>
          <span className={`text-sm font-bold ${style.color}`}>{style.text}</span>
        </div>
      );
    }
    
    return (
      <div className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center border border-gray-200">
        <span className="text-sm font-semibold text-white">
          {platform.name.replace(' 기술블로그', '').replace('NAVER ', '').charAt(0)}
        </span>
      </div>
    );
  };

  const handleCardClick = () => {
    window.open(article.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Card 
      className={`group hover:shadow-sm transition-all duration-200 border overflow-hidden cursor-pointer rounded-2xl relative h-[240px] flex flex-col ${
        article.platform.type === 'docs' 
          ? 'border-blue-300 bg-blue-50/30 hover:border-blue-400 hover:bg-blue-50/50' 
          : 'border-gray-200 bg-white hover:border-[#DAA63E]'
      }`}
      onClick={handleCardClick}
    >
      {/* Content Type Badge */}
      <div className="absolute top-1.5 right-1.5 z-10">
        {article.platform.type === 'docs' ? (
          <Badge className="bg-blue-100 text-blue-700 text-[10px] px-1.5 py-0.5 border border-blue-300 font-medium">
            DOCS
          </Badge>
        ) : article.contentType === 'video' ? (
          <Badge className="bg-blue-50 text-blue-600 text-[10px] px-1.5 py-0.5 border border-blue-200 font-medium">
            VIDEO
          </Badge>
        ) : (
          <Badge className="bg-[#DAA63E]/10 text-[#DAA63E] text-[10px] px-1.5 py-0.5 border border-[#DAA63E]/20 font-medium">
            TEXT
          </Badge>
        )}
      </div>
      
      <CardContent className="p-3 flex-1 flex flex-col">
        <div className="flex items-start gap-2 mb-2">
          {/* Platform Logo */}
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 border border-gray-200">
            {getPlatformLogoComponent(article.platform)}
          </div>

          {/* Platform Info */}
          <div className="flex-1 min-w-0">
            <div className="flex justify-between mb-1">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 mb-0.5">
                  <span className="font-medium text-gray-700 text-sm truncate">
                    {article.platform.name === 'YouTube' && article.platform.channelName 
                      ? `YouTube • ${article.platform.channelName}`
                      : article.platform.name.replace(' 기술블로그', '').replace('NAVER ', '')
                    }
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="whitespace-nowrap">
                    {formatDate(article.publishedAt)}
                  </span>
                  {article.contentType === 'video' && article.videoDuration && (
                    <>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatDuration(article.videoDuration)}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              {/* Save Button */}
              <button
                onClick={handleSaveClick}
                disabled={isLoading}
                className="p-1 rounded-lg hover:bg-gray-100 transition-all duration-200 flex-shrink-0 ml-2 disabled:opacity-50"
                title={!session?.user ? "클릭하여 로그인 안내 보기" : isSaved ? "저장 삭제" : "아티클 저장"}
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-[#DAA63E] border-t-transparent rounded-full animate-spin"></div>
                ) : isSaved ? (
                  <BookmarkCheck className="w-4 h-4 text-[#DAA63E]" />
                ) : (
                  <Bookmark className="w-4 h-4 text-gray-400 hover:text-[#DAA63E]" />
                )}
              </button>
            </div>
            <div className="text-xs text-gray-500 truncate">
              {article.author.name}
            </div>
          </div>
        </div>

        <CardTitle className="text-base mb-1.5 line-clamp-2 group-hover:text-[#DAA63E] transition-colors leading-tight font-semibold">
          {article.title}
        </CardTitle>
        
        <CardDescription className="mb-2 line-clamp-1 text-gray-600 text-xs">
          {article.excerpt}
        </CardDescription>

        <div className="flex flex-wrap gap-1 mt-auto">
          {article.tags.slice(0, 3).map((tag, index) => (
            <Badge key={index} className="text-[10px] bg-gray-100 text-gray-600 border-0 hover:bg-[#DAA63E]/10 hover:text-[#DAA63E] transition-colors px-1.5 py-0.5">
              #{tag}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
"use client";

import { useState, useCallback, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { ArticleCard } from "@/components/article-card";
import { Article } from "@/types/article";

interface ArticleListProps {
  initialArticles: Article[];
  searchQuery?: string;
  activeCategory?: string;
  onSearchStateChange?: (isSearching: boolean) => void;
}

export function ArticleList({ initialArticles, searchQuery, activeCategory = "all", onSearchStateChange }: ArticleListProps) {
  const { data: session } = useSession();
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [searchResults, setSearchResults] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [displayCount, setDisplayCount] = useState(12);
  const [isSearchMode, setIsSearchMode] = useState(!!searchQuery);
  const [savedArticleUrls, setSavedArticleUrls] = useState<Set<string>>(new Set());

  // 저장된 아티클 목록 가져오기
  const fetchSavedArticles = useCallback(async () => {
    if (!session?.user?.id) {
      setSavedArticleUrls(new Set());
      return;
    }

    try {
      const response = await fetch('/api/articles/saved');
      const data = await response.json();
      
      if (data.success && data.articles) {
        const urls = new Set(data.articles.map((article: Article) => article.url));
        setSavedArticleUrls(urls);
      }
    } catch (error) {
      console.error('Failed to fetch saved articles:', error);
    }
  }, [session?.user?.id]);

  // 세션이 변경될 때 저장된 아티클 목록 새로고침
  useEffect(() => {
    fetchSavedArticles();
  }, [fetchSavedArticles]);

  // 검색 함수
  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setIsSearchMode(false);
      setSearchResults([]);
      onSearchStateChange?.(false);
      return;
    }

    setSearchLoading(true);
    setIsSearchMode(true);
    onSearchStateChange?.(true);

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=100`);
      const data = await response.json();
      
      if (data.success && data.results) {
        // Date 문자열을 Date 객체로 변환
        const processedResults = data.results.map((article: any) => ({
          ...article,
          publishedAt: new Date(article.publishedAt)
        }));
        setSearchResults(processedResults);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('검색 오류:', error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  }, [onSearchStateChange]);

  // 검색 초기화 함수
  const clearSearch = useCallback(() => {
    setIsSearchMode(false);
    setSearchResults([]);
    onSearchStateChange?.(false);
  }, [onSearchStateChange]);

  // searchQuery가 변경될 때마다 검색 수행
  useEffect(() => {
    if (searchQuery) {
      performSearch(searchQuery);
    } else {
      clearSearch();
    }
  }, [searchQuery, performSearch, clearSearch]);

  const loadMoreArticles = async () => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    try {
      // 현재 표시할 기사가 부족하면 새로운 RSS 데이터를 가져옴
      if (displayCount >= articles.length) {
        const response = await fetch('/api/feeds/all');
        const data = await response.json();
        
        if (data.success && data.articles) {
          // 새로운 기사들을 기존 기사들과 합치기 (중복 제거)
          const newArticles = data.articles.filter(
            (newArticle: Article) => !articles.some(existing => existing.id === newArticle.id)
          );
          
          if (newArticles.length > 0) {
            const allArticles = [...articles, ...newArticles];
            // 날짜순으로 정렬
            allArticles.sort((a, b) => 
              new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
            );
            setArticles(allArticles);
          }
        }
      }
      
      // 표시할 기사 수를 12개씩 증가
      const newDisplayCount = displayCount + 12;
      setDisplayCount(newDisplayCount);
      
      // 모든 기사를 다 표시했는지 확인
      if (newDisplayCount >= articles.length && articles.length < 100) {
        // 100개 이상이거나 새로운 기사가 없으면 종료
        setHasMore(false);
      }
      
    } catch (error) {
      console.error('더 많은 기사 로딩 실패:', error);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  // 카테고리와 검색에 따른 기사 필터링
  const getFilteredArticles = () => {
    let targetArticles = isSearchMode ? searchResults : articles;
    
    if (activeCategory !== "all") {
      targetArticles = targetArticles.filter(article => article.category === activeCategory);
    }
    
    return targetArticles.slice(0, displayCount);
  };

  const filteredArticles = getFilteredArticles();

  // 아티클 저장/해제 핸들러
  const handleArticleSave = (articleUrl: string, isSaved: boolean) => {
    if (isSaved) {
      setSavedArticleUrls(prev => new Set([...prev, articleUrl]));
    } else {
      setSavedArticleUrls(prev => {
        const newSet = new Set(prev);
        newSet.delete(articleUrl);
        return newSet;
      });
    }
  };

  return (
    <>
      {/* Search Results Info */}
      {isSearchMode && (
        <div className="text-center mb-6">
          {searchLoading ? (
            <div className="text-slate-600">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-600 mx-auto mb-2"></div>
              <p>검색 중...</p>
            </div>
          ) : (
            <p className="text-slate-600">
              검색 결과 {searchResults.length}개
            </p>
          )}
        </div>
      )}

      {/* Article Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {filteredArticles.map((article) => (
          <ArticleCard 
            key={article.id} 
            article={article} 
            isInitiallySaved={savedArticleUrls.has(article.url)}
            onUnsave={(url) => handleArticleSave(url, false)}
            onSave={(url) => handleArticleSave(url, true)}
          />
        ))}
      </div>

      {/* Load More Button - 검색 모드가 아닐 때만 표시 */}
      {!isSearchMode && (
        <div className="text-center mt-6">
          <Button 
            size="lg" 
            className="bg-[#DAA63E] hover:bg-[#C4953A] text-white px-12 py-3 disabled:opacity-50 disabled:cursor-not-allowed rounded-full"
            onClick={loadMoreArticles}
            disabled={loading || !hasMore}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                로딩 중...
              </>
            ) : hasMore ? (
              '더 많은 글 보기'
            ) : (
              '모든 글을 불러왔습니다'
            )}
          </Button>
        </div>
      )}

      {/* 검색 결과가 없을 때 */}
      {isSearchMode && !searchLoading && searchResults.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-500 text-lg">검색 결과가 없습니다.</p>
          <p className="text-slate-400 mt-2">다른 키워드로 검색해보세요.</p>
        </div>
      )}
    </>
  );
}
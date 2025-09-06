"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AnimatedStats } from "@/components/animated-stats";
import { ArticleList } from "@/components/article-list";
import { SearchBox } from "@/components/search-box";
import { Sidebar } from "@/components/sidebar";
import { KeywordsAnalysis } from "@/components/keywords-analysis";
import { AuthorsAnalysis } from "@/components/authors-analysis";
import { TrendingAnalysis } from "@/components/trending-analysis";
import { PlatformAnalysis } from "@/components/platform-analysis";
import { Article } from "@/types/article";
import { BookmarkCheck, Search, User } from "lucide-react";
function HomeContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [allArticles, setAllArticles] = useState<Article[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeTab, setActiveTab] = useState("home");
  const [cacheInfo, setCacheInfo] = useState<{fromCache: boolean, cacheAge?: number, lastUpdated?: string}>({fromCache: false});
  
  // URL에서 activeTab 초기화
  useEffect(() => {
    const tab = searchParams?.get('tab');
    if (tab && ['trending', 'keywords', 'authors', 'platforms'].includes(tab)) {
      setActiveTab(tab);
    } else {
      setActiveTab('home');
    }
  }, [searchParams]);

  // URL에서 category 초기화
  useEffect(() => {
    const category = searchParams?.get('category');
    if (category) {
      setActiveCategory(category);
    }
  }, [searchParams]);
  const [showHeaderSearch, setShowHeaderSearch] = useState(false);
  const mainSearchRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // 카테고리 변경 시 헤더 검색창 숨기기
    setShowHeaderSearch(false);
  }, [activeCategory]);

  useEffect(() => {
    // 페이지 클릭 시 검색창 숨기기
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      // 검색 아이콘이나 검색창 영역이 아닌 곳을 클릭했을 때만 숨기기
      if (!target.closest('.header-search') && !target.closest('.search-icon')) {
        setShowHeaderSearch(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    // 초기 데이터 로드
    const loadInitialData = async () => {
      try {
        // 기사 데이터 가져오기 - 직접 RSS 수집 함수 사용
        const response = await fetch('/api/feeds/all');
        const data = await response.json();
        
        if (data.success && data.articles) {
          // Date 문자열을 Date 객체로 변환
          const processedArticles = data.articles.map((article: Article) => ({
            ...article,
            publishedAt: new Date(article.publishedAt)
          }));
          setAllArticles(processedArticles);
          setCacheInfo({
            fromCache: data.fromCache || false,
            cacheAge: data.cacheAge,
            lastUpdated: data.lastUpdated
          });
          console.log(`${processedArticles.length}개 기사 로드 완료 ${data.fromCache ? `(캐시: ${data.cacheAge}시간 전)` : '(새로 수집)'}`);
        } else {
          console.log('기사 데이터를 가져올 수 없어서 mock 데이터 사용');
          // fallback to mock data
          try {
            const mockModule = await import('@/data/mock-data');
            const mockArticles = mockModule.getRecentArticles(12);
            setAllArticles(mockArticles);
          } catch (mockError) {
            console.error('Mock 데이터도 로드 실패:', mockError);
          }
        }
        
      } catch (error) {
        console.error('데이터 로딩 실패:', error);
        // 최종 fallback
        try {
          const mockModule = await import('@/data/mock-data');
          const mockArticles = mockModule.getRecentArticles(12);
          setAllArticles(mockArticles);
          console.log('Fallback mock 데이터 사용');
        } catch (mockError) {
          console.error('모든 데이터 로드 실패:', mockError);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  const handleSearchIconClick = () => {
    if (activeCategory === 'all' && activeTab === 'home') {
      // 메인 화면에서는 검색창으로 스크롤 이동
      mainSearchRef.current?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
      // 검색창에 포커스
      setTimeout(() => {
        const searchInput = mainSearchRef.current?.querySelector('input');
        searchInput?.focus();
      }, 300);
    } else if (['trending', 'keywords', 'authors', 'platforms'].includes(activeTab)) {
      // 인사이트 탭에서는 아무것도 하지 않음 (검색 불가)
      return;
    } else {
      // 다른 기술 카테고리에서는 헤더 검색창 토글
      const newShowState = !showHeaderSearch;
      setShowHeaderSearch(newShowState);
      
      // 검색창이 열릴 때 포커스
      if (newShowState) {
        setTimeout(() => {
          const headerSearchInput = document.querySelector('.header-search input') as HTMLInputElement;
          headerSearchInput?.focus();
        }, 100);
      }
    }
  };

  const handleStatClick = (statType: string) => {
    if (statType === 'events') {
      router.push('/events');
    } else {
      router.push(`/?tab=${statType}`);
    }
  };

  const handleLogoClick = () => {
    // 탭과 카테고리를 초기 상태로 리셋
    setActiveTab('home');
    setActiveCategory('all');
    
    // URL도 깨끗하게 초기화
    router.push('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategoryChange = (category: string) => {
    // 추천 서비스 페이지로 이동
    if (category === 'recommendations') {
      router.push('/recommendations');
      return;
    }
    
    setActiveCategory(category);
    // 인사이트 탭에 있을 때 카테고리를 변경하면 홈 탭으로 돌아가기
    if (['trending', 'keywords', 'authors', 'platforms'].includes(activeTab)) {
      router.push('/');
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "trending":
        return <TrendingAnalysis />;
      
      case "keywords":
        return <KeywordsAnalysis />;
      
      case "authors":
        return <AuthorsAnalysis />;
      
      case "platforms":
        return <PlatformAnalysis />;
      
      default:
        return null;
    }
  };
  

  return (
    <div className="min-h-screen bg-[#FAEFD9]">
      {/* Fixed Sidebar */}
      <Sidebar 
        activeCategory={activeCategory} 
        onCategoryChange={handleCategoryChange}
        onLogoClick={handleLogoClick}
      />

      {/* Main Content */}
      <div className="ml-64">
        {/* Header */}
        <header className="sticky top-0 z-50 w-full bg-[#FAEFD9]">
          <div className="px-6 py-2 flex items-center justify-end" style={{ minHeight: '56px' }}>
            <div className="flex items-center space-x-3">
                {/* 저장된 아티클 아이콘 */}
                <button 
                  className="p-2 rounded-lg hover:bg-white transition-all duration-200 text-gray-600 hover:text-[#DAA63E] disabled:opacity-50 disabled:cursor-not-allowed"
                  title={status === "authenticated" ? "저장한 아티클" : "로그인 후 사용 가능"}
                  disabled={status !== "authenticated"}
                  onClick={() => {
                    if (status === "authenticated") {
                      window.location.href = '/saved';
                    }
                  }}
                >
                  <BookmarkCheck className="w-5 h-5" />
                </button>
                
                {/* 검색 아이콘 */}
                <button 
                  className="p-2 rounded-lg hover:bg-white transition-all duration-200 text-gray-600 hover:text-[#DAA63E] search-icon"
                  title="검색"
                  onClick={handleSearchIconClick}
                >
                  <Search className="w-5 h-5" />
                </button>
                
                {status === "authenticated" ? (
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-600" />
                      <span className="text-sm text-gray-600">{session?.user?.name}</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      className="text-slate-600 hover:text-[#DAA63E] text-sm"
                      onClick={() => signOut()}
                    >
                      로그아웃
                    </Button>
                  </div>
                ) : (
                  <Button 
                    className="bg-[#DAA63E] hover:bg-[#C4953A] text-white border-0 rounded-full px-6 text-sm"
                    onClick={() => signIn('google')}
                  >
                    로그인
                  </Button>
                )}
            </div>
          </div>
        </header>

        {/* Header Search - 기술 카테고리에서만 표시 */}
        {showHeaderSearch && activeCategory !== 'all' && (
          <div className="bg-[#FAEFD9]/80 backdrop-blur-sm border-b border-[#DAA63E]/20 px-6 py-3 header-search">
            <div className="max-w-2xl mx-auto">
              <SearchBox 
                onSearch={handleSearch}
                onClear={handleClearSearch}
                initialQuery={searchQuery}
              />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="px-6 py-2">
          {/* 인사이트 탭들 */}
          {['trending', 'keywords', 'authors', 'platforms'].includes(activeTab) ? (
            <div className="py-8">
              {renderTabContent()}
            </div>
          ) : (
            /* 홈 탭 - 기본 아티클 리스트 */
            <>
              {/* Stats and Search Section - 전체 카테고리에서만 표시 */}
              {activeCategory === 'all' && (
                <div className="mb-4">
                  {/* Stats Section */}
                  <div className="text-center mb-3">
                    <AnimatedStats onStatClick={handleStatClick} />
                  </div>
                  

                  {/* Search Section */}
                  <div ref={mainSearchRef} className="text-center">
                    <div className="max-w-2xl mx-auto">
                      <SearchBox 
                        onSearch={handleSearch}
                        onClear={handleClearSearch}
                        initialQuery={searchQuery}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Article List */}
              <div className={activeCategory !== 'all' ? 'mt-6' : ''}>
                {isLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#DAA63E] mx-auto mb-4"></div>
                    <p className="text-slate-500">기사 데이터를 불러오는 중...</p>
                  </div>
                ) : (
                  <ArticleList 
                    initialArticles={allArticles}
                    searchQuery={searchQuery}
                    activeCategory={activeCategory}
                    onSearchStateChange={() => {}}
                  />
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAEFD9] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#DAA63E]"></div></div>}>
      <HomeContent />
    </Suspense>
  );
}

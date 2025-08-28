"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ArticleCard } from "@/components/article-card";
import { Article } from "@/types/article";
import { BookmarkCheck } from "lucide-react";
export default function SavedArticlesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [savedArticles, setSavedArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session) {
      router.push('/');
      return;
    }

    fetchSavedArticles();
  }, [session, status, router]);

  const fetchSavedArticles = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/articles/saved');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch saved articles');
      }

      setSavedArticles(data.articles || []);
    } catch (error) {
      console.error('Fetch saved articles error:', error);
      setError('저장된 아티클을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnsave = (articleUrl: string) => {
    // 저장 해제된 아티클을 목록에서 제거
    setSavedArticles(prev => prev.filter(article => article.url !== articleUrl));
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-[#FAEFD9] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#DAA63E] mx-auto mb-4"></div>
          <p className="text-slate-500">저장된 아티클을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#FAEFD9]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-center gap-3 mb-2">
            <BookmarkCheck className="w-8 h-8 text-[#DAA63E]" />
            <h1 className="text-3xl font-bold text-gray-900">저장한 아티클</h1>
          </div>
          <p className="text-gray-600">
            {session.user?.name}님이 저장한 IT 트렌드 아티클 모음
          </p>
          <div className="mt-4 text-sm text-gray-500">
            총 {savedArticles.length}개의 아티클
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {savedArticles.length === 0 ? (
          <div className="text-center py-16">
            <BookmarkCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-600 mb-2">
              저장된 아티클이 없습니다
            </h2>
            <p className="text-gray-500 mb-6">
              관심있는 아티클을 저장해서 나중에 다시 읽어보세요.
            </p>
            <button
              onClick={() => router.push('/')}
              className="bg-[#DAA63E] hover:bg-[#C4953A] text-white px-6 py-3 rounded-full transition-colors"
            >
              아티클 둘러보기
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedArticles.map((article) => (
              <ArticleCard 
                key={article.id} 
                article={article} 
                isInitiallySaved={true}
                onUnsave={handleUnsave}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
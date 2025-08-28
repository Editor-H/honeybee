"use client";

import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Hash, Target, Zap, Building2 } from "lucide-react";

interface KeywordData {
  keyword: string;
  frequency: number;
  marketScore: number;
  growth: number;
  platforms: Array<{ platform: string; count: number }>;
}

interface KeywordsData {
  totalArticles: number;
  totalKeywords: number;
  topKeywords: KeywordData[];
  categories: {
    [category: string]: KeywordData[];
  };
  trending: KeywordData[];
  emerging: KeywordData[];
}

export function KeywordsAnalysis() {
  const [data, setData] = useState<KeywordsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    fetchKeywordsData();
  }, []);

  const fetchKeywordsData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/insights/keywords');
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch keywords data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getMarketScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-blue-600 bg-blue-50';
    if (score >= 40) return 'text-yellow-600 bg-yellow-50';
    return 'text-gray-600 bg-gray-50';
  };

  const getMarketScoreLabel = (score: number) => {
    if (score >= 80) return '매우 높음';
    if (score >= 60) return '높음';
    if (score >= 40) return '보통';
    return '낮음';
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#DAA63E] mx-auto mb-4"></div>
          <p className="text-gray-500">키워드 분석 중...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-6xl mx-auto py-8">
        <div className="text-center py-12">
          <p className="text-gray-500">키워드 분석 데이터를 불러올 수 없습니다.</p>
        </div>
      </div>
    );
  }

  const categories = ['all', 'AI/ML', 'Frontend', 'Backend', 'Cloud/DevOps'];
  const displayKeywords = activeCategory === 'all' ? 
    data.topKeywords : 
    data.categories[activeCategory] || [];

  return (
    <div className="max-w-6xl mx-auto py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">🏷️ 키워드 분석</h2>
        <p className="text-gray-600">기술 키워드 트렌드와 출간 가치를 분석합니다</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <Hash className="w-8 h-8 text-[#DAA63E]" />
            <div>
              <div className="text-2xl font-bold text-gray-900">{data.totalKeywords}</div>
              <div className="text-sm text-gray-600">분석된 키워드</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <Building2 className="w-8 h-8 text-blue-600" />
            <div>
              <div className="text-2xl font-bold text-gray-900">{data.totalArticles}</div>
              <div className="text-sm text-gray-600">분석 아티클</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-green-600" />
            <div>
              <div className="text-2xl font-bold text-gray-900">{data.trending.length}</div>
              <div className="text-sm text-gray-600">급상승 키워드</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <Zap className="w-8 h-8 text-purple-600" />
            <div>
              <div className="text-2xl font-bold text-gray-900">{data.emerging.length}</div>
              <div className="text-sm text-gray-600">고가치 키워드</div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === category
                  ? 'bg-[#DAA63E] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {category === 'all' ? '전체' : category}
              <span className="ml-2 text-xs opacity-75">
                ({category === 'all' ? data.topKeywords.length : (data.categories[category]?.length || 0)})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Keywords Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">
            {activeCategory === 'all' ? '전체 키워드' : `${activeCategory} 키워드`}
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({displayKeywords.length}개)
            </span>
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">순위</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">키워드</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">언급 빈도</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">시장성 점수</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">성장세</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">주요 플랫폼</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {displayKeywords.map((keyword, index) => (
                <tr key={keyword.keyword} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{keyword.keyword}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{keyword.frequency}회</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getMarketScoreColor(keyword.marketScore)}`}>
                      {keyword.marketScore}점 ({getMarketScoreLabel(keyword.marketScore)})
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`flex items-center gap-1 text-sm ${
                      keyword.growth > 0 ? 'text-green-600' : keyword.growth < 0 ? 'text-red-600' : 'text-gray-500'
                    }`}>
                      {keyword.growth > 0 ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : keyword.growth < 0 ? (
                        <TrendingDown className="w-4 h-4" />
                      ) : (
                        <div className="w-4 h-4" />
                      )}
                      {keyword.growth > 0 ? '+' : ''}{keyword.growth}%
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {keyword.platforms.map((platform, idx) => (
                        <span key={idx} className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                          {platform.platform.replace(' 기술블로그', '').replace('NAVER ', '')} ({platform.count})
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {displayKeywords.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            {activeCategory} 카테고리에서 키워드를 찾을 수 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}
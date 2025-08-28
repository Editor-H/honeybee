"use client";

import { useState, useEffect } from "react";
import { Users, Star, Zap, Building2, Target, TrendingUp } from "lucide-react";

interface AuthorData {
  name: string;
  platform: string;
  articleCount: number;
  totalEngagement: number;
  averageEngagement: number;
  specialties: string[];
  recentActivity: number;
  influenceScore: number;
  potentialScore: number;
}

interface AuthorsData {
  totalAuthors: number;
  totalArticles: number;
  topInfluencers: AuthorData[];
  potentialAuthors: AuthorData[];
  activeWriters: AuthorData[];
  platformLeaders: { [platform: string]: AuthorData[] };
  specialtyLeaders: { [specialty: string]: AuthorData[] };
  stats: {
    avgInfluenceScore: number;
    avgPotentialScore: number;
    topPlatforms: string[];
  };
}

export function AuthorsAnalysis() {
  const [data, setData] = useState<AuthorsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('influencers');

  useEffect(() => {
    fetchAuthorsData();
  }, []);

  const fetchAuthorsData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/insights/authors');
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch authors data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-blue-600 bg-blue-50';
    if (score >= 40) return 'text-yellow-600 bg-yellow-50';
    return 'text-gray-600 bg-gray-50';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'S급';
    if (score >= 60) return 'A급';
    if (score >= 40) return 'B급';
    return 'C급';
  };

  const getPlatformColor = (platform: string) => {
    const colors: { [key: string]: string } = {
      '토스 기술블로그': 'bg-blue-100 text-blue-800',
      '카카오 기술블로그': 'bg-yellow-100 text-yellow-800',
      '네이버 D2': 'bg-green-100 text-green-800',
      '우아한형제들': 'bg-purple-100 text-purple-800',
      '당근마켓 기술블로그': 'bg-orange-100 text-orange-800',
      'Medium': 'bg-gray-100 text-gray-800'
    };
    return colors[platform] || 'bg-gray-100 text-gray-600';
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#DAA63E] mx-auto mb-4"></div>
          <p className="text-gray-500">작가 분석 중...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-6xl mx-auto py-8">
        <div className="text-center py-12">
          <p className="text-gray-500">작가 분석 데이터를 불러올 수 없습니다.</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'influencers', name: '톱 인플루언서', icon: Star, data: data.topInfluencers },
    { id: 'potential', name: '잠재 저자', icon: Target, data: data.potentialAuthors },
    { id: 'active', name: '활발한 작가', icon: TrendingUp, data: data.activeWriters }
  ];

  const activeTabData = tabs.find(tab => tab.id === activeTab)?.data || [];

  return (
    <div className="max-w-6xl mx-auto py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">✍️ 작가 & 인플루언서 분석</h2>
        <p className="text-gray-600">핵심 인플루언서와 잠재적 저자를 발굴하세요</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-[#DAA63E]" />
            <div>
              <div className="text-2xl font-bold text-gray-900">{data.totalAuthors}</div>
              <div className="text-sm text-gray-600">분석된 작가</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <Building2 className="w-8 h-8 text-blue-600" />
            <div>
              <div className="text-2xl font-bold text-gray-900">{data.stats.topPlatforms.length}</div>
              <div className="text-sm text-gray-600">주요 플랫폼</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <Star className="w-8 h-8 text-green-600" />
            <div>
              <div className="text-2xl font-bold text-gray-900">{data.stats.avgInfluenceScore}</div>
              <div className="text-sm text-gray-600">평균 영향력 점수</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <Target className="w-8 h-8 text-purple-600" />
            <div>
              <div className="text-2xl font-bold text-gray-900">{data.stats.avgPotentialScore}</div>
              <div className="text-sm text-gray-600">평균 저자 가능성</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-[#DAA63E] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <IconComponent className="w-4 h-4" />
                {tab.name}
                <span className="text-xs opacity-75">({tab.data.length})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Authors List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">
            {tabs.find(tab => tab.id === activeTab)?.name}
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({activeTabData.length}명)
            </span>
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">순위</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">작가명</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">플랫폼</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">글 수</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">영향력</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {activeTab === 'potential' ? '저자 가능성' : '최근 활동'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">전문 분야</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {activeTabData.map((author, index) => (
                <tr key={`${author.name}-${author.platform}`} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{author.name}</div>
                    <div className="text-sm text-gray-500">
                      평균 {author.averageEngagement.toLocaleString()} 참여도
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPlatformColor(author.platform)}`}>
                      {author.platform.replace(' 기술블로그', '').replace('NAVER ', '')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {author.articleCount}개
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getScoreColor(author.influenceScore)}`}>
                      {author.influenceScore}점 ({getScoreLabel(author.influenceScore)})
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      getScoreColor(activeTab === 'potential' ? author.potentialScore : author.recentActivity)
                    }`}>
                      {activeTab === 'potential' ? author.potentialScore : author.recentActivity}점
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {author.specialties.map((specialty, idx) => (
                        <span key={idx} className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {activeTabData.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            해당 카테고리에서 작가를 찾을 수 없습니다.
          </div>
        )}
      </div>

      {/* Platform Leaders Section */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">플랫폼별 핵심 인플루언서</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.stats.topPlatforms.slice(0, 6).map(platform => (
            <div key={platform} className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Building2 className="w-5 h-5 text-gray-600" />
                <h4 className="font-medium text-gray-900">
                  {platform.replace(' 기술블로그', '').replace('NAVER ', '')}
                </h4>
              </div>
              <div className="space-y-2">
                {(data.platformLeaders[platform] || []).slice(0, 3).map((author, idx) => (
                  <div key={idx} className="flex justify-between items-center text-sm">
                    <span className="text-gray-700">{author.name}</span>
                    <span className="text-gray-500">{author.influenceScore}점</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
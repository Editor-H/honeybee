"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Building2, TrendingUp, Video, FileText, Clock, ArrowLeft, Activity } from 'lucide-react';
import Link from 'next/link';

interface PlatformData {
  name: string;
  totalArticles: number;
  recentArticles: number;
  videoCount: number;
  textCount: number;
  avgViewCount: number;
  topTags: string[];
  lastArticle?: string;
  productivity: string;
}

interface PlatformAnalysisData {
  platforms: PlatformData[];
  overview: {
    totalPlatforms: number;
    activePlatforms: number;
    totalArticles: number;
    totalVideos: number;
    mostActiveplatform: string;
    avgArticlesPerPlatform: number;
  };
  activityPattern: {
    hourlyDistribution: number[];
    peakHour: number;
    peakHourLabel: string;
  };
  lastUpdated: string;
  analysisDate: string;
  totalAnalyzedArticles: number;
}

const PRODUCTIVITY_COLORS = {
  '높음': '#10B981',
  '보통': '#F59E0B', 
  '낮음': '#EF4444'
};

export default function PlatformAnalysisPage() {
  const [data, setData] = useState<PlatformAnalysisData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlatformData = async () => {
      try {
        const response = await fetch('/api/analytics/platform');
        const result = await response.json();
        
        if (result.success) {
          setData(result.data);
        }
      } catch (error) {
        console.error('플랫폼 분석 데이터 로드 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlatformData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">플랫폼 분석</h1>
          <p className="text-gray-600">분석 데이터를 불러올 수 없습니다.</p>
          <Link href="/">
            <Button className="mt-4 bg-[#DAA63E] hover:bg-[#B8941F] text-white">
              홈으로 돌아가기
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // 활동 패턴을 위한 시간대 라벨
  const hourlyData = data.activityPattern.hourlyDistribution.map((count, hour) => ({
    hour: `${hour}시`,
    count
  }));

  // 플랫폼별 아티클 수 차트 데이터
  const platformChartData = data.platforms.slice(0, 10).map(platform => ({
    name: platform.name.length > 15 ? platform.name.substring(0, 15) + '...' : platform.name,
    총아티클: platform.totalArticles,
    최근7일: platform.recentArticles,
    영상: platform.videoCount,
    텍스트: platform.textCount
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="hover:bg-gray-100">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  홈으로
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <Building2 className="w-8 h-8 text-[#DAA63E]" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">플랫폼 분석</h1>
                  <p className="text-sm text-gray-600">
                    {data.analysisDate} 기준 · 마지막 업데이트: {new Date(data.lastUpdated).toLocaleString('ko-KR')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-8">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-l-4 border-l-[#DAA63E]">
            <CardHeader className="pb-3">
              <CardDescription>총 플랫폼</CardDescription>
              <CardTitle className="text-3xl text-[#DAA63E]">
                {data.overview.totalPlatforms}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-3">
              <CardDescription>활성 플랫폼</CardDescription>
              <CardTitle className="text-3xl text-green-600">
                {data.overview.activePlatforms}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <CardDescription>평균 아티클/플랫폼</CardDescription>
              <CardTitle className="text-3xl text-blue-600">
                {data.overview.avgArticlesPerPlatform}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="pb-3">
              <CardDescription>최다 발행 플랫폼</CardDescription>
              <CardTitle className="text-lg text-purple-600">
                {data.overview.mostActiveplatform}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Platform Articles Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#DAA63E]" />
                플랫폼별 아티클 현황
              </CardTitle>
              <CardDescription>
                총 아티클 수 vs 최근 7일 활동
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={platformChartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 10 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="총아티클" fill="#DAA63E" name="총 아티클" />
                  <Bar dataKey="최근7일" fill="#3B82F6" name="최근 7일" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Hourly Activity Pattern */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#DAA63E]" />
                시간대별 활동 패턴
              </CardTitle>
              <CardDescription>
                피크 시간: {data.activityPattern.peakHourLabel}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={hourlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="hour" 
                    tick={{ fontSize: 10 }}
                    interval={2}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#DAA63E" 
                    strokeWidth={2}
                    dot={{ fill: '#DAA63E', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Platform Details Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#DAA63E]" />
              플랫폼별 상세 분석
            </CardTitle>
            <CardDescription>
              각 플랫폼의 상세한 활동 현황 및 성과 지표
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {data.platforms.map((platform, index) => (
                <Card key={platform.name} className="border border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="text-sm font-medium text-gray-500">#{index + 1}</div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{platform.name}</h3>
                          <p className="text-sm text-gray-500">
                            {platform.lastArticle 
                              ? `마지막 발행: ${new Date(platform.lastArticle).toLocaleDateString('ko-KR')}`
                              : '발행 기록 없음'
                            }
                          </p>
                        </div>
                      </div>
                      <Badge 
                        className={`text-white`}
                        style={{ backgroundColor: PRODUCTIVITY_COLORS[platform.productivity as keyof typeof PRODUCTIVITY_COLORS] }}
                      >
                        {platform.productivity}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <div className="text-lg font-semibold text-gray-900">{platform.totalArticles}</div>
                        <div className="text-xs text-gray-600">총 아티클</div>
                      </div>
                      <div className="text-center p-2 bg-blue-50 rounded">
                        <div className="text-lg font-semibold text-blue-600">{platform.recentArticles}</div>
                        <div className="text-xs text-gray-600">최근 7일</div>
                      </div>
                      <div className="text-center p-2 bg-green-50 rounded flex flex-col items-center gap-1">
                        <div className="flex items-center gap-1">
                          <Video className="w-3 h-3 text-green-600" />
                          <span className="text-lg font-semibold text-green-600">{platform.videoCount}</span>
                        </div>
                        <div className="text-xs text-gray-600">영상</div>
                      </div>
                      <div className="text-center p-2 bg-amber-50 rounded flex flex-col items-center gap-1">
                        <div className="flex items-center gap-1">
                          <FileText className="w-3 h-3 text-amber-600" />
                          <span className="text-lg font-semibold text-amber-600">{platform.textCount}</span>
                        </div>
                        <div className="text-xs text-gray-600">텍스트</div>
                      </div>
                    </div>
                    
                    {/* Top Tags */}
                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-2">주요 태그</div>
                      <div className="flex flex-wrap gap-2">
                        {platform.topTags.slice(0, 5).map((tag, tagIndex) => (
                          <Badge 
                            key={tagIndex} 
                            variant="secondary" 
                            className="text-xs bg-gray-100 text-gray-700"
                          >
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
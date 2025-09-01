"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import dynamic from 'next/dynamic';

// Recharts를 dynamic import로 처리 (SSR 문제 해결)
const BarChart = dynamic(() => import('recharts').then((mod) => ({ default: mod.BarChart })), { ssr: false });
const Bar = dynamic(() => import('recharts').then((mod) => ({ default: mod.Bar })), { ssr: false });
const XAxis = dynamic(() => import('recharts').then((mod) => ({ default: mod.XAxis })), { ssr: false });
const YAxis = dynamic(() => import('recharts').then((mod) => ({ default: mod.YAxis })), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then((mod) => ({ default: mod.CartesianGrid })), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then((mod) => ({ default: mod.Tooltip })), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then((mod) => ({ default: mod.ResponsiveContainer })), { ssr: false });
const PieChart = dynamic(() => import('recharts').then((mod) => ({ default: mod.PieChart })), { ssr: false });
const Pie = dynamic(() => import('recharts').then((mod) => ({ default: mod.Pie })), { ssr: false });
const Cell = dynamic(() => import('recharts').then((mod) => ({ default: mod.Cell })), { ssr: false });
import { TrendingUp, Eye, Hash, Users, Calendar } from 'lucide-react';
import { ArticleCard } from '@/components/article-card';
import { Article } from '@/types/article';

interface TrendingData {
  trendingArticles: Article[];
  topTags: { tag: string; count: number }[];
  topPlatforms: { platform: string; count: number }[];
  totalArticles: number;
  recentArticles: number;
  contentTypeDistribution: { article: number; video: number };
  lastUpdated: string;
  period: string;
}

const COLORS = ['#DAA63E', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16'];

export function TrendingAnalysis() {
  const [data, setData] = useState<TrendingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchTrendingData = async () => {
      try {
        const response = await fetch('/api/analytics/trending');
        const result = await response.json();
        
        if (result.success) {
          // Date 문자열을 Date 객체로 변환
          const processedData = {
            ...result.data,
            trendingArticles: result.data.trendingArticles.map((article: Article) => ({
              ...article,
              publishedAt: new Date(article.publishedAt)
            }))
          };
          setData(processedData);
        }
      } catch (error) {
        console.error('❌ 트렌딩 데이터 로드 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingData();
  }, []);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mx-auto mb-4" />
          <div className="h-4 w-96 bg-gray-200 rounded animate-pulse mx-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">🔥 트렌딩 분석</h2>
        <p className="text-gray-600">분석 데이터를 불러올 수 없습니다.</p>
      </div>
    );
  }

  const contentTypeChartData = [
    { name: 'TEXT', value: data.contentTypeDistribution.article, color: '#DAA63E' },
    { name: 'VIDEO', value: data.contentTypeDistribution.video, color: '#3B82F6' }
  ];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <TrendingUp className="w-8 h-8 text-[#DAA63E]" />
          <h2 className="text-3xl font-bold text-gray-900">트렌딩 분석</h2>
        </div>
        <p className="text-gray-600 mb-2">
          {data.period} · 마지막 업데이트: {new Date(data.lastUpdated).toLocaleString('ko-KR')}
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="border-l-4 border-l-[#DAA63E]">
          <CardHeader className="pb-3">
            <CardDescription>총 아티클</CardDescription>
            <CardTitle className="text-3xl text-[#DAA63E]">
              {data.totalArticles.toLocaleString()}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              최근 7일
            </CardDescription>
            <CardTitle className="text-3xl text-blue-600">
              {data.recentArticles.toLocaleString()}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-3">
            <CardDescription>영상 콘텐츠</CardDescription>
            <CardTitle className="text-3xl text-green-600">
              {data.contentTypeDistribution.video}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-3">
            <CardDescription>인기 태그</CardDescription>
            <CardTitle className="text-3xl text-purple-600">
              {data.topTags.length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Top Tags Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Hash className="w-5 h-5 text-[#DAA63E]" />
              인기 태그 TOP 10
            </CardTitle>
            <CardDescription>
              가장 많이 사용된 태그들
            </CardDescription>
          </CardHeader>
          <CardContent>
            {mounted ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.topTags.slice(0, 10)} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="tag" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="count" fill="#DAA63E" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-[300px] flex items-center justify-center bg-gray-50 rounded">
                <div className="text-gray-500">차트 로딩 중...</div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Content Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-[#DAA63E]" />
              콘텐츠 타입 분포
            </CardTitle>
            <CardDescription>
              텍스트 vs 영상 콘텐츠 비율
            </CardDescription>
          </CardHeader>
          <CardContent>
            {mounted ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={contentTypeChartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {contentTypeChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-[300px] flex items-center justify-center bg-gray-50 rounded">
                <div className="text-gray-500">차트 로딩 중...</div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Platforms */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#DAA63E]" />
            활발한 플랫폼 TOP 10
          </CardTitle>
          <CardDescription>
            가장 많은 아티클을 발행하는 플랫폼들
          </CardDescription>
        </CardHeader>
        <CardContent>
          {mounted ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={data.topPlatforms.slice(0, 10)} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="platform" 
                  tick={{ fontSize: 12 }}
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
                <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-[400px] flex items-center justify-center bg-gray-50 rounded">
              <div className="text-gray-500">차트 로딩 중...</div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Trending Articles */}
      {data.trendingArticles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#DAA63E]" />
              트렌딩 아티클
            </CardTitle>
            <CardDescription>
              현재 주목받고 있는 인기 아티클들
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.trendingArticles.map((article, index) => (
                <div key={article.id} className="relative">
                  <div className="absolute -top-2 -left-2 z-10">
                    <Badge className="bg-[#DAA63E] text-white text-xs px-2 py-1 rounded-full">
                      #{index + 1}
                    </Badge>
                  </div>
                  <ArticleCard article={article} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
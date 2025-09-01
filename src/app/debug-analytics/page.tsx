"use client";

import { useState } from 'react';

export default function DebugAnalytics() {
  const [trendingData, setTrendingData] = useState<any>(null);
  const [platformData, setPlatformData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testTrending = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/analytics/trending');
      const data = await response.json();
      setTrendingData(data);
      console.log('🔥 Trending API Response:', data);
    } catch (error) {
      console.error('Trending API Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const testPlatform = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/analytics/platform');
      const data = await response.json();
      setPlatformData(data);
      console.log('🏢 Platform API Response:', data);
    } catch (error) {
      console.error('Platform API Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">분석 API 디버깅</h1>
      
      <div className="space-y-4">
        <button 
          onClick={testTrending}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? '로딩...' : '트렌딩 분석 테스트'}
        </button>
        
        <button 
          onClick={testPlatform}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 ml-4"
        >
          {loading ? '로딩...' : '플랫폼 분석 테스트'}
        </button>
      </div>

      {trendingData && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">트렌딩 분석 결과</h2>
          <div className="bg-gray-100 p-4 rounded">
            <p><strong>성공:</strong> {trendingData.success ? '✅' : '❌'}</p>
            <p><strong>총 아티클:</strong> {trendingData.data?.totalArticles || 'N/A'}</p>
            <p><strong>트렌딩 아티클:</strong> {trendingData.data?.trendingArticles?.length || 'N/A'}</p>
            <p><strong>인기 태그:</strong> {trendingData.data?.topTags?.length || 'N/A'}</p>
            <p><strong>플랫폼:</strong> {trendingData.data?.topPlatforms?.length || 'N/A'}</p>
          </div>
        </div>
      )}

      {platformData && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">플랫폼 분석 결과</h2>
          <div className="bg-gray-100 p-4 rounded">
            <p><strong>성공:</strong> {platformData.success ? '✅' : '❌'}</p>
            <p><strong>총 플랫폼:</strong> {platformData.data?.overview?.totalPlatforms || 'N/A'}</p>
            <p><strong>활성 플랫폼:</strong> {platformData.data?.overview?.activePlatforms || 'N/A'}</p>
            <p><strong>총 아티클:</strong> {platformData.data?.overview?.totalArticles || 'N/A'}</p>
            <p><strong>플랫폼 수:</strong> {platformData.data?.platforms?.length || 'N/A'}</p>
          </div>
        </div>
      )}
    </div>
  );
}
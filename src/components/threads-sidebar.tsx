"use client";

import { useState, useEffect } from "react";
import { RefreshCw, ExternalLink, MessageCircle, TrendingUp, Heart, Share2 } from "lucide-react";

interface MockThread {
  id: string;
  user: {
    name: string;
    username: string;
    avatar: string;
  };
  content: string;
  timestamp: string;
  likes: number;
  replies: number;
  shares: number;
  trending?: boolean;
}

export function ThreadsSidebar() {
  const [threads, setThreads] = useState<MockThread[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Threads AI 검색 URL - 사용자가 요청한 URL 사용
  const threadsUrl = "https://www.threads.net/search?q=AI%20Threads&serp_type=tags&tag_id=18406834975056806&hl=ko";

  // Mock AI 관련 Threads 데이터
  const mockThreads: MockThread[] = [
    {
      id: "1",
      user: {
        name: "AI Research Hub",
        username: "airesearch",
        avatar: "🤖"
      },
      content: "GPT-5 Codex가 공개되었습니다! 코드 리팩토링 성능이 17.4% 향상되고, 7시간 독립 작업이 가능해졌다고 하네요. 개발자들에게는 정말 혁신적인 도구가 될 것 같습니다.",
      timestamp: "2시간 전",
      likes: 234,
      replies: 45,
      shares: 67,
      trending: true
    },
    {
      id: "2",
      user: {
        name: "Tech Trends KR",
        username: "techtrends_kr",
        avatar: "💡"
      },
      content: "듀오링고의 AI-First 전략이 성공한 이유는? 개인 맞춤형 학습 경험부터 게임화 전략까지, 교육 플랫폼의 새로운 가능성을 보여주고 있습니다.",
      timestamp: "4시간 전",
      likes: 189,
      replies: 32,
      shares: 28
    },
    {
      id: "3",
      user: {
        name: "AI Developer",
        username: "ai_dev_community",
        avatar: "⚡"
      },
      content: "스타트업에서 AI 도입할 때 반드시 알아야 할 6단계 프로세스를 정리해봤습니다. 비즈니스 목표 설정부터 운영·고도화까지 실무 노하우 공유합니다!",
      timestamp: "6시간 전",
      likes: 156,
      replies: 23,
      shares: 41
    },
    {
      id: "4",
      user: {
        name: "Data Science Korea",
        username: "datascience_kr",
        avatar: "📊"
      },
      content: "JAX가 과학 컴퓨팅 분야에서 PDE 해결에 혁신을 가져오고 있습니다. 백프로파게이션을 넘어선 심볼릭 파워의 가능성을 탐구해보세요.",
      timestamp: "8시간 전",
      likes: 98,
      replies: 18,
      shares: 15
    },
    {
      id: "5",
      user: {
        name: "AI Ethics Forum",
        username: "ai_ethics",
        avatar: "🛡️"
      },
      content: "기업 데이터 보안을 위한 암호화 도입 전 체크리스트 6가지를 공유합니다. 해킹 방지와 고객정보 보호를 위한 필수 가이드입니다.",
      timestamp: "10시간 전",
      likes: 87,
      replies: 14,
      shares: 19
    }
  ];

  useEffect(() => {
    // Mock 데이터 로딩 시뮬레이션
    setTimeout(() => {
      setThreads(mockThreads);
      setIsLoading(false);
    }, 1500);
  }, []);

  const handleRefresh = () => {
    setIsLoading(true);
    // 새로고침 시뮬레이션
    setTimeout(() => {
      setThreads([...mockThreads].sort(() => Math.random() - 0.5));
      setIsLoading(false);
    }, 1000);
  };

  const openInNewTab = () => {
    window.open(threadsUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="w-80 h-screen bg-white border-l border-gray-200 flex flex-col fixed right-0 top-0 z-40">
      {/* 헤더 */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-xs font-bold">@</span>
          </div>
          <h3 className="text-sm font-semibold text-gray-800">AI Threads</h3>
        </div>
        
        <div className="flex items-center space-x-1">
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="p-1.5 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
            title="새로고침"
          >
            <RefreshCw 
              className={`w-4 h-4 text-gray-600 ${isLoading ? 'animate-spin' : ''}`} 
            />
          </button>
          
          <button
            onClick={openInNewTab}
            className="p-1.5 rounded-md hover:bg-gray-200 transition-colors"
            title="새 탭에서 열기"
          >
            <ExternalLink className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* 로딩 상태 */}
      {isLoading && (
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
            <p className="text-sm text-gray-500">Threads 로딩 중...</p>
          </div>
        </div>
      )}

      {/* Threads Feed */}
      {!isLoading && (
        <div className="flex-1 overflow-y-auto">
          <div className="p-2 space-y-3">
            {threads.map((thread) => (
              <div 
                key={thread.id} 
                className="bg-white border border-gray-100 rounded-lg p-3 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => window.open(threadsUrl, '_blank')}
              >
                {/* 사용자 정보 */}
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm">
                    {thread.user.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {thread.user.name}
                      </p>
                      {thread.trending && (
                        <TrendingUp className="w-3 h-3 text-orange-500" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500">@{thread.user.username}</p>
                  </div>
                  <span className="text-xs text-gray-400">{thread.timestamp}</span>
                </div>

                {/* 콘텐츠 */}
                <p className="text-sm text-gray-800 mb-3 leading-relaxed">
                  {thread.content}
                </p>

                {/* 액션 버튼들 */}
                <div className="flex items-center justify-between text-gray-500">
                  <div className="flex items-center space-x-4">
                    <button className="flex items-center space-x-1 hover:text-purple-600 transition-colors">
                      <Heart className="w-4 h-4" />
                      <span className="text-xs">{thread.likes}</span>
                    </button>
                    <button className="flex items-center space-x-1 hover:text-blue-600 transition-colors">
                      <MessageCircle className="w-4 h-4" />
                      <span className="text-xs">{thread.replies}</span>
                    </button>
                    <button className="flex items-center space-x-1 hover:text-green-600 transition-colors">
                      <Share2 className="w-4 h-4" />
                      <span className="text-xs">{thread.shares}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 하단 안내 */}
      <div className="p-3 bg-gray-50 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          AI 관련 Threads 시뮬레이션 • 
          <button 
            onClick={openInNewTab}
            className="text-purple-600 hover:text-purple-700 underline ml-1"
          >
            실제 피드 보기
          </button>
        </p>
      </div>

      {/* 반응형 스타일 */}
      <style jsx global>{`
        @media (max-width: 1280px) {
          .threads-sidebar {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
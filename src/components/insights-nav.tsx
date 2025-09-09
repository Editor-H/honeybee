"use client";

import { useState } from "react";
import { TrendingUp, Hash, Users, Building2, Home } from "lucide-react";

interface InsightsNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function InsightsNav({ activeTab, onTabChange }: InsightsNavProps) {
  const tabs = [
    { 
      id: "home", 
      name: "홈", 
      icon: Home,
      description: "전체 아티클 보기"
    },
    { 
      id: "trending", 
      name: "트렌딩", 
      icon: TrendingUp,
      description: "급상승 키워드 & 인기 아티클"
    },
    { 
      id: "keywords", 
      name: "키워드", 
      icon: Hash,
      description: "기술 키워드 분석 & 시장성 평가"
    },
    { 
      id: "authors", 
      name: "작가", 
      icon: Users,
      description: "핵심 인플루언서 & 잠재 저자 발굴"
    },
    { 
      id: "platforms", 
      name: "플랫폼", 
      icon: Building2,
      description: "기업별 기술 트렌드 비교"
    }
  ];

  return (
    <div className="bg-white border-b border-gray-200 sticky top-[72px] z-40">
      <div className="max-w-full overflow-x-auto">
        <div className="flex min-w-max px-6">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`
                  group flex items-center gap-3 px-5 py-4 border-b-2 transition-all duration-200 whitespace-nowrap
                  ${isActive 
                    ? 'border-[#DAA63E] text-[#DAA63E] bg-[#DAA63E]/5' 
                    : 'border-transparent text-gray-600 hover:text-[#DAA63E] hover:border-gray-300'
                  }
                `}
                title={tab.description}
              >
                <IconComponent className={`w-5 h-5 ${isActive ? 'text-[#DAA63E]' : 'text-gray-500 group-hover:text-[#DAA63E]'}`} />
                <span className="font-medium text-base">{tab.name}</span>
                {tab.id === "trending" && (
                  <span className="ml-1 px-1.5 py-0.5 bg-red-100 text-red-600 text-xs rounded-full font-semibold">
                    HOT
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
      
      {/* 설명 텍스트 */}
      {activeTab !== "home" && (
        <div className="px-6 py-2 bg-gray-50 text-xs text-gray-600 border-b">
          {tabs.find(tab => tab.id === activeTab)?.description}
        </div>
      )}
    </div>
  );
}
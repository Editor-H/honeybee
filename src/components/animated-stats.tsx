"use client";

import { TrendingUp, Star, User, Globe } from "lucide-react";
import { mockDashboardStats } from "@/data/mock-data";

interface AnimatedStatsProps {
  onStatClick: (statType: string) => void;
}

const getStatConfig = (stats: typeof mockDashboardStats) => [
  {
    icon: TrendingUp,
    value: stats.hotArticles,
    label: "트렌딩",
    type: "trending"
  },
  {
    icon: Star,
    value: stats.hotKeywords,
    label: "키워드",
    type: "keywords"
  },
  {
    icon: User,
    value: stats.notableAuthors,
    label: "작가",
    type: "authors"
  },
  {
    icon: Globe,
    value: stats.newPlatforms,
    label: "플랫폼",
    type: "platforms"
  }
];

export function AnimatedStats({ onStatClick }: AnimatedStatsProps) {
  const stats = getStatConfig(mockDashboardStats);
  
  return (
    <div className="grid grid-cols-4 gap-4 max-w-md mx-auto mb-6">
      {stats.map((stat, index) => (
        <div
          key={index}
          onClick={() => onStatClick(stat.type)}
          className="group hover:bg-white rounded-lg px-4 py-3 transition-all duration-200 cursor-pointer border border-transparent hover:border-gray-200"
        >
          <div className="flex flex-col items-center text-center">
            <stat.icon className="w-5 h-5 text-[#DAA63E] mb-2 group-hover:scale-110 transition-transform" />
            <div className="text-lg font-semibold text-gray-900 mb-1">
              {stat.value}
            </div>
            <div className="text-xs text-gray-600 font-medium">{stat.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
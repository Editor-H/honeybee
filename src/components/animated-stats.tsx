"use client";

import { motion } from "framer-motion";
import { TrendingUp, Star, User, Globe } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { mockDashboardStats } from "@/data/mock-data";

const getStatConfig = (stats: typeof mockDashboardStats) => [
  {
    icon: TrendingUp,
    value: stats.hotArticles,
    label: "핫한 글",
    color: "from-yellow-100 to-amber-100",
    iconColor: "text-yellow-600"
  },
  {
    icon: Star,
    value: stats.hotKeywords,
    label: "핫한 키워드",
    color: "from-amber-100 to-orange-100",
    iconColor: "text-amber-600"
  },
  {
    icon: User,
    value: stats.notableAuthors,
    label: "주목할 작가",
    color: "from-orange-100 to-red-100",
    iconColor: "text-orange-600"
  },
  {
    icon: Globe,
    value: stats.newPlatforms,
    label: "새 플랫폼",
    color: "from-red-100 to-pink-100",
    iconColor: "text-red-600"
  }
];

export function AnimatedStats() {
  const stats = getStatConfig(mockDashboardStats);
  
  return (
    <div className="grid grid-cols-4 gap-3 max-w-lg mx-auto mb-2">
      {stats.map((stat, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, duration: 0.5 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Card className="group hover:shadow-md transition-all duration-300 border-0 bg-white/70 backdrop-blur-sm hover:bg-white cursor-pointer">
            <CardContent className="flex flex-col items-center py-1 px-1">
              <motion.div 
                className={`w-8 h-8 bg-gradient-to-br ${stat.color} rounded-full flex items-center justify-center group-hover:scale-110 transition-transform`}
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <stat.icon className={`w-4 h-4 ${stat.iconColor}`} />
              </motion.div>
              <motion.div 
                className="text-lg font-bold text-slate-900"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.1 + 0.3 }}
              >
                {stat.value}
              </motion.div>
              <div className="text-xs text-slate-600 font-medium text-center leading-tight">{stat.label}</div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
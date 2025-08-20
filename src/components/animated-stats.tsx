"use client";

import { motion } from "framer-motion";
import { TrendingUp, Star, User, Globe } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const stats = [
  {
    icon: TrendingUp,
    value: 15,
    label: "핫한 글",
    color: "from-red-100 to-pink-100",
    iconColor: "text-red-600"
  },
  {
    icon: Star,
    value: 32,
    label: "핫한 키워드",
    color: "from-blue-100 to-indigo-100",
    iconColor: "text-blue-600"
  },
  {
    icon: User,
    value: 8,
    label: "주목할 작가",
    color: "from-green-100 to-emerald-100",
    iconColor: "text-green-600"
  },
  {
    icon: Globe,
    value: 3,
    label: "새 플랫폼",
    color: "from-purple-100 to-violet-100",
    iconColor: "text-purple-600"
  }
];

export function AnimatedStats() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
      {stats.map((stat, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, duration: 0.5 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm hover:bg-white cursor-pointer">
            <CardContent className="flex flex-col items-center p-6">
              <motion.div 
                className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
              </motion.div>
              <motion.div 
                className="text-2xl font-bold text-slate-900 mb-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.1 + 0.3 }}
              >
                {stat.value}
              </motion.div>
              <div className="text-sm text-slate-600">{stat.label}</div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
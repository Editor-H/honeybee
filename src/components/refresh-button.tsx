"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function RefreshButton() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();

  const handleRefresh = async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    
    try {
      const response = await fetch('/api/feeds/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (data.success) {
        // 페이지 새로고침으로 업데이트된 데이터 표시
        router.refresh();
        
        // 성공 알림 (선택사항)
        alert(`${data.articlesCount}개의 새로운 기사가 업데이트되었습니다!`);
      } else {
        alert('업데이트에 실패했습니다: ' + data.message);
      }
    } catch (error) {
      console.error('새로고침 실패:', error);
      alert('업데이트 중 오류가 발생했습니다.');
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleRefresh}
      disabled={isRefreshing}
      className="text-xs text-slate-500 hover:text-slate-700 px-2 py-1"
    >
      <RefreshCw 
        className={`w-3 h-3 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} 
      />
      {isRefreshing ? '업데이트 중...' : '지금 업데이트'}
    </Button>
  );
}
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
      // 강제 새로고침 파라미터를 사용하여 최신 데이터 요청
      const response = await fetch('/api/feeds/all?refresh=true');
      const data = await response.json();
      
      if (data.success) {
        // 페이지 새로고침으로 업데이트된 데이터 표시
        window.location.reload();
        
        // 성공 알림은 새로고침 후 사라지므로 콘솔에만 로그
        console.log(`✅ ${data.totalArticles}개의 최신 기사가 업데이트되었습니다!`);
      } else {
        alert('업데이트에 실패했습니다: ' + data.error);
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
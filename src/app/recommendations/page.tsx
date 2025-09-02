"use client";

import { useRouter } from "next/navigation";
import { ExternalLink, Globe, Mail, DollarSign, Zap } from "lucide-react";
import { Sidebar } from "@/components/sidebar";

interface ServiceCardProps {
  title: string;
  description: string;
  url: string;
  category: string;
  icon: React.ReactNode;
  categoryColor: string;
}

function ServiceCard({ title, description, url, category, icon, categoryColor }: ServiceCardProps) {
  const handleClick = () => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg hover:border-[#DAA63E] transition-all duration-300 cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${categoryColor}`}>
            {icon}
          </div>
          <div>
            <h3 className="font-semibold text-lg text-gray-900 group-hover:text-[#DAA63E] transition-colors">
              {title}
            </h3>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {category}
            </span>
          </div>
        </div>
        <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-[#DAA63E] transition-colors" />
      </div>
      
      <p className="text-gray-600 text-sm leading-relaxed">
        {description}
      </p>
      
      <div className="mt-4 text-xs text-gray-400 truncate">
        {url}
      </div>
    </div>
  );
}

export default function RecommendationsPage() {
  const router = useRouter();
  const activeCategory = "recommendations";

  const handleCategoryChange = (category: string) => {
    // 추천 서비스에서 다른 카테고리로 이동
    if (category === 'recommendations') {
      return; // 현재 페이지이므로 아무것도 하지 않음
    }
    
    // 다른 카테고리 선택 시 홈으로 이동하고 카테고리 설정
    router.push(`/?category=${category}`);
  };

  const handleLogoClick = () => {
    router.push('/');
  };

  const services = [
    {
      title: "코드너리",
      description: "최신 기술 뉴스와 개발 트렌드를 한눈에 볼 수 있는 국내 대표 테크 뉴스 플랫폼입니다. IT 기획자들이 시장 동향을 파악하는 데 필수적인 정보를 제공합니다.",
      url: "https://www.codenary.co.kr/latest-news",
      category: "국내 서비스",
      icon: <Globe className="w-4 h-4 text-white" />,
      categoryColor: "bg-blue-500"
    },
    {
      title: "바이라인네트워크",
      description: "IT 산업의 심층 분석과 인사이트를 제공하는 무료 구독 서비스입니다. 기업 IT 동향과 정책 변화를 체계적으로 추적할 수 있습니다.",
      url: "https://us18.campaign-archive.com/home/?u=bedb3ad13e513e25afa719b73&id=81db217913",
      category: "구독 서비스",
      icon: <Mail className="w-4 h-4 text-white" />,
      categoryColor: "bg-green-500"
    },
    {
      title: "PricePerToken",
      description: "다양한 LLM API의 가격 데이터를 비교 분석할 수 있는 도구입니다. AI 서비스 기획 시 성능뿐만 아니라 비용까지 고려한 의사결정을 도와줍니다.",
      url: "https://pricepertoken.com/",
      category: "개발 도구",
      icon: <DollarSign className="w-4 h-4 text-white" />,
      categoryColor: "bg-purple-500"
    },
    {
      title: "Boosterr",
      description: "현재 사용 가능한 모든 AI 툴을 활용 분야별로 체계적으로 정리한 디렉토리입니다. 어떤 AI 툴을 언제 어디에 사용할지 한눈에 파악할 수 있습니다.",
      url: "https://www.boosterr.co/",
      category: "개발 도구",
      icon: <Zap className="w-4 h-4 text-white" />,
      categoryColor: "bg-orange-500"
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAEFD9]">
      {/* Fixed Sidebar */}
      <Sidebar 
        activeCategory={activeCategory} 
        onCategoryChange={handleCategoryChange}
        onLogoClick={handleLogoClick}
      />

      {/* Main Content */}
      <div className="ml-64">
        {/* Header */}
        <header className="sticky top-0 z-50 w-full bg-[#FAEFD9] border-b border-gray-200">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-bold text-[#DAA63E]">추천 서비스</h1>
            <p className="text-gray-600 mt-1">IT 기획자들을 위한 유용한 서비스와 도구들을 모았습니다</p>
          </div>
        </header>

        {/* Main Content */}
        <main className="px-6 py-8">
          <div className="max-w-6xl mx-auto">
            {/* 설명 섹션 */}
            <div className="bg-white rounded-lg p-6 mb-8 border border-gray-200">
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-6 h-6 bg-[#DAA63E] rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">💡</span>
                </div>
                <h2 className="text-lg font-semibold text-gray-900">기획자를 위한 필수 도구</h2>
              </div>
              <p className="text-gray-600 leading-relaxed">
                IT 기획 업무에 도움이 되는 검증된 서비스들입니다. 
                최신 기술 동향부터 AI 도구 비교, 비용 분석까지 - 
                더 나은 기획 의사결정을 위한 정보를 한곳에서 만나보세요.
              </p>
            </div>

            {/* 서비스 카드 그리드 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {services.map((service, index) => (
                <ServiceCard
                  key={index}
                  title={service.title}
                  description={service.description}
                  url={service.url}
                  category={service.category}
                  icon={service.icon}
                  categoryColor={service.categoryColor}
                />
              ))}
            </div>

            {/* 추가 정보 섹션 */}
            <div className="mt-12 bg-gradient-to-r from-[#DAA63E]/10 to-[#DAA63E]/5 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-[#DAA63E] mb-3">
                더 많은 서비스가 추가될 예정입니다
              </h3>
              <p className="text-gray-600">
                추천하고 싶은 유용한 서비스가 있다면 언제든지 제안해 주세요. 
                IT 기획자 커뮤니티를 위해 지속적으로 유용한 도구들을 발굴하여 추가하겠습니다.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
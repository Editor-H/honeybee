"use client";

import { useState } from "react";
import React from "react";
import { ChevronRight } from "lucide-react";

interface SidebarProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  onLogoClick?: () => void;
}

export function Sidebar({ activeCategory, onCategoryChange, onLogoClick }: SidebarProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const categories = [
    { 
      id: "all", 
      name: "전체", 
      subcategories: [] 
    },
    { 
      id: "frontend", 
      name: "프론트엔드", 
      subcategories: [
        { id: "react", name: "React" },
        { id: "vue", name: "Vue.js" },
        { id: "angular", name: "Angular" },
        { id: "javascript", name: "JavaScript" }
      ]
    },
    { 
      id: "backend", 
      name: "백엔드", 
      subcategories: [
        { id: "nodejs", name: "Node.js" },
        { id: "python", name: "Python" },
        { id: "java", name: "Java" },
        { id: "golang", name: "Go" }
      ]
    },
    { 
      id: "ai", 
      name: "AI/ML", 
      subcategories: [
        { id: "machine-learning", name: "머신러닝" },
        { id: "deep-learning", name: "딥러닝" },
        { id: "nlp", name: "자연어처리" },
        { id: "computer-vision", name: "컴퓨터 비전" }
      ]
    },
    { 
      id: "cloud", 
      name: "클라우드", 
      subcategories: [
        { id: "aws", name: "AWS" },
        { id: "azure", name: "Azure" },
        { id: "gcp", name: "Google Cloud" },
        { id: "kubernetes", name: "Kubernetes" }
      ]
    },
    { 
      id: "mobile", 
      name: "모바일", 
      subcategories: [
        { id: "ios", name: "iOS" },
        { id: "android", name: "Android" },
        { id: "react-native", name: "React Native" },
        { id: "flutter", name: "Flutter" }
      ]
    },
    { 
      id: "data", 
      name: "데이터", 
      subcategories: [
        { id: "analytics", name: "데이터 분석" },
        { id: "database", name: "데이터베이스" },
        { id: "bigdata", name: "빅데이터" },
        { id: "visualization", name: "데이터 시각화" }
      ]
    },
    { 
      id: "design", 
      name: "UX/UI", 
      subcategories: [
        { id: "ui-design", name: "UI 디자인" },
        { id: "ux-research", name: "UX 리서치" },
        { id: "prototyping", name: "프로토타이핑" },
        { id: "design-system", name: "디자인 시스템" }
      ]
    },
    { 
      id: "product", 
      name: "프로덕트", 
      subcategories: [
        { id: "product-management", name: "프로덕트 매니지먼트" },
        { id: "product-strategy", name: "프로덕트 전략" },
        { id: "service-planning", name: "서비스 기획" },
        { id: "growth-hacking", name: "그로스 해킹" }
      ]
    },
    { 
      id: "game", 
      name: "게임", 
      subcategories: [
        { id: "unity", name: "Unity" },
        { id: "unreal", name: "Unreal Engine" },
        { id: "game-dev", name: "게임 개발" },
        { id: "game-design", name: "게임 디자인" }
      ]
    },
    { 
      id: "graphics", 
      name: "그래픽", 
      subcategories: [
        { id: "webgl", name: "WebGL" },
        { id: "threejs", name: "Three.js" },
        { id: "computer-graphics", name: "컴퓨터 그래픽스" },
        { id: "shader", name: "셰이더" }
      ]
    },
    { 
      id: "docs", 
      name: "기술 문서", 
      subcategories: [
        { id: "cloud-docs", name: "클라우드" },
        { id: "language-docs", name: "언어/프레임워크" },
        { id: "database-docs", name: "데이터베이스" },
        { id: "tools-docs", name: "개발도구" }
      ]
    },
    { 
      id: "recommendations", 
      name: "추천 서비스", 
      subcategories: []
    },
  ];

  const handleCategoryClick = (categoryId: string, hasSubcategories: boolean) => {
    if (hasSubcategories) {
      // 하위 카테고리가 있는 경우: 확장/축소 토글
      setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
      // 메인 카테고리 자체도 선택
      onCategoryChange(categoryId);
    } else {
      // 하위 카테고리가 없는 경우 (전체): 바로 선택
      onCategoryChange(categoryId);
      setExpandedCategory(null); // 다른 카테고리 확장 해제
    }
  };

  const handleSubcategoryClick = (subcategoryId: string) => {
    onCategoryChange(subcategoryId);
  };

  // 하위 카테고리가 선택된 경우 해당 메인 카테고리를 자동으로 확장
  React.useEffect(() => {
    const selectedMainCategory = categories.find(cat => 
      cat.subcategories.some(sub => sub.id === activeCategory)
    );
    if (selectedMainCategory) {
      setExpandedCategory(selectedMainCategory.id);
    }
  }, [activeCategory]);

  return (
    <div className="w-64 bg-[#FAEFD9] h-screen fixed left-0 top-0 overflow-y-auto flex flex-col">
      <div className="px-6 pt-2 pb-4">
        <div 
          className="flex items-center gap-3 mb-2 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => {
            if (onLogoClick) {
              onLogoClick();
            } else {
              onCategoryChange('all');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
          style={{ minHeight: '56px' }}
        >
          {/* H Logo */}
          <div className="w-10 h-10 bg-[#DAA63E] rounded-full flex items-center justify-center relative">
            <div className="text-white font-bold text-lg">H</div>
            {/* 벌 모양 장식 - 작은 원들 */}
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#DAA63E] rounded-full border-2 border-white"></div>
          </div>
          <div>
            <h1 className="text-xl font-serif text-[#DAA63E]">HoneyBee</h1>
          </div>
        </div>
      </div>
      
      {/* 검색창 높이만큼 여백 추가 */}
      <div className="h-16"></div>
      
      <nav className="px-6 space-y-2 flex-1 overflow-y-auto pb-6">
        {categories.map((category) => (
          <div key={category.id} className="space-y-1">
            {/* Main Category */}
            <div
              className={`
                w-full rounded-full border px-3 py-2 text-center transition-all duration-200 cursor-pointer
                ${activeCategory === category.id || (category.subcategories.some(sub => sub.id === activeCategory))
                  ? 'bg-[#DAA63E] text-white border-[#DAA63E]'
                  : 'bg-[#FAEFD9] text-gray-700 border-gray-300 hover:border-[#DAA63E] hover:text-[#DAA63E]'
                }
              `}
              onClick={() => handleCategoryClick(category.id, category.subcategories.length > 0)}
            >
              <div className="flex items-center justify-center gap-1">
                <span className="text-sm font-medium">{category.name}</span>
                {category.subcategories.length > 0 && (activeCategory === category.id || category.subcategories.some(sub => sub.id === activeCategory)) && (
                  <ChevronRight 
                    className={`w-3 h-3 transition-transform ${
                      expandedCategory === category.id ? 'rotate-90' : ''
                    }`}
                  />
                )}
              </div>
            </div>

            {/* Subcategories */}
            {category.subcategories.length > 0 && expandedCategory === category.id && (
              <div className="ml-3 space-y-1">
                {category.subcategories.map((subcategory) => (
                  <div
                    key={subcategory.id}
                    className="flex items-center gap-1"
                  >
                    <div className="w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center bg-[#FAEFD9]">
                      <ChevronRight className="w-2 h-2 text-gray-400" />
                    </div>
                    <div
                      className={`
                        flex-1 rounded-full border px-2 py-1 text-center transition-all duration-200 cursor-pointer
                        ${activeCategory === subcategory.id
                          ? 'bg-[#DAA63E] text-white border-[#DAA63E]'
                          : 'bg-[#FAEFD9] text-gray-600 border-gray-300 hover:border-[#DAA63E] hover:text-[#DAA63E]'
                        }
                      `}
                      onClick={() => handleSubcategoryClick(subcategory.id)}
                    >
                      <span className="text-xs font-medium">{subcategory.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
}
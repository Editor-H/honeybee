"use client";

import { useState } from "react";
import React from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

interface TopNavigationProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export function TopNavigation({ activeCategory, onCategoryChange }: TopNavigationProps) {
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [expandedDropdown, setExpandedDropdown] = useState<string | null>(null);

  // 주요 카테고리들 (상단에 항상 표시)
  const primaryCategories = [
    { id: "all", name: "전체", subcategories: [] },
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
    }
  ];

  // 더보기 메뉴에 들어갈 카테고리들
  const secondaryCategories = [
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
    }
  ];

  const handleCategoryClick = (categoryId: string, hasSubcategories: boolean) => {
    if (hasSubcategories) {
      // 드롭다운 토글
      setExpandedDropdown(expandedDropdown === categoryId ? null : categoryId);
    } else {
      // 직접 카테고리 변경
      onCategoryChange(categoryId);
      setExpandedDropdown(null);
      setShowMoreMenu(false);
    }
  };

  const handleSubcategoryClick = (subcategoryId: string) => {
    onCategoryChange(subcategoryId);
    setExpandedDropdown(null);
    setShowMoreMenu(false);
  };

  const isActiveCategory = (categoryId: string, subcategories: any[]) => {
    return activeCategory === categoryId || subcategories.some(sub => sub.id === activeCategory);
  };

  return (
    <nav className="w-full bg-[#FAEFD9] border-b border-[#DAA63E]/20 relative">
      <div className="px-6 py-3">
        <div className="flex items-center space-x-1 overflow-x-auto">
          {/* 주요 카테고리들 */}
          {primaryCategories.map((category) => (
            <div key={category.id} className="relative">
              <button
                className={`
                  whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center space-x-1
                  ${isActiveCategory(category.id, category.subcategories)
                    ? 'bg-[#DAA63E] text-white'
                    : 'text-gray-700 hover:text-[#DAA63E] hover:bg-white/50'
                  }
                `}
                onClick={() => handleCategoryClick(category.id, category.subcategories.length > 0)}
              >
                <span>{category.name}</span>
                {category.subcategories.length > 0 && (
                  <ChevronDown 
                    className={`w-3 h-3 transition-transform ${
                      expandedDropdown === category.id ? 'rotate-180' : ''
                    }`}
                  />
                )}
              </button>

              {/* 하위 카테고리 드롭다운 */}
              {category.subcategories.length > 0 && expandedDropdown === category.id && (
                <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10 min-w-[160px]">
                  {category.subcategories.map((subcategory) => (
                    <button
                      key={subcategory.id}
                      className={`
                        w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors
                        ${activeCategory === subcategory.id ? 'text-[#DAA63E] font-medium' : 'text-gray-700'}
                      `}
                      onClick={() => handleSubcategoryClick(subcategory.id)}
                    >
                      {subcategory.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* 더보기 메뉴 */}
          <div className="relative">
            <button
              className={`
                whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center space-x-1
                ${showMoreMenu || secondaryCategories.some(cat => isActiveCategory(cat.id, cat.subcategories))
                  ? 'bg-[#DAA63E] text-white'
                  : 'text-gray-700 hover:text-[#DAA63E] hover:bg-white/50'
                }
              `}
              onClick={() => setShowMoreMenu(!showMoreMenu)}
            >
              <span>더보기</span>
              <ChevronDown 
                className={`w-3 h-3 transition-transform ${
                  showMoreMenu ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* 더보기 드롭다운 */}
            {showMoreMenu && (
              <div className="absolute top-full right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10 min-w-[180px]">
                {secondaryCategories.map((category) => (
                  <div key={category.id} className="relative">
                    <button
                      className={`
                        w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors flex items-center justify-between
                        ${isActiveCategory(category.id, category.subcategories) ? 'text-[#DAA63E] font-medium' : 'text-gray-700'}
                      `}
                      onClick={() => handleCategoryClick(category.id, category.subcategories.length > 0)}
                    >
                      <span>{category.name}</span>
                      {category.subcategories.length > 0 && (
                        <ChevronRight className="w-3 h-3" />
                      )}
                    </button>

                    {/* 더보기 메뉴의 하위 카테고리 */}
                    {category.subcategories.length > 0 && expandedDropdown === category.id && (
                      <div className="absolute top-0 left-full ml-1 bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-[160px]">
                        {category.subcategories.map((subcategory) => (
                          <button
                            key={subcategory.id}
                            className={`
                              w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors
                              ${activeCategory === subcategory.id ? 'text-[#DAA63E] font-medium' : 'text-gray-700'}
                            `}
                            onClick={() => handleSubcategoryClick(subcategory.id)}
                          >
                            {subcategory.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 배경 클릭 시 드롭다운 닫기 */}
      {(expandedDropdown || showMoreMenu) && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => {
            setExpandedDropdown(null);
            setShowMoreMenu(false);
          }}
        />
      )}
    </nav>
  );
}
"use client";

import { useState } from 'react';
import Image from 'next/image';

interface PlatformLogoProps {
  platform: {
    id: string;
    name: string;
  };
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showFallback?: boolean;
}

const LOGO_MAPPINGS: Record<string, { 
  logo: string; 
  fallback: string; 
  bgColor?: string;
  textColor?: string;
}> = {
  // 🇰🇷 한국 기업 기술 블로그
  'toss': { 
    logo: '/logos/toss-favicon.ico', 
    fallback: 'T',
    bgColor: '#0064FF',
    textColor: '#FFFFFF'
  },
  'kakao': { 
    logo: '/logos/kakao-favicon.ico', 
    fallback: 'K',
    bgColor: '#FFCD00',
    textColor: '#000000'
  },
  'naver_d2': { 
    logo: '/logos/naver-d2-favicon.ico', 
    fallback: 'D2',
    bgColor: '#03C75A',
    textColor: '#FFFFFF'
  },
  'woowahan': { 
    logo: '/logos/woowahan-favicon.ico', 
    fallback: 'W',
    bgColor: '#4AC1FF',
    textColor: '#FFFFFF'
  },
  'socar': { 
    logo: '/logos/socar.svg', 
    fallback: 'S',
    bgColor: '#3366FF',
    textColor: '#FFFFFF'
  },
  'line': { 
    logo: '/logos/line.svg', 
    fallback: 'L',
    bgColor: '#00B900',
    textColor: '#FFFFFF'
  },
  
  // 🌍 글로벌 플랫폼
  'medium': { 
    logo: '/logos/medium-favicon.ico', 
    fallback: 'M',
    bgColor: '#000000',
    textColor: '#FFFFFF'
  },
  'dev_to': { 
    logo: '/logos/dev-to-favicon.ico', 
    fallback: 'D',
    bgColor: '#0A0A0A',
    textColor: '#FFFFFF'
  },
  'google_developers': { 
    logo: '/logos/google-developers-favicon.ico', 
    fallback: 'G',
    bgColor: '#4285F4',
    textColor: '#FFFFFF'
  },
  'youtube': { 
    logo: '/logos/youtube-simple-icons.svg', 
    fallback: 'Y',
    bgColor: '#FF0000',
    textColor: '#FFFFFF'
  },
  'threads_ai': { 
    logo: '/logos/threads-simple-icons.svg', 
    fallback: '@',
    bgColor: '#000000',
    textColor: '#FFFFFF'
  },
  
  // 📚 교육 플랫폼
  'inflearn': { 
    logo: '/logos/inflearn-favicon.ico', 
    fallback: 'I',
    bgColor: '#4FC845',
    textColor: '#FFFFFF'
  },
  'class101': { 
    logo: '/logos/class101-favicon.ico', 
    fallback: 'C',
    bgColor: '#FF6B35',
    textColor: '#FFFFFF'
  },
  'coloso': { 
    logo: '/logos/coloso-favicon.ico', 
    fallback: 'C',
    bgColor: '#6C5CE7',
    textColor: '#FFFFFF'
  },
  
  // 📰 미디어 & 커뮤니티
  'outstanding': { 
    logo: '/logos/outstanding-favicon.ico', 
    fallback: 'O',
    bgColor: '#FF6B6B',
    textColor: '#FFFFFF'
  },
  'yozm': { 
    logo: '/logos/yozm.svg', 
    fallback: 'Y',
    bgColor: '#4ECDC4',
    textColor: '#FFFFFF'
  },
  'velog': { 
    logo: '/logos/velog-favicon.ico', 
    fallback: 'V',
    bgColor: '#20C997',
    textColor: '#FFFFFF'
  },
  'hacker_news': { 
    logo: '/logos/hacker-news-favicon.ico', 
    fallback: 'HN',
    bgColor: '#FF6600',
    textColor: '#FFFFFF'
  },
  'freecodecamp': { 
    logo: '/logos/freecodecamp-favicon.ico', 
    fallback: 'FCC',
    bgColor: '#006400',
    textColor: '#FFFFFF'
  },
  'daangn': { 
    logo: '/logos/daangn-favicon.ico', 
    fallback: '당',
    bgColor: '#FF6600',
    textColor: '#FFFFFF'
  },
  'eo': { 
    logo: '/logos/eo.svg', 
    fallback: 'E',
    bgColor: '#A8E6CF',
    textColor: '#000000'
  },
  'gpters': { 
    logo: '/logos/gpters.svg', 
    fallback: 'G',
    bgColor: '#FF8B94',
    textColor: '#FFFFFF'
  },
  'aikorea_news': { 
    logo: '/logos/aikorea.svg', 
    fallback: 'AI',
    bgColor: '#667EEA',
    textColor: '#FFFFFF'
  },
  
  // 추가 플랫폼들
  'naver': { 
    logo: '/logos/naver-favicon.ico', 
    fallback: 'N',
    bgColor: '#03C75A',
    textColor: '#FFFFFF'
  },
  'banksalad': { 
    logo: '/logos/banksalad-favicon.ico', 
    fallback: 'B',
    bgColor: '#00C853',
    textColor: '#FFFFFF'
  },
  'coupang': { 
    logo: '/logos/coupang-favicon.ico', 
    fallback: 'C',
    bgColor: '#FF6B35',
    textColor: '#FFFFFF'
  },
  'socar': { 
    logo: '/logos/socar-favicon.ico', 
    fallback: 'S',
    bgColor: '#3366FF',
    textColor: '#FFFFFF'
  },
  'jocoding': { 
    logo: '/logos/youtube-simple-icons.svg', 
    fallback: '조',
    bgColor: '#FF0000',
    textColor: '#FFFFFF'
  },
  'opentutorials': { 
    logo: '/logos/youtube-simple-icons.svg', 
    fallback: '생',
    bgColor: '#FF0000',
    textColor: '#FFFFFF'
  },
  'nomad_coders': { 
    logo: '/logos/youtube-simple-icons.svg', 
    fallback: 'NC',
    bgColor: '#FF0000',
    textColor: '#FFFFFF'
  },
  'coding_with_john': { 
    logo: '/logos/youtube-simple-icons.svg', 
    fallback: 'J',
    bgColor: '#FF0000',
    textColor: '#FFFFFF'
  },
  'programming_with_mosh': { 
    logo: '/logos/youtube-simple-icons.svg', 
    fallback: 'M',
    bgColor: '#FF0000',
    textColor: '#FFFFFF'
  },
  'medium_ux_collective': { 
    logo: '/logos/medium-favicon.ico', 
    fallback: 'UXC',
    bgColor: '#000000',
    textColor: '#FFFFFF'
  },
  'medium_ux_writer': { 
    logo: '/logos/medium-favicon.ico', 
    fallback: 'UX',
    bgColor: '#000000',
    textColor: '#FFFFFF'
  },
  'tistory_design': { 
    logo: '/logos/tistory-favicon.ico', 
    fallback: 'T',
    bgColor: '#FF6B35',
    textColor: '#FFFFFF'
  },
  'react_docs': { 
    logo: '/logos/react-favicon.ico', 
    fallback: 'R',
    bgColor: '#61DAFB',
    textColor: '#000000'
  },
  'nextjs_blog': { 
    logo: '/logos/nextjs-favicon.ico', 
    fallback: 'N',
    bgColor: '#000000',
    textColor: '#FFFFFF'
  },
  'vercel_blog': { 
    logo: '/logos/vercel-favicon.ico', 
    fallback: 'V',
    bgColor: '#000000',
    textColor: '#FFFFFF'
  },
  'github_blog': { 
    logo: '/logos/github-favicon.ico', 
    fallback: 'GH',
    bgColor: '#24292e',
    textColor: '#FFFFFF'
  },
  'aws_blog': { 
    logo: '/logos/aws-favicon.ico', 
    fallback: 'AWS',
    bgColor: '#FF9900',
    textColor: '#000000'
  },
  'microsoft_devblogs': { 
    logo: '/logos/microsoft-favicon.ico', 
    fallback: 'MS',
    bgColor: '#0078D4',
    textColor: '#FFFFFF'
  },
  'anthropic_news': { 
    logo: '/logos/anthropic-favicon.ico', 
    fallback: 'A',
    bgColor: '#D4A574',
    textColor: '#000000'
  },
  'openai_blog': { 
    logo: '/logos/openai-favicon.ico', 
    fallback: 'OAI',
    bgColor: '#412991',
    textColor: '#FFFFFF'
  },
  'huggingface_blog': { 
    logo: '/logos/huggingface-favicon.ico', 
    fallback: '🤗',
    bgColor: '#FFD21E',
    textColor: '#000000'
  },
  'deepmind_blog': { 
    logo: '/logos/deepmind-favicon.ico', 
    fallback: 'DM',
    bgColor: '#4285F4',
    textColor: '#FFFFFF'
  },
  'stability_ai': { 
    logo: '/logos/stability-ai-favicon.ico', 
    fallback: 'SA',
    bgColor: '#7C3AED',
    textColor: '#FFFFFF'
  },
  
  // 기본 fallback
  'default': { 
    logo: '', 
    fallback: '⭐',
    bgColor: '#6B7280',
    textColor: '#FFFFFF'
  }
};

export function PlatformLogo({ 
  platform, 
  className = '', 
  size = 'md',
  showFallback = true 
}: PlatformLogoProps) {
  const [imageError, setImageError] = useState(false);
  
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8'
  };
  
  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };
  
  const logoConfig = LOGO_MAPPINGS[platform.id] || LOGO_MAPPINGS['default'];
  const shouldShowFallback = imageError || !logoConfig.logo;

  if (shouldShowFallback) {
    return (
      <div 
        className={`
          ${sizeClasses[size]} 
          rounded-md flex items-center justify-center font-semibold
          ${textSizeClasses[size]}
          ${className}
        `}
        style={{ 
          backgroundColor: logoConfig.bgColor,
          color: logoConfig.textColor 
        }}
        title={platform.name}
      >
        {logoConfig.fallback}
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} ${className} relative overflow-hidden rounded-md`}>
      <Image
        src={logoConfig.logo}
        alt={`${platform.name} 로고`}
        width={size === 'sm' ? 16 : size === 'md' ? 24 : 32}
        height={size === 'sm' ? 16 : size === 'md' ? 24 : 32}
        className="object-cover"
        onError={() => setImageError(true)}
        title={platform.name}
      />
    </div>
  );
}

// 플랫폼 로고 매핑 정보를 export (다른 컴포넌트에서 사용 가능)
export const getPlatformLogoConfig = (platformId: string) => {
  return LOGO_MAPPINGS[platformId] || LOGO_MAPPINGS['default'];
};
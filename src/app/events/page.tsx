"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar, Clock, MapPin, Users } from "lucide-react";
import { Article } from "@/types/article";

interface EventCardProps {
  event: Article;
}

function EventCard({ event }: EventCardProps) {
  const eventDate = new Date(event.publishedAt);
  const now = new Date();
  const isOngoing = eventDate <= now && eventDate >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const isPast = eventDate < new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const handleCardClick = () => {
    window.open(event.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group"
         onClick={handleCardClick}>
      {/* 행사 썸네일 */}
      <div className="aspect-video overflow-hidden bg-gradient-to-br from-[#DAA63E]/10 to-[#DAA63E]/20">
        {event.thumbnailUrl ? (
          <img 
            src={event.thumbnailUrl} 
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              // 썸네일 로드 실패 시 폴백 처리
              e.currentTarget.style.display = 'none';
              const fallback = e.currentTarget.nextElementSibling;
              if (fallback) fallback.classList.remove('hidden');
            }}
          />
        ) : null}
        {/* 폴백 썸네일 */}
        <div className={`${event.thumbnailUrl ? 'hidden' : 'flex'} w-full h-full items-center justify-center`}>
          <div className="text-center">
            <Calendar className="w-12 h-12 text-[#DAA63E] mx-auto mb-2" />
            <span className="text-sm font-medium text-[#DAA63E]">{event.platform.name}</span>
          </div>
        </div>
      </div>
      
      {/* 행사 정보 */}
      <div className="p-6">
        {/* 상태 배지 */}
        <div className="flex items-center gap-2 mb-3">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            isPast ? 'bg-gray-100 text-gray-600' :
            isOngoing ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
          }`}>
            {isPast ? '종료' : isOngoing ? '진행중' : '예정'}
          </span>
          <span className="text-xs text-gray-500">{event.platform.name}</span>
        </div>

        {/* 행사 제목 */}
        <h3 className="font-bold text-lg mb-3 text-gray-900 group-hover:text-[#DAA63E] transition-colors line-clamp-2">
          {event.title}
        </h3>

        {/* 행사 설명 */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {event.excerpt}
        </p>

        {/* 행사 상세 정보 */}
        <div className="space-y-2 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{eventDate.toLocaleDateString('ko-KR', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              weekday: 'short'
            })}</span>
          </div>
          
          {event.videoDuration && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{Math.floor(event.videoDuration / 60)}분</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function EventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(2025);

  // 2024년 주요 기술 행사 데이터
  const past2024Events: Article[] = [
    {
      id: 'slash24',
      title: 'SLASH 24',
      content: '토스의 개발자 컨퍼런스',
      excerpt: '심플하게 금융의 한계를 뛰어넘는 기술',
      author: { id: 'toss', name: '토스', avatar: '', company: '토스', expertise: [], articleCount: 0 },
      platform: { id: 'toss', name: '토스', type: 'corporate' as const, baseUrl: 'https://toss.tech', description: '', isActive: true },
      category: 'events' as const,
      tags: ['금융', '핀테크', '개발'],
      publishedAt: new Date('2024-04-25'),
      readingTime: 0,
      trending: false,
      featured: true,
      url: 'https://toss.tech/slash-24',
      contentType: 'article' as const
    },
    {
      id: 'ifkakao24',
      title: 'if(kakao) 2024',
      content: '카카오 개발자 컨퍼런스',
      excerpt: 'AI의 현재와 미래, 그리고 일상의 변화',
      author: { id: 'kakao', name: '카카오', avatar: '', company: '카카오', expertise: [], articleCount: 0 },
      platform: { id: 'kakao', name: '카카오', type: 'corporate' as const, baseUrl: 'https://tech.kakao.com', description: '', isActive: true },
      category: 'events' as const,
      tags: ['AI', '플랫폼', '일상'],
      publishedAt: new Date('2024-11-28'),
      readingTime: 0,
      trending: false,
      featured: true,
      url: 'https://if.kakao.com/2024',
      contentType: 'article' as const
    },
    {
      id: 'deview24',
      title: 'DEVIEW 2024',
      content: '네이버 개발자 컨퍼런스',
      excerpt: '연결과 혁신, 기술로 만드는 새로운 경험',
      author: { id: 'naver', name: '네이버', avatar: '', company: '네이버', expertise: [], articleCount: 0 },
      platform: { id: 'naver', name: '네이버 D2', type: 'corporate' as const, baseUrl: 'https://d2.naver.com', description: '', isActive: true },
      category: 'events' as const,
      tags: ['검색', 'AI', '플랫폼'],
      publishedAt: new Date('2024-10-29'),
      readingTime: 0,
      trending: false,
      featured: true,
      url: 'https://deview.kr/2024',
      contentType: 'article' as const
    },
    {
      id: 'woowacon24',
      title: '우아콘 2024',
      content: '우아한형제들 기술 컨퍼런스',
      excerpt: '함께 성장하는 개발 문화 이야기',
      author: { id: 'woowahan', name: '우아한형제들', avatar: '', company: '우아한형제들', expertise: [], articleCount: 0 },
      platform: { id: 'woowahan', name: '우아한형제들', type: 'corporate' as const, baseUrl: 'https://techblog.woowahan.com', description: '', isActive: true },
      category: 'events' as const,
      tags: ['배달', '성장', '문화'],
      publishedAt: new Date('2024-06-20'),
      readingTime: 0,
      trending: false,
      featured: true,
      url: 'https://woowacon.com/2024',
      contentType: 'article' as const
    }
  ];

  // 2025년 주요 기술 행사 데이터 (실제 행사들)
  const past2025Events: Article[] = [
    {
      id: 'slash25',
      title: 'SLASH 25',
      content: '토스의 개발자 컨퍼런스',
      excerpt: '토스가 만드는 개발자 컨퍼런스. 금융과 기술의 만남',
      author: { id: 'toss', name: '토스', avatar: '', company: '토스', expertise: [], articleCount: 0 },
      platform: { id: 'toss', name: '토스', type: 'corporate' as const, baseUrl: 'https://toss.tech', description: '', isActive: true },
      category: 'events' as const,
      tags: ['금융', '핀테크', '개발'],
      publishedAt: new Date('2025-04-24'),
      readingTime: 0,
      trending: false,
      featured: true,
      url: 'https://toss.tech/slash-24',
      contentType: 'article' as const
    },
    {
      id: 'ifkakao25',
      title: 'if(kakao) 2025',
      content: '카카오 개발자 컨퍼런스',
      excerpt: '카카오의 기술과 서비스, 그리고 사람들의 이야기',
      author: { id: 'kakao', name: '카카오', avatar: '', company: '카카오', expertise: [], articleCount: 0 },
      platform: { id: 'kakao', name: '카카오', type: 'corporate' as const, baseUrl: 'https://tech.kakao.com', description: '', isActive: true },
      category: 'events' as const,
      tags: ['플랫폼', 'AI', '모빌리티'],
      publishedAt: new Date('2025-11-14'),
      readingTime: 0,
      trending: false,
      featured: true,
      url: 'https://if.kakao.com/2024',
      contentType: 'article' as const
    },
    {
      id: 'deview25',
      title: 'DEVIEW 2025',
      content: '네이버 개발자 컨퍼런스',
      excerpt: '네이버가 그리는 미래 기술과 개발 문화',
      author: { id: 'naver', name: '네이버', avatar: '', company: '네이버', expertise: [], articleCount: 0 },
      platform: { id: 'naver', name: '네이버 D2', type: 'corporate' as const, baseUrl: 'https://d2.naver.com', description: '', isActive: true },
      category: 'events' as const,
      tags: ['검색', 'AI', '클라우드'],
      publishedAt: new Date('2025-10-28'),
      readingTime: 0,
      trending: false,
      featured: true,
      url: 'https://deview.kr/2024',
      contentType: 'article' as const
    },
    {
      id: 'woowacon25',
      title: '우아콘 2025',
      content: '우아한형제들 기술 컨퍼런스',
      excerpt: '우아한 개발과 성장의 이야기',
      author: { id: 'woowahan', name: '우아한형제들', avatar: '', company: '우아한형제들', expertise: [], articleCount: 0 },
      platform: { id: 'woowahan', name: '우아한형제들', type: 'corporate' as const, baseUrl: 'https://techblog.woowahan.com', description: '', isActive: true },
      category: 'events' as const,
      tags: ['배달', '서비스', '개발문화'],
      publishedAt: new Date('2025-06-21'),
      readingTime: 0,
      trending: false,
      featured: true,
      url: 'https://woowacon.com/2024',
      contentType: 'article' as const
    }
  ];

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const response = await fetch('/api/feeds/all');
        const data = await response.json();
        
        if (data.success && data.articles) {
          const processedEvents = data.articles
            .filter((article: any) => {
              // events 카테고리이거나 행사 관련 키워드가 포함된 아티클들
              const title = article.title?.toLowerCase() || '';
              const excerpt = article.excerpt?.toLowerCase() || '';
              const content = title + ' ' + excerpt;
              
              const eventKeywords = ['conference', 'meetup', 'event', 'summit', 'webinar', 'live', 'keynote', 'session', '컨퍼런스', '행사', '세미나', '미팅', '라이브', '키노트'];
              const hasEventKeyword = eventKeywords.some(keyword => content.includes(keyword));
              
              return article.category === 'events' || hasEventKeyword;
            })
            .map((article: any) => ({
              ...article,
              publishedAt: new Date(article.publishedAt),
              category: 'events' // 강제로 events 카테고리로 설정
            }));
          
          // RSS에서 수집된 행사들과 주요 행사들 합치기
          const allEvents = [...processedEvents, ...past2024Events, ...past2025Events]
            .sort((a: Article, b: Article) => 
              new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
            );
          setEvents(allEvents);
        } else {
          // RSS 데이터가 없으면 주요 행사들만 표시
          setEvents([...past2024Events, ...past2025Events]);
        }
      } catch (error) {
        console.error('행사 데이터 로딩 실패:', error);
        setEvents([...past2024Events, ...past2025Events]);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  const now = new Date();
  
  // 선택된 연도에 해당하는 행사들만 필터링
  const filteredEvents = events.filter(event => {
    const eventYear = new Date(event.publishedAt).getFullYear();
    return eventYear === selectedYear;
  });
  
  const ongoingEvents = filteredEvents.filter(event => {
    const eventDate = new Date(event.publishedAt);
    return eventDate <= now && eventDate >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // 일주일 내
  });

  const upcomingEvents = filteredEvents.filter(event => {
    const eventDate = new Date(event.publishedAt);
    return eventDate > now;
  });

  const pastEvents = filteredEvents.filter(event => {
    const eventDate = new Date(event.publishedAt);
    return eventDate < new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // 일주일 전
  });

  return (
    <div className="min-h-screen bg-[#FAEFD9]">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* 헤더 */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg hover:bg-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex items-center gap-3">
            <Calendar className="w-8 h-8 text-[#DAA63E]" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">기술 행사</h1>
              <p className="text-gray-600">온오프라인 개발자 행사 정보</p>
            </div>
          </div>
        </div>

        {/* 연도 네비게이션 */}
        <div className="flex justify-center mb-8">
          <div className="flex bg-white rounded-full border border-gray-200 p-1">
            {[2024, 2025].map((year) => (
              <button
                key={year}
                onClick={() => setSelectedYear(year)}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedYear === year
                    ? 'bg-[#DAA63E] text-white shadow-sm'
                    : 'text-gray-600 hover:text-[#DAA63E] hover:bg-gray-50'
                }`}
              >
                {year}년
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#DAA63E] mx-auto mb-4"></div>
            <p className="text-slate-500">행사 정보를 불러오는 중...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* 진행중인 행사 */}
            {ongoingEvents.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  진행중인 행사
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {ongoingEvents.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              </section>
            )}

            {/* 예정된 행사 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                예정된 행사
              </h2>
              {upcomingEvents.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {upcomingEvents.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-2">예정된 행사가 없습니다.</p>
                  <p className="text-sm text-gray-400">개발자, 디자이너, 기획자 행사 정보를 수집중입니다.</p>
                </div>
              )}
            </section>

            {/* 지난 행사들 */}
            {pastEvents.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                  {selectedYear}년 주요 행사
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pastEvents.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              </section>
            )}

            {/* 행사 플랫폼 안내 */}
            <section className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">행사 정보 제공 플랫폼</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-800">글로벌 기업</h4>
                  <ul className="text-gray-600 space-y-1">
                    <li>• AWS Korea - 클라우드 이벤트</li>
                    <li>• Microsoft Korea - 개발자 행사</li>
                    <li>• Google Developers - 기술 컨퍼런스</li>
                    <li>• Geekle - 온라인 컨퍼런스</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-800">기술 블로그</h4>
                  <ul className="text-gray-600 space-y-1">
                    <li>• 토스 기술블로그 - SLASH</li>
                    <li>• 카카오 - if kakao</li>
                    <li>• 네이버 D2 - DEVIEW</li>
                    <li>• 우아한형제들 - 우아콘</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-800">교육 플랫폼</h4>
                  <ul className="text-gray-600 space-y-1">
                    <li>• Fast Campus - 무료 특강</li>
                    <li>• CodeIt - 교육 세미나</li>
                    <li>• LINE - 개발자 미팅</li>
                    <li>• 각종 YouTube 채널</li>
                  </ul>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
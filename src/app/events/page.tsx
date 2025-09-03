"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
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

  // 2024년 주요 기술 행사 데이터 (실제 조사한 행사들)
  const past2024Events: Article[] = [
    // 해외 온라인 행사
    {
      id: 'google-io-2024',
      title: 'Google I/O 2024',
      content: '구글 개발자 컨퍼런스',
      excerpt: 'AI와 개발자 도구의 미래를 제시하는 구글의 연례 개발자 컨퍼런스. 키노트와 100+ 세션 제공.',
      author: { id: 'google', name: 'Google', avatar: '', company: 'Google', expertise: ['AI', 'Android', 'Web'], articleCount: 0 },
      platform: { id: 'google', name: 'Google for Developers', type: 'corporate' as const, baseUrl: 'https://developers.google.com', description: '', isActive: true },
      category: 'events' as const,
      tags: ['AI', 'Android', 'Web', 'Cloud'],
      publishedAt: new Date('2024-05-14'),
      readingTime: 0,
      trending: false,
      featured: true,
      url: 'https://io.google/2024/',
      contentType: 'article' as const
    },
    {
      id: 'apple-wwdc-2024',
      title: 'Apple WWDC 2024',
      content: 'Apple 세계개발자회의',
      excerpt: 'iOS 18, iPadOS 18, macOS Sequoia 발표. Apple Intelligence 기능 소개와 개발자 세션 제공.',
      author: { id: 'apple', name: 'Apple', avatar: '', company: 'Apple', expertise: ['iOS', 'macOS', 'Swift'], articleCount: 0 },
      platform: { id: 'apple', name: 'Apple Developer', type: 'corporate' as const, baseUrl: 'https://developer.apple.com', description: '', isActive: true },
      category: 'events' as const,
      tags: ['iOS', 'macOS', 'Swift', 'AI'],
      publishedAt: new Date('2024-06-10'),
      readingTime: 0,
      trending: false,
      featured: true,
      url: 'https://developer.apple.com/videos/wwdc2024/',
      contentType: 'article' as const
    },
    {
      id: 'microsoft-build-2024',
      title: 'Microsoft Build 2024',
      content: 'Microsoft 개발자 컨퍼런스',
      excerpt: 'AI 중심 개발자 경험과 Copilot+ PC 발표. Surface Pro 11, Surface Laptop 7 공개.',
      author: { id: 'microsoft', name: 'Microsoft', avatar: '', company: 'Microsoft', expertise: ['Azure', '.NET', 'AI'], articleCount: 0 },
      platform: { id: 'microsoft', name: 'Microsoft Developer', type: 'corporate' as const, baseUrl: 'https://build.microsoft.com', description: '', isActive: true },
      category: 'events' as const,
      tags: ['Azure', '.NET', 'AI', 'Surface'],
      publishedAt: new Date('2024-05-21'),
      readingTime: 0,
      trending: false,
      featured: true,
      url: 'https://build.microsoft.com/',
      contentType: 'article' as const
    },
    {
      id: 'figma-config-2024',
      title: 'Figma Config 2024',
      content: 'Figma 디자인 컨퍼런스',
      excerpt: '75+ 스피커, 8000명 참석의 최대 규모 컨퍼런스. Figma Slides와 AI 기능 발표.',
      author: { id: 'figma', name: 'Figma', avatar: '', company: 'Figma', expertise: ['Design', 'UI/UX', 'Collaboration'], articleCount: 0 },
      platform: { id: 'figma', name: 'Figma', type: 'corporate' as const, baseUrl: 'https://config.figma.com', description: '', isActive: true },
      category: 'events' as const,
      tags: ['Design', 'UI/UX', 'Collaboration', 'AI'],
      publishedAt: new Date('2024-06-26'),
      readingTime: 0,
      trending: false,
      featured: true,
      url: 'https://config.figma.com/',
      contentType: 'article' as const
    },
    {
      id: 'aws-reinvent-2024',
      title: 'AWS re:Invent 2024',
      content: 'AWS 플래그십 클라우드 컨퍼런스',
      excerpt: '클라우드 컴퓨팅의 미래를 제시하는 AWS의 연례 컨퍼런스. 키노트, 세션, 제품 출시.',
      author: { id: 'aws', name: 'AWS', avatar: '', company: 'Amazon Web Services', expertise: ['Cloud', 'Infrastructure', 'AI/ML'], articleCount: 0 },
      platform: { id: 'aws', name: 'AWS Events', type: 'corporate' as const, baseUrl: 'https://reinvent.awsevents.com', description: '', isActive: true },
      category: 'events' as const,
      tags: ['Cloud', 'Infrastructure', 'AI/ML', 'Serverless'],
      publishedAt: new Date('2024-12-02'),
      readingTime: 0,
      trending: false,
      featured: true,
      url: 'https://reinvent.awsevents.com/on-demand/',
      contentType: 'article' as const
    },
    {
      id: 'github-universe-2024',
      title: 'GitHub Universe 2024',
      content: 'GitHub 개발자 컨퍼런스',
      excerpt: '10주년 개발자 컨퍼런스. 멀티모델 Copilot, GitHub Spark 발표.',
      author: { id: 'github', name: 'GitHub', avatar: '', company: 'GitHub', expertise: ['DevOps', 'AI', 'Collaboration'], articleCount: 0 },
      platform: { id: 'github', name: 'GitHub', type: 'corporate' as const, baseUrl: 'https://githubuniverse.com', description: '', isActive: true },
      category: 'events' as const,
      tags: ['DevOps', 'AI', 'Collaboration', 'Open Source'],
      publishedAt: new Date('2024-10-29'),
      readingTime: 0,
      trending: false,
      featured: true,
      url: 'https://githubuniverse.com/',
      contentType: 'article' as const
    },
    {
      id: 'react-conf-2024',
      title: 'React Conf 2024',
      content: 'React 커뮤니티 컨퍼런스',
      excerpt: '7회째 React 컨퍼런스. React 19 RC, React Native New Architecture Beta 발표.',
      author: { id: 'meta', name: 'Meta', avatar: '', company: 'Meta', expertise: ['React', 'JavaScript', 'Frontend'], articleCount: 0 },
      platform: { id: 'react', name: 'React', type: 'community' as const, baseUrl: 'https://conf2024.react.dev', description: '', isActive: true },
      category: 'events' as const,
      tags: ['React', 'JavaScript', 'Frontend', 'Open Source'],
      publishedAt: new Date('2024-05-15'),
      readingTime: 0,
      trending: false,
      featured: true,
      url: 'https://conf2024.react.dev/',
      contentType: 'article' as const
    },
    
    // 국내 하이브리드 행사
    {
      id: 'dan24',
      title: 'DAN 24 (네이버)',
      content: '팀 네이버 통합 컨퍼런스',
      excerpt: '네이버의 DEVIEW를 포함한 통합 컨퍼런스. 80+ 개발자, 42개 기술 세션, AI 원천기술 발표.',
      author: { id: 'naver', name: '네이버', avatar: '', company: '네이버', expertise: ['AI', '검색', '플랫폼'], articleCount: 0 },
      platform: { id: 'naver', name: '네이버 D2', type: 'corporate' as const, baseUrl: 'https://dan.naver.com', description: '', isActive: true },
      category: 'events' as const,
      tags: ['AI', '검색', '플랫폼', 'HyperCLOVA'],
      publishedAt: new Date('2024-11-11'),
      readingTime: 0,
      trending: false,
      featured: true,
      url: 'https://dan.naver.com/24',
      contentType: 'article' as const
    },
    {
      id: 'ifkakaoai24',
      title: 'if(kakaoAI)2024',
      content: '카카오 AI 개발자 컨퍼런스',
      excerpt: '5년 만의 오프라인 개최. 카나나(Kanana) AI 서비스 공개, 모든 연결을 새롭게.',
      author: { id: 'kakao', name: '카카오', avatar: '', company: '카카오', expertise: ['AI', '플랫폼', '서비스'], articleCount: 0 },
      platform: { id: 'kakao', name: '카카오', type: 'corporate' as const, baseUrl: 'https://if.kakao.com', description: '', isActive: true },
      category: 'events' as const,
      tags: ['AI', '플랫폼', '서비스', 'Kanana'],
      publishedAt: new Date('2024-10-22'),
      readingTime: 0,
      trending: false,
      featured: true,
      url: 'https://if.kakao.com/2024',
      contentType: 'article' as const
    },
    {
      id: 'pycon-korea-2024',
      title: 'PyCon Korea 2024',
      content: '파이썬 커뮤니티 컨퍼런스',
      excerpt: '수원컨벤션센터에서 개최된 파이썬 개발자 커뮤니티 행사. 세션 영상 YouTube 업로드.',
      author: { id: 'python-korea', name: 'Python Korea', avatar: '', company: 'Python Korea', expertise: ['Python', '커뮤니티'], articleCount: 0 },
      platform: { id: 'python-korea', name: 'Python Korea', type: 'community' as const, baseUrl: 'https://2024.pycon.kr', description: '', isActive: true },
      category: 'events' as const,
      tags: ['Python', '커뮤니티', '오픈소스'],
      publishedAt: new Date('2024-08-31'),
      readingTime: 0,
      trending: false,
      featured: true,
      url: 'https://2024.pycon.kr/',
      contentType: 'article' as const
    }
  ];

  // 2025년 예정 행사 데이터 (공식 발표된 행사들)
  const past2025Events: Article[] = [
    {
      id: 'google-io-2025',
      title: 'Google I/O 2025',
      content: '구글 개발자 컨퍼런스',
      excerpt: '2025년 구글의 최신 AI와 개발자 도구를 소개하는 연례 컨퍼런스 (일정 미정)',
      author: { id: 'google', name: 'Google', avatar: '', company: 'Google', expertise: ['AI', 'Android', 'Web'], articleCount: 0 },
      platform: { id: 'google', name: 'Google for Developers', type: 'corporate' as const, baseUrl: 'https://developers.google.com', description: '', isActive: true },
      category: 'events' as const,
      tags: ['AI', 'Android', 'Web', 'Cloud'],
      publishedAt: new Date('2025-05-15'),
      readingTime: 0,
      trending: false,
      featured: true,
      url: 'https://io.google/2025/',
      contentType: 'article' as const
    },
    {
      id: 'apple-wwdc-2025',
      title: 'Apple WWDC 2025',
      content: 'Apple 세계개발자회의',
      excerpt: '2025년 Apple의 새로운 플랫폼과 개발자 도구 발표 (일정 미정)',
      author: { id: 'apple', name: 'Apple', avatar: '', company: 'Apple', expertise: ['iOS', 'macOS', 'Swift'], articleCount: 0 },
      platform: { id: 'apple', name: 'Apple Developer', type: 'corporate' as const, baseUrl: 'https://developer.apple.com', description: '', isActive: true },
      category: 'events' as const,
      tags: ['iOS', 'macOS', 'Swift', 'AI'],
      publishedAt: new Date('2025-06-10'),
      readingTime: 0,
      trending: false,
      featured: true,
      url: 'https://developer.apple.com/',
      contentType: 'article' as const
    },
    {
      id: 'microsoft-build-2025',
      title: 'Microsoft Build 2025',
      content: 'Microsoft 개발자 컨퍼런스',
      excerpt: '공식 발표된 Microsoft Build 2025. AI와 클라우드의 미래를 제시.',
      author: { id: 'microsoft', name: 'Microsoft', avatar: '', company: 'Microsoft', expertise: ['Azure', '.NET', 'AI'], articleCount: 0 },
      platform: { id: 'microsoft', name: 'Microsoft Developer', type: 'corporate' as const, baseUrl: 'https://build.microsoft.com', description: '', isActive: true },
      category: 'events' as const,
      tags: ['Azure', '.NET', 'AI', 'Cloud'],
      publishedAt: new Date('2025-05-20'),
      readingTime: 0,
      trending: false,
      featured: true,
      url: 'https://build.microsoft.com/',
      contentType: 'article' as const
    },
    {
      id: 'react-conf-2025',
      title: 'React Conf 2025',
      content: 'React 커뮤니티 컨퍼런스',
      excerpt: 'Henderson, Nevada에서 개최 예정인 React Conf 2025. 온라인 동시 진행.',
      author: { id: 'meta', name: 'Meta', avatar: '', company: 'Meta', expertise: ['React', 'JavaScript', 'Frontend'], articleCount: 0 },
      platform: { id: 'react', name: 'React', type: 'community' as const, baseUrl: 'https://conf.react.dev', description: '', isActive: true },
      category: 'events' as const,
      tags: ['React', 'JavaScript', 'Frontend', 'Open Source'],
      publishedAt: new Date('2025-10-07'),
      readingTime: 0,
      trending: false,
      featured: true,
      url: 'https://conf.react.dev/',
      contentType: 'article' as const
    },
    {
      id: 'figma-config-2025',
      title: 'Figma Config 2025',
      content: 'Figma 디자인 컨퍼런스',
      excerpt: 'San Francisco와 London 두 도시에서 동시 개최 예정인 Figma Config 2025.',
      author: { id: 'figma', name: 'Figma', avatar: '', company: 'Figma', expertise: ['Design', 'UI/UX', 'Collaboration'], articleCount: 0 },
      platform: { id: 'figma', name: 'Figma', type: 'corporate' as const, baseUrl: 'https://config.figma.com', description: '', isActive: true },
      category: 'events' as const,
      tags: ['Design', 'UI/UX', 'Collaboration', 'AI'],
      publishedAt: new Date('2025-05-06'),
      readingTime: 0,
      trending: false,
      featured: true,
      url: 'https://config.figma.com/',
      contentType: 'article' as const
    },
    {
      id: 'aws-reinvent-2025',
      title: 'AWS re:Invent 2025',
      content: 'AWS 클라우드 컨퍼런스',
      excerpt: '공식 발표된 AWS re:Invent 2025. 12월 1-5일 라스베이거스 개최 예정.',
      author: { id: 'aws', name: 'AWS', avatar: '', company: 'Amazon Web Services', expertise: ['Cloud', 'Infrastructure', 'AI/ML'], articleCount: 0 },
      platform: { id: 'aws', name: 'AWS Events', type: 'corporate' as const, baseUrl: 'https://reinvent.awsevents.com', description: '', isActive: true },
      category: 'events' as const,
      tags: ['Cloud', 'Infrastructure', 'AI/ML', 'Serverless'],
      publishedAt: new Date('2025-12-01'),
      readingTime: 0,
      trending: false,
      featured: true,
      url: 'https://reinvent.awsevents.com/',
      contentType: 'article' as const
    }
  ];

  useEffect(() => {
    const loadEvents = async () => {
      try {
        // 즉시 주요 행사들 표시 (빠른 초기 로딩)
        const majorEvents = [...past2024Events, ...past2025Events];
        setEvents(majorEvents);
        setLoading(false);

        // 캐시된 RSS 데이터에서 행사 관련 아티클 추가로 로드
        try {
          const response = await fetch('/api/feeds/all');
          const data = await response.json();
          
          if (data.success && data.articles) {
            const processedEvents = data.articles
              .filter((article: Article) => {
                // events 카테고리이거나 행사 관련 키워드가 포함된 아티클들
                const title = article.title?.toLowerCase() || '';
                const excerpt = article.excerpt?.toLowerCase() || '';
                const content = title + ' ' + excerpt;
                
                const eventKeywords = ['conference', 'meetup', 'event', 'summit', 'webinar', 'live', 'keynote', 'session', '컨퍼런스', '행사', '세미나', '미팅', '라이브', '키노트', 'SLASH', 'DEVIEW', 'if(kakao)', '우아콘'];
                const hasEventKeyword = eventKeywords.some(keyword => content.includes(keyword));
                
                return article.category === 'events' || hasEventKeyword;
              })
              .map((article: Article) => ({
                ...article,
                publishedAt: new Date(article.publishedAt),
                category: 'events' // 강제로 events 카테고리로 설정
              }));
            
            // RSS 이벤트들을 주요 이벤트와 합치기 (중복 제거)
            const allEvents = [...processedEvents, ...majorEvents]
              .filter((event, index, array) => 
                // 제목 기준으로 중복 제거
                array.findIndex(e => e.title === event.title) === index
              )
              .sort((a: Article, b: Article) => 
                new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
              );
            
            setEvents(allEvents);
          }
        } catch (rssError) {
          console.log('RSS 이벤트 로드 실패, 주요 이벤트만 표시:', rssError);
          // RSS 실패해도 주요 이벤트는 이미 표시되어 있음
        }
      } catch (error) {
        console.error('행사 데이터 로딩 실패:', error);
        // 최종 폴백: 주요 행사들만 표시
        setEvents([...past2024Events, ...past2025Events]);
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  // 선택된 연도에 해당하는 행사들만 필터링하고 날짜순 정렬
  const filteredEvents = events
    .filter(event => {
      const eventYear = new Date(event.publishedAt).getFullYear();
      return eventYear === selectedYear;
    })
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

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
            {/* 전체 행사 목록 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                {selectedYear}년 기술 행사
              </h2>
              {filteredEvents.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredEvents.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-2">{selectedYear}년 행사 정보가 없습니다.</p>
                  <p className="text-sm text-gray-400">개발자, 디자이너, 기획자 행사 정보를 수집중입니다.</p>
                </div>
              )}
            </section>

            {/* 행사 플랫폼 안내 */}
            <section className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">주요 IT 행사 및 YouTube 아카이브</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-800">해외 대형 컨퍼런스</h4>
                  <ul className="text-gray-600 space-y-1">
                    <li>• Google I/O - io.google.com</li>
                    <li>• Apple WWDC - developer.apple.com</li>
                    <li>• Microsoft Build - build.microsoft.com</li>
                    <li>• AWS re:Invent - YouTube @AWSEventsChannel</li>
                    <li>• GitHub Universe - githubuniverse.com</li>
                    <li>• Figma Config - config.figma.com</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-800">국내 기업 행사</h4>
                  <ul className="text-gray-600 space-y-1">
                    <li>• DAN 24 (네이버) - YouTube PLAY NAVER</li>
                    <li>• if(kakaoAI) - if.kakao.com</li>
                    <li>• 토스 SLASH - toss.tech</li>
                    <li>• 우아콘 (우아한형제들)</li>
                    <li>• LINE 개발자 미팅</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-800">커뮤니티 & 오픈소스</h4>
                  <ul className="text-gray-600 space-y-1">
                    <li>• React Conf - conf.react.dev</li>
                    <li>• PyCon Korea - pycon.kr</li>
                    <li>• GDG DevFest Seoul</li>
                    <li>• KubeCon + CloudNativeCon</li>
                    <li>• DockerCon</li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-[#FAEFD9] rounded-lg">
                <h4 className="font-medium text-gray-800 mb-2">📺 YouTube 아카이브 정보</h4>
                <p className="text-xs text-gray-600">
                  대부분의 주요 IT 행사는 YouTube에서 키노트와 세션 영상을 무료로 제공합니다. 
                  행사 종료 후 즉시 업로드되며, 플레이리스트로 주제별 분류되어 있어 관심 분야별로 시청할 수 있습니다.
                </p>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
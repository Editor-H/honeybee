import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { supabase } from '@/lib/supabase';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 GET /api/articles/saved 호출됨');
    
    const session = await getServerSession(authOptions);
    console.log('📱 세션 상태:', session ? '로그인됨' : '로그인 안됨');
    
    if (!session?.user?.email) {
      console.log('❌ 인증되지 않은 사용자 - 빈 배열 반환');
      return NextResponse.json({ 
        success: true,
        articles: [],
        total: 0,
        message: 'Please log in to view saved articles'
      });
    }

    // 저장된 아티클 조회
    const { data, error } = await supabase
      .from('saved_articles')
      .select('*')
      .eq('user_google_id', session.user.email)
      .order('saved_at', { ascending: false });

    if (error) {
      console.error('Supabase fetch error:', error);
      return NextResponse.json({ error: 'Failed to fetch saved articles' }, { status: 500 });
    }

    // Article 형태로 변환
    const articles = data?.map(item => ({
      id: item.id.toString(),
      title: item.article_title,
      content: item.article_excerpt || '',
      excerpt: item.article_excerpt || '',
      url: item.article_url,
      publishedAt: new Date(item.article_published_at || item.saved_at),
      platform: {
        id: item.article_platform?.toLowerCase().replace(/\s+/g, '-') || 'unknown',
        name: item.article_platform || 'Unknown Platform',
        type: 'corporate' as const,
        baseUrl: '',
        description: '',
        isActive: true
      },
      author: {
        id: 'unknown',
        name: 'Unknown Author',
        company: item.article_platform || 'Unknown Platform',
        expertise: [],
        articleCount: 0
      },
      category: 'general' as const,
      tags: [],
      readingTime: 5,
      trending: false,
      featured: false,
      contentType: 'article' as const,
      savedAt: item.saved_at
    })) || [];

    return NextResponse.json({ 
      success: true, 
      articles: articles,
      total: articles.length 
    });

  } catch (error) {
    console.error('Get saved articles error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
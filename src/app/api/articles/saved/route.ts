import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { supabase } from '@/lib/supabase';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 저장된 아티클 조회
    const { data, error } = await supabase
      .from('saved_articles')
      .select('*')
      .eq('user_google_id', session.user.id)
      .order('saved_at', { ascending: false });

    if (error) {
      console.error('Supabase fetch error:', error);
      return NextResponse.json({ error: 'Failed to fetch saved articles' }, { status: 500 });
    }

    // Article 형태로 변환
    const articles = data?.map(item => ({
      id: item.id,
      title: item.article_title,
      excerpt: item.article_excerpt,
      url: item.article_url,
      publishedAt: new Date(item.article_published_at || item.saved_at),
      platform: {
        id: item.article_platform?.toLowerCase().replace(/\s+/g, '-') || 'unknown',
        name: item.article_platform || 'Unknown Platform'
      },
      author: {
        name: 'Unknown Author' // 저장된 데이터에 작성자 정보가 없으므로 기본값
      },
      tags: [], // 저장된 데이터에 태그 정보가 없으므로 빈 배열
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
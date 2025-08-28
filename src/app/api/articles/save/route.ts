import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { supabase } from '@/lib/supabase';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { article } = await request.json();
    
    if (!article?.url || !article?.title) {
      return NextResponse.json({ error: 'Invalid article data' }, { status: 400 });
    }

    // 기존 저장된 아티클 확인
    const { data: existingArticle } = await supabase
      .from('saved_articles')
      .select('id')
      .eq('user_google_id', session.user.id)
      .eq('article_url', article.url)
      .single();

    if (existingArticle) {
      return NextResponse.json({ 
        success: true, 
        data: existingArticle,
        message: 'Article already saved' 
      });
    }

    // 아티클 저장
    const { data, error } = await supabase
      .from('saved_articles')
      .insert({
        user_google_id: session.user.id,
        article_url: article.url,
        article_title: article.title,
        article_excerpt: article.excerpt || null,
        article_image: article.image || null,
        article_published_at: article.publishedAt || null,
        article_platform: article.platform || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase save error:', error);
      return NextResponse.json({ error: 'Failed to save article' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Save article error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const articleUrl = searchParams.get('url');
    
    if (!articleUrl) {
      return NextResponse.json({ error: 'Article URL required' }, { status: 400 });
    }

    // 아티클 삭제
    const { error } = await supabase
      .from('saved_articles')
      .delete()
      .eq('user_google_id', session.user.id)
      .eq('article_url', articleUrl);

    if (error) {
      console.error('Supabase delete error:', error);
      return NextResponse.json({ error: 'Failed to delete article' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete article error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
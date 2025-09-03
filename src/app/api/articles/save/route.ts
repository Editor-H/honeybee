import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { supabaseAdmin } from '@/lib/supabase';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    console.log('💾 POST /api/articles/save 호출됨');
    
    const session = await getServerSession(authOptions);
    console.log('📱 세션 상태:', session ? '로그인됨' : '로그인 안됨');
    
    if (!session?.user?.email) {
      console.log('❌ 인증 실패 - 401 반환');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { article } = await request.json();
    
    if (!article?.url || !article?.title) {
      return NextResponse.json({ error: 'Invalid article data' }, { status: 400 });
    }

    // 기존 저장된 아티클 확인
    const { data: existingArticle } = await supabaseAdmin
      .from('saved_articles')
      .select('id')
      .eq('user_google_id', session.user.email)
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
    const { data, error } = await supabaseAdmin
      .from('saved_articles')
      .insert({
        user_google_id: session.user.email,
        article_url: article.url,
        article_title: article.title,
        article_excerpt: article.excerpt || null,
        article_image: article.image || null,
        article_published_at: article.publishedAt || null,
        article_platform: article.platform || 'Unknown Platform',
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase save error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      console.error('Article data:', JSON.stringify(article, null, 2));
      return NextResponse.json({ error: 'Failed to save article', details: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Save article error:', error);
    console.error('Catch error details:', JSON.stringify(error, null, 2));
    return NextResponse.json({ error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const articleUrl = searchParams.get('url');
    
    if (!articleUrl) {
      return NextResponse.json({ error: 'Article URL required' }, { status: 400 });
    }

    // 아티클 삭제
    const { error } = await supabaseAdmin
      .from('saved_articles')
      .delete()
      .eq('user_google_id', session.user.email)
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
-- 사용자 저장 아티클 테이블 생성
CREATE TABLE IF NOT EXISTS saved_articles (
  id SERIAL PRIMARY KEY,
  user_google_id TEXT NOT NULL,
  article_url TEXT NOT NULL,
  article_title TEXT NOT NULL,
  article_excerpt TEXT,
  article_image TEXT,
  article_published_at TIMESTAMP WITH TIME ZONE,
  article_platform JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 중복 저장 방지를 위한 고유 제약
  UNIQUE(user_google_id, article_url)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_saved_articles_user_google_id ON saved_articles(user_google_id);
CREATE INDEX IF NOT EXISTS idx_saved_articles_created_at ON saved_articles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_saved_articles_published_at ON saved_articles(article_published_at DESC);

-- 업데이트 트리거 함수 (기존에 있다면 재사용)
CREATE OR REPLACE FUNCTION update_saved_articles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 업데이트 트리거
DROP TRIGGER IF EXISTS update_saved_articles_updated_at ON saved_articles;
CREATE TRIGGER update_saved_articles_updated_at
    BEFORE UPDATE ON saved_articles
    FOR EACH ROW
    EXECUTE FUNCTION update_saved_articles_updated_at();

-- RLS 정책 설정 (사용자는 본인 데이터만 접근)
ALTER TABLE saved_articles ENABLE ROW LEVEL SECURITY;

-- 사용자는 본인의 저장된 아티클만 읽기 가능
CREATE POLICY "Users can read own saved articles" ON saved_articles
  FOR SELECT USING (auth.jwt() ->> 'email' = user_google_id);

-- 사용자는 본인의 아티클만 저장 가능
CREATE POLICY "Users can insert own saved articles" ON saved_articles
  FOR INSERT WITH CHECK (auth.jwt() ->> 'email' = user_google_id);

-- 사용자는 본인의 아티클만 삭제 가능  
CREATE POLICY "Users can delete own saved articles" ON saved_articles
  FOR DELETE USING (auth.jwt() ->> 'email' = user_google_id);

-- RSS 수집용 articles 테이블에 추가 필드 (누락된 필드들 추가)
ALTER TABLE articles ADD COLUMN IF NOT EXISTS rss_source_url TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS rss_guid TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS original_categories TEXT[];

-- RSS 수집 최적화를 위한 인덱스
CREATE INDEX IF NOT EXISTS idx_articles_rss_guid ON articles(rss_guid) WHERE rss_guid IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_articles_url_unique ON articles(url);

-- RSS 아티클 중복 방지를 위한 고유 제약 (URL 기준)
-- 이미 있는 경우 에러 무시
DO $$ 
BEGIN
    ALTER TABLE articles ADD CONSTRAINT unique_article_url UNIQUE (url);
EXCEPTION
    WHEN duplicate_table THEN NULL;
END $$;
-- 아티클 저장을 위한 테이블 생성
CREATE TABLE IF NOT EXISTS articles (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  excerpt TEXT,
  url TEXT NOT NULL UNIQUE,
  
  -- 저자 정보
  author_id TEXT,
  author_name TEXT,
  author_company TEXT,
  
  -- 플랫폼 정보
  platform_id TEXT NOT NULL,
  platform_name TEXT NOT NULL,
  platform_type TEXT NOT NULL, -- 'corporate', 'personal', 'community'
  
  -- 콘텐츠 메타데이터
  content_type TEXT NOT NULL DEFAULT 'article', -- 'article' or 'video'
  category TEXT,
  tags JSONB,
  
  -- 영상 관련 필드
  video_url TEXT,
  video_duration INTEGER, -- seconds
  thumbnail_url TEXT,
  
  -- 통계
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  watch_count INTEGER DEFAULT 0, -- 영상 조회수
  reading_time INTEGER DEFAULT 0, -- minutes
  
  -- 상태
  trending BOOLEAN DEFAULT FALSE,
  featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  
  -- 타임스탬프
  published_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_platform_id ON articles(platform_id);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_content_type ON articles(content_type);
CREATE INDEX IF NOT EXISTS idx_articles_trending ON articles(trending) WHERE trending = TRUE;
CREATE INDEX IF NOT EXISTS idx_articles_active ON articles(is_active) WHERE is_active = TRUE;

-- 전문 검색을 위한 GIN 인덱스
CREATE INDEX IF NOT EXISTS idx_articles_search ON articles USING GIN (
  to_tsvector('korean', title || ' ' || COALESCE(content, '') || ' ' || COALESCE(excerpt, ''))
);

-- 태그 검색을 위한 GIN 인덱스
CREATE INDEX IF NOT EXISTS idx_articles_tags ON articles USING GIN (tags);

-- 업데이트 트리거 함수
CREATE OR REPLACE FUNCTION update_articles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 업데이트 트리거
DROP TRIGGER IF EXISTS update_articles_updated_at ON articles;
CREATE TRIGGER update_articles_updated_at
    BEFORE UPDATE ON articles
    FOR EACH ROW
    EXECUTE FUNCTION update_articles_updated_at();

-- RLS 정책 (모든 사용자가 읽기 가능)
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON articles
  FOR SELECT USING (true);

-- 서버에서만 삽입/업데이트/삭제 가능
CREATE POLICY "Allow service role full access" ON articles
  FOR ALL USING (auth.role() = 'service_role');
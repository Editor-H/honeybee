-- 캐시 데이터 저장용 테이블 생성
CREATE TABLE IF NOT EXISTS cache (
  key TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 캐시 테이블에 대한 RLS 정책 비활성화 (공용 데이터)
ALTER TABLE cache DISABLE ROW LEVEL SECURITY;

-- 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_cache_key ON cache(key);
CREATE INDEX IF NOT EXISTS idx_cache_updated_at ON cache(updated_at);
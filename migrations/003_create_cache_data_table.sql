-- cache_data 테이블 생성 (Vercel Serverless 환경에서 캐시용)
CREATE TABLE IF NOT EXISTS cache_data (
  id SERIAL PRIMARY KEY,
  cache_key TEXT UNIQUE NOT NULL,
  cache_value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_cache_data_cache_key ON cache_data(cache_key);
CREATE INDEX IF NOT EXISTS idx_cache_data_updated_at ON cache_data(updated_at);

-- RLS 정책 (공개 읽기/쓰기)
ALTER TABLE cache_data ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽기 가능
CREATE POLICY "Allow public read access on cache_data" ON cache_data
  FOR SELECT 
  TO public 
  USING (true);

-- 모든 사용자가 쓰기 가능
CREATE POLICY "Allow public insert access on cache_data" ON cache_data
  FOR INSERT 
  TO public 
  WITH CHECK (true);

-- 모든 사용자가 업데이트 가능  
CREATE POLICY "Allow public update access on cache_data" ON cache_data
  FOR UPDATE 
  TO public 
  USING (true);

-- 모든 사용자가 삭제 가능
CREATE POLICY "Allow public delete access on cache_data" ON cache_data
  FOR DELETE 
  TO public 
  USING (true);
import { createClient } from '@supabase/supabase-js'

// 서버사이드 전용 Supabase 클라이언트 (NextAuth 간섭 없음)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jzrpymagpusrzfcjxqye.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6cnB5bWFncHVzcnpmY2p4cXllIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjE0ODAzNywiZXhwIjoyMDcxNzI0MDM3fQ.ICDnE6-Rd2XsdVmV843HzCKXEu0u6kLj8e16FAX64RU'

export const supabaseServer = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})
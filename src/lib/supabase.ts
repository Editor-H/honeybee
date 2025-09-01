import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jzrpymagpusrzfcjxqye.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6cnB5bWFncHVzcnpmY2p4cXllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxNDgwMzcsImV4cCI6MjA3MTcyNDAzN30.MSh94fnoPL0j8LxP7NaXMGaMK4HQTkjnZEPBCOzMI7Q'

console.log('Supabase Config:', { url: supabaseUrl, keyPrefix: supabaseAnonKey.substring(0, 20) + '...' })

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
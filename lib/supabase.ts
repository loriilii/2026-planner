import { createClient } from '@supabase/supabase-js'

// 這兩行會自動去抓你在 Vercel 設定的「環境變數」
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// 建立並匯出連線工具
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

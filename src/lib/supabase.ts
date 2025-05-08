import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { Database } from '../types/supabase'

// ตรวจสอบว่า environment variables มีค่าหรือไม่
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// ตรวจสอบว่า URL และ key มีค่าหรือไม่
if (!supabaseUrl) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL is required')
}

if (!supabaseAnonKey) {
  throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is required')
}

// Client ปกติสำหรับการใช้งานทั่วไป
export const supabase: SupabaseClient<Database> = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey
)

// Client ที่มีสิทธิ์ admin สำหรับการจัดการข้อมูลพิเศษ
export const supabaseAdmin: SupabaseClient<Database> | null =
  supabaseServiceRoleKey
    ? createClient<Database>(supabaseUrl, supabaseServiceRoleKey)
    : null

export default supabase

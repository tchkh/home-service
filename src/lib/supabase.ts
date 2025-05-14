import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { env } from '../config/env'

// สร้าง Supabase client สำหรับการใช้งานทั่วไป
export const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// สร้าง Supabase admin client สำหรับการจัดการข้อมูลพิเศษ
export const supabaseAdmin = env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)
  : null

/**
 * ฟังก์ชันสำหรับใช้งาน supabaseAdmin อย่างปลอดภัย
 * @param callback ฟังก์ชันที่จะทำงานกับ supabaseAdmin
 * @param fallback ฟังก์ชันที่จะทำงานเมื่อไม่มี supabaseAdmin
 */
export async function withAdmin<T>(
  callback: (admin: SupabaseClient) => Promise<T>,
  fallback?: () => Promise<T> | T
): Promise<T> {
  if (!supabaseAdmin) {
    if (fallback) {
      return await fallback()
    }
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for this operation')
  }
  return await callback(supabaseAdmin)
}
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { env } from '../config/env'

// สร้าง Supabase client สำหรับการใช้งานทั่วไป
export const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// สร้าง Supabase admin client สำหรับการจัดการข้อมูลพิเศษ
export const supabaseAdmin = env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)
  : null

/**
 * ฟังก์ชันสำหรับใช้งาน supabaseAdmin อย่างปลอดภัย
 * @param callback ฟังก์ชันที่จะทำงานกับ supabaseAdmin
 * @param fallback ฟังก์ชันที่จะทำงานเมื่อไม่มี supabaseAdmin
 */
export async function withAdmin<T>(
  callback: (admin: SupabaseClient) => Promise<T>,
  fallback?: () => Promise<T> | T
): Promise<T> {
  if (!supabaseAdmin) {
    if (fallback) {
      return await fallback()
    }
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for this operation')
  }
  return await callback(supabaseAdmin)
}

export default supabase
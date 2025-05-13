// ไฟล์สำหรับจัดการ environment variables
import { z } from 'zod'

// สร้าง schema สำหรับตรวจสอบ environment variables
const envSchema = z.object({
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z
    .string()
    .min(1, 'NEXT_PUBLIC_SUPABASE_URL is required'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .min(1, 'NEXT_PUBLIC_SUPABASE_ANON_KEY is required'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),

  // อื่นๆ (เพิ่มเติมตามต้องการ)
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
})

// ฟังก์ชันสำหรับตรวจสอบและดึงค่า environment variables
export function getEnv() {
  // ตรวจสอบว่าเป็น server-side หรือไม่
  const isServer = typeof window === 'undefined'

  try {
    // ตรวจสอบและแปลงค่า environment variables
    const env = envSchema.parse({
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: isServer
        ? process.env.SUPABASE_SERVICE_ROLE_KEY
        : undefined,
      NODE_ENV: process.env.NODE_ENV,
    })

    return env
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map(e => e.message).join(', ')
      throw new Error(`Missing environment variables: ${missingVars}`)
    }
    throw error
  }
}

// ดึงค่า environment variables
export const env = getEnv()

import type { NextApiRequest, NextApiResponse } from 'next'
import bcrypt from 'bcrypt'
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs'
import { withAdmin } from '../../../lib/supabase'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' })
  }

  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email และรหัสผ่านจำเป็นต้องระบุ',
      })
    }

    // 1. ค้นหาผู้ใช้จากอีเมล
    const { data: userData, error: userError } = await withAdmin(
      async admin => {
        return await admin.from('users').select('*').eq('email', email).single()
      }
    )

    if (userError || !userData) {
      return res.status(401).json({
        success: false,
        error: 'ไม่พบบัญชีผู้ใช้',
      })
    }

    // 2. ค้นหา backup auth record
    const { data: backupAuth, error: backupError } = await withAdmin(
      async admin => {
        return await admin
          .from('user_backup_auth')
          .select('*')
          .eq('id', userData.id)
          .single()
      }
    )

    if (backupError || !backupAuth) {
      return res.status(401).json({
        success: false,
        error: 'ไม่พบข้อมูลการยืนยันตัวตนสำรอง',
      })
    }

    // 3. ตรวจสอบรหัสผ่าน
    const passwordMatch = await bcrypt.compare(password, backupAuth.backup_hash)

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        error: 'รหัสผ่านไม่ถูกต้อง',
      })
    }

    // 4. สร้าง session ด้วย Supabase (ถ้าเป็นไปได้)
    try {
      const supabase = createPagesServerClient({ req, res })
      await supabase.auth.signInWithPassword({
        email,
        password,
      })
    } catch (sessionError) {
      console.error('ไม่สามารถสร้าง session ได้:', sessionError)
      // ดำเนินการต่อแม้จะไม่สามารถสร้าง session ได้
    }

    // 5. สร้าง token สำหรับ fallback authentication
    const fallbackToken = require('crypto').randomBytes(32).toString('hex')

    // 6. อัปเดต recovery token
    await withAdmin(async admin => {
      return await admin
        .from('user_backup_auth')
        .update({
          recovery_token: fallbackToken,
          last_updated: new Date().toISOString(),
        })
        .eq('id', userData.id)
    })

    // 7. ส่ง response กลับ
    return res.status(200).json({
      success: true,
      message: 'เข้าสู่ระบบสำเร็จ',
      token: fallbackToken,
      user: {
        id: userData.id,
        email: userData.email,
        firstName: userData.first_name,
        lastName: userData.last_name,
      },
    })
  } catch (error: any) {
    console.error('Error in fallback login:', error)
    return res.status(500).json({
      success: false,
      error: error.message || 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
    })
  }
}

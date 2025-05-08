import type { NextApiRequest, NextApiResponse } from 'next'
import supabase, { supabaseAdmin } from '../../../lib/supabase'
import bcrypt from 'bcrypt'
import crypto from 'crypto'

interface RegisterResponseSuccess {
  success: true
  message: string
  user: unknown
}

interface RegisterResponseError {
  success: false
  message: string
}

type RegisterResponse = RegisterResponseSuccess | RegisterResponseError

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<RegisterResponse>
) {
  if (req.method !== 'POST') {
    return res
      .status(405)
      .json({ success: false, message: 'Method Not Allowed' })
  }

  try {
    // ตรวจสอบว่ามี supabaseAdmin หรือไม่
    if (!supabaseAdmin) {
      console.error(
        'SUPABASE_SERVICE_ROLE_KEY is missing - cannot perform admin operations'
      )
      return res.status(500).json({
        success: false,
        message: 'Server configuration error - missing admin credentials',
      })
    }

    const { name, email, password, tel, imageUrl } = req.body

    if (!name || !email || !password || !tel) {
      return res.status(400).json({
        success: false,
        message: 'กรุณาระบุชื่อ, อีเมล, รหัสผ่าน และหมายเลขโทรศัพท์',
      })
    }

    function splitName(fullName: string): {
      firstName: string
      lastName: string
    } {
      const trimmedName = fullName.trim()
      const lastSpaceIndex = trimmedName.lastIndexOf(' ')
      if (lastSpaceIndex === -1) {
        return {
          firstName: trimmedName,
          lastName: '',
        }
      }
      const firstName = trimmedName.substring(0, lastSpaceIndex)
      const lastName = trimmedName.substring(lastSpaceIndex + 1)
      return { firstName, lastName }
    }

    const { firstName, lastName } = splitName(name)

    function validateEmail(email: string): boolean {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
      return emailRegex.test(email)
    }

    if (!validateEmail(email)) {
      return res
        .status(400)
        .json({ success: false, message: 'รูปแบบอีเมลไม่ถูกต้อง' })
    }

    // 1. ลงทะเบียนผ่าน Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    })

    if (authError) {
      return res.status(400).json({
        success: false,
        message: authError.message,
      })
    }

    if (!authData.user?.id) {
      return res.status(500).json({
        success: false,
        message: 'เกิดข้อผิดพลาดในการลงทะเบียน: ไม่มี User ID',
      })
    }

    // 2. เพิ่มข้อมูลในตาราง users
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert([
        {
          id: authData.user.id,
          first_name: firstName,
          last_name: lastName,
          email,
          tel,
          image_url: imageUrl || null,
        },
      ])

    if (userError) {
      console.error('Error creating user profile:', userError)
      return res.status(400).json({
        success: false,
        message: userError.message,
      })
    }

    // 3. สร้าง backup authentication record โดยใช้ supabaseAdmin
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)
    const recoveryToken = crypto.randomBytes(32).toString('hex')

    const { error: backupError } = await supabaseAdmin
      .from('user_backup_auth')
      .insert({
        id: authData.user.id,
        backup_hash: passwordHash,
        recovery_token: recoveryToken,
        last_updated: new Date().toISOString(),
      })

    if (backupError) {
      console.error('Failed to create backup auth:', backupError)
      // ตรวจสอบว่า error เกิดจาก RLS หรือไม่
      if (backupError.message.includes('permission denied')) {
        console.error(
          'This may be a Row Level Security (RLS) issue - check your policies'
        )
      }
    }

    return res.status(201).json({
      success: true,
      message: 'ลงทะเบียนผู้ใช้สำเร็จ โปรดตรวจสอบอีเมลเพื่อยืนยันบัญชี',
      user: authData.user,
    })
  } catch (error: any) {
    console.error('เกิดข้อผิดพลาดในการลงทะเบียน:', error)
    return res.status(500).json({
      success: false,
      message: error.message || 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
    })
  }
}

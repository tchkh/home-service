import type { NextApiRequest, NextApiResponse } from 'next'
import supabase from '../../../lib/supabase'
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

interface UserBackupAuth {
  id: string // user ID จาก auth.users
  backup_hash: string // รหัสผ่านที่เข้ารหัสด้วย bcrypt
  recovery_token: string // token สำหรับกู้คืนบัญชี
  last_updated: Date
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
      // Trim the input to remove extra spaces
      const trimmedName = fullName.trim()

      // Find the position of the last space in the name
      const lastSpaceIndex = trimmedName.lastIndexOf(' ')

      // If there's no space, return the whole string as firstName and empty string as lastName
      if (lastSpaceIndex === -1) {
        return {
          firstName: trimmedName,
          lastName: '',
        }
      }

      // Extract firstName and lastName based on the position of the last space
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

    // เพิ่มข้อมูลผู้ใช้ใน Supabase
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert([
        {
          first_name: firstName,
          last_name: lastName,
          email,
          tel,
          image_url: imageUrl,
        },
      ])

    if (userError) {
      return res.status(400).json({
        success: false,
        message: userError.message,
      })
    }

    // ใช้ Supabase สำหรับการลงทะเบียน
    const { data: authData, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    })

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      })
    }

    // สร้าง backup authentication record
    const passwordHash = await bcrypt.hash(password, 10)
    const recoveryToken = crypto.randomBytes(32).toString('hex')

    const { error: backupError } = await supabase
      .from('user_backup_auth')
      .insert({
        id: authData.user?.id,
        backup_hash: passwordHash,
        recovery_token: recoveryToken,
        last_updated: new Date(),
      })

    if (backupError) {
      console.error('Failed to create backup auth:', backupError)
      // ส่งรายงานข้อผิดพลาดแต่ไม่ต้องยกเลิกการลงทะเบียน
    }

    return res.status(201).json({
      success: true,
      message: 'ลงทะเบียนผู้ใช้สำเร็จ โปรดตรวจสอบอีเมลเพื่อยืนยันบัญชี',
      user: authData.user,
    })
  } catch (error: unknown) {
    console.error('เกิดข้อผิดพลาดในการลงทะเบียน:', error)
    return res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
    })
  }
}

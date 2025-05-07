import type { NextApiRequest, NextApiResponse } from 'next'
import supabase from '../../../lib/supabase'

interface LoginResponseSuccess {
  success: true
  message: string
  user: any
  token: string
}

interface LoginResponseError {
  success: false
  message: string
}

type LoginResponse = LoginResponseSuccess | LoginResponseError

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LoginResponse>
) {
  if (req.method !== 'POST') {
    return res
      .status(405)
      .json({ success: false, message: 'Method Not Allowed' })
  }

  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email และ password จำเป็นต้องระบุ',
      })
    }

    // ใช้ Supabase สำหรับการเข้าสู่ระบบ
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return res.status(401).json({
        success: false,
        message: error.message,
      })
    }

    return res.status(200).json({
      success: true,
      message: 'เข้าสู่ระบบสำเร็จ',
      user: data.user,
      token: data.session.access_token,
    })
  } catch (error: any) {
    console.error('เกิดข้อผิดพลาดในการเข้าสู่ระบบ:', error)
    return res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
    })
  }
}

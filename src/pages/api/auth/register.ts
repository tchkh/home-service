import type { NextApiRequest, NextApiResponse } from 'next'
import { registerUser } from '../../../services/auth-service'
import {
  sendSuccess,
  sendError,
  ApiResponse,
} from '../../../utils/api-response'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  if (req.method !== 'POST') {
    return sendError(res, 'Method Not Allowed', 405)
  }

  try {
    const { name, email, password, tel, imageUrl } = req.body

    // เรียกใช้ service สำหรับการลงทะเบียน
    const user = await registerUser({
      name,
      email,
      password,
      tel,
      imageUrl,
    })

    // ส่ง response สำเร็จ
    return sendSuccess(
      res,
      'ลงทะเบียนผู้ใช้สำเร็จ โปรดตรวจสอบอีเมลเพื่อยืนยันบัญชี',
      { user },
      201
    )
  } catch (error: any) {
    console.error('เกิดข้อผิดพลาดในการลงทะเบียน:', error)

    // ส่ง response ข้อผิดพลาด
    return sendError(
      res,
      error.message || 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
      error.status || 500
    )
  }
}

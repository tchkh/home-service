import type { NextApiRequest, NextApiResponse } from 'next'
import { registerUser } from '../../../services/auth-service'
import {
  sendSuccess,
  sendError,
  ApiResponse,
} from '../../../utils/api-response'

// ประกาศ interface สำหรับ error
interface ApiError extends Error {
  status?: number
  code?: string
}

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
  } catch (error: unknown) {
    console.error('เกิดข้อผิดพลาดในการลงทะเบียน:', error)

    // ตรวจสอบว่า error เป็น Error object หรือไม่
    if (error instanceof Error) {
      // เช็คว่ามี status property หรือไม่ (custom property)
      const apiError = error as ApiError

      // ส่ง response ข้อผิดพลาด
      return sendError(
        res,
        apiError.message || 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
        apiError.status || 500
      )
    }

    // กรณีที่ error ไม่ใช่ Error object
    return sendError(res, 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์', 500)
  }
}

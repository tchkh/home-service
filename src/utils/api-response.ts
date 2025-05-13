import { NextApiResponse } from 'next'

// ประเภทของ API response สำหรับการส่งข้อมูลสำเร็จ
export interface ApiSuccessResponse<T = unknown> {
  success: true
  message: string
  data?: T
}

// ประเภทของ API response สำหรับการส่งข้อผิดพลาด
export interface ApiErrorResponse {
  success: false
  message: string
}

// ประเภทของ API response ทั้งหมด
export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse

/**
 * ส่ง response สำเร็จ
 * @param res NextApiResponse object
 * @param message ข้อความแสดงผล
 * @param data ข้อมูลที่ต้องการส่งกลับ (optional)
 * @param statusCode รหัสสถานะ HTTP (ค่าเริ่มต้นคือ 200)
 */
export function sendSuccess<T = unknown>(
  res: NextApiResponse,
  message: string,
  data?: T,
  statusCode: number = 200
): void {
  res.status(statusCode).json({
    success: true,
    message,
    ...(data !== undefined ? { data } : {}),
  } as ApiSuccessResponse<T>)
}

/**
 * ส่ง response ข้อผิดพลาด
 * @param res NextApiResponse object
 * @param message ข้อความแสดงข้อผิดพลาด
 * @param statusCode รหัสสถานะ HTTP (ค่าเริ่มต้นคือ 400)
 */
export function sendError(
  res: NextApiResponse,
  message: string,
  statusCode: number = 400
): void {
  res.status(statusCode).json({
    success: false,
    message,
  } as ApiErrorResponse)
}

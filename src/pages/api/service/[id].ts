import { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

// สร้าง Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // รองรับเฉพาะ GET method
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
    })
  }

  try {
    // ดึง id จาก query parameters
    const { id } = req.query

    // ตรวจสอบว่ามี id หรือไม่
    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Service ID is required',
      })
    }

    // ดึงข้อมูลจาก Supabase
    const { data, error } = await supabase
      .from('services_details')
      .select('*')
      .eq('service_id', id)
      .eq('sub_service_status', 'active')
      .order('price', { ascending: true })

    // ตรวจสอบ error จาก Supabase
    if (error) {
      console.error('Supabase error:', error)
      return res.status(500).json({
        success: false,
        message: 'Database error',
        error: error.message,
      })
    }

    // เช็คว่าพบข้อมูลหรือไม่
    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        message: `ไม่พบข้อมูลบริการสำหรับ Service ID: ${id}`,
      })
    }

    // ส่งข้อมูลกลับ
    return res.status(200).json(data)
  } catch (error) {
    console.error('API error:', error)
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    })
  }
}

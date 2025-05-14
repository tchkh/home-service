import { NextApiRequest, NextApiResponse } from 'next'
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { email, password } = req.body
    console.log('Attempting login with:', email) // เพิ่ม log

    // 1. ทำการ login ด้วย supabase auth
    const supabase = createPagesServerClient({ req, res })
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      console.log('Auth error:', authError.message)
      return res.status(400).json({ message: authError.message })
    }

    // 2. ตรวจสอบว่าเป็น admin หรือไม่
    const { data: adminData, error: adminError } = await supabase
      .from('admins')
      .select('*')
      .eq('email', email)
      .single()

    console.log('Admin check:', { adminData, adminError, email })

    // ถ้าไม่พบในตาราง admins หรือมี error
    if (adminError || !adminData) {
      // ทำการ sign out เพราะไม่ใช่ admin
      await supabase.auth.signOut()
      return res
        .status(403)
        .json({ message: 'คุณไม่มีสิทธิ์เข้าใช้งานส่วนของผู้ดูแลระบบ' })
    }

    // 3. ถ้าทุกอย่างผ่าน ส่งข้อมูลสำเร็จกลับไป
    return res.status(200).json({
      success: true,
      user: data.user,
    })
  } catch (error: any) {
    console.error('Login handler error:', error)
    return res
      .status(500)
      .json({ message: error.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' })
  }
}

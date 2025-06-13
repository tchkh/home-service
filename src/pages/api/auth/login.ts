import { createPagesServerClient } from '@supabase/auth-helpers-nextjs'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  try {
    const { email, password } = req.body
    if (!email || !password) {
      res.status(400).json({ error: 'Missing email or password' })
      return
    }

    const supabase = createPagesServerClient({ req, res })

    // 1. Authenticate with supabase auth
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      return res.status(400).json({ error: authError.message })
    }

    // 2. Check if user exists in users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    // If not found in users table or error occurred
    if (userError || !userData) {
      // Sign out since user is not in users table
      await supabase.auth.signOut()
      return res
        .status(403)
        .json({ error: 'คุณไม่มีสิทธิ์เข้าใช้งานส่วนของผู้ใช้บริการ' })
    }

    // 3. If everything passes, return success
    return res.status(200).json({
      success: true,
      user: data.user,
    })
  } catch {
    return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' })
  }
}

import type { NextApiRequest, NextApiResponse } from 'next'
import supabase, { supabaseAdmin } from '@/lib/supabase'
import { splitName } from '@/utils/string-utils'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      throw new Error('กรุณาระบุชื่อ, อีเมล และรหัสผ่าน')
    }

    const { firstName, lastName } = splitName(name)

    const { data: adminData, error: adminError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (adminError) {
      throw new Error(adminError.message)
    }

    if (!adminData.user?.id) {
      throw new Error('เกิดข้อผิดพลาดในการลงทะเบียน: ไม่มี User ID')
    }

    const { error } = await supabaseAdmin.from('admins').insert([
      {
        id: adminData.user.id,
        first_name: firstName,
        last_name: lastName,
        email,
      },
    ])

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    return res.status(200).json({ success: true, adminData })
  } catch (error) {
    console.error('Error updating user role:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

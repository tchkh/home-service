import { NextApiRequest, NextApiResponse } from "next";
import { createPagesServerClient } from "@supabase/auth-helpers-nextjs";

export default async function technicianLogin(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }
    try {
        const { email, password } = req.body

        const supabase = createPagesServerClient({ req, res })
        const { data, error: authError} = await supabase.auth.signInWithPassword({
            email,
            password
        })

        if (authError) {
            return res.status(400).json({ message: authError.message })
        }

        const { data: technicianData, error: technicianError } = await supabase
        .from('technicians')
        .select('*')
        .eq('email', email)
        .single()

        if ( technicianError || !technicianData ) {
            await supabase.auth.signOut()
            return res.status(403).json({ message: 'คุณไม่มีสิทธิ์เข้าใช้งานส่วนของผู้ดูแลระบบ' })
        }

        return res.status(200).json({ 
            success: true,
            user : data.user
        })
    } catch {
        return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' })
    }
}
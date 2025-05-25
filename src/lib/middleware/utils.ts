//lib/middlware/utils
import { NextApiRequest, NextApiResponse } from "next";
import { createSupabaseServerClient } from "../supabase/server";


// ตรวจสอบ session ของผู้ใช้
export async function getSession(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createSupabaseServerClient({ req, res });
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Error fetching session:', error);
      return null;
    }
    return session;
  } catch (error) {
    console.error('Error in getSession:', error);
    return null;
  }
}


// ตรวจสอบว่าผู้ใช้เป็น admin หรือไม่


// ตรวจสอบว่าผู้ใช้เป็น technician หรือไม่


// ดึงข้อมูลผู้ใช้จาก session


// ตรวจสอบ role ของผู้ใช้ (user, admin, technician)


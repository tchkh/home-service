import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextRequest, NextResponse } from "next/server";

// คืนทั้ง session และ supabase client จาก middleware
export async function getSessionFromMiddleware(req: NextRequest, res: NextResponse) {
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();


  return { session, supabase };
}

// ตรวจสอบว่าผู้ใช้เป็น admin หรือไม่
export async function isAdmin(req: NextRequest, res: NextResponse) {
  const { session, supabase } = await getSessionFromMiddleware(req, res);
  
  if (!session?.user?.id) {
    return false;
  }
  
  try {
    // ค้นหาในตาราง admins
    const { data: admin, error } = await supabase
      .from('admins')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (error || !admin) {
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

// ตรวจสอบว่าผู้ใช้เป็น technician หรือไม่
export async function isTechnician(req: NextRequest, res: NextResponse) {
  const { session, supabase } = await getSessionFromMiddleware(req, res);
  
  if (!session?.user?.id) {
    return false;
  }
  
  try {
    // ค้นหาในตาราง technicians
    const { data: technician, error } = await supabase
      .from('technicians')
      .select('*')
      .eq('id', session.user.id)
      .single();
    
    if (error || !technician) {
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error checking technician status:', error);
    return false;
  }
}


// ดึงข้อมูลผู้ใช้จาก session
export async function getUserFromSession(req: NextRequest, res: NextResponse) {
  const { session } = await getSessionFromMiddleware(req, res);
  return session?.user || null;
}

// ตรวจสอบ role ของผู้ใช้ (user, admin, technician)
export async function getUserRole(req: NextRequest, res: NextResponse) {
  try {
    const { session } = await getSessionFromMiddleware(req, res);
    
    if (!session) {
      return null;
    }

    if (await isAdmin(req, res)) {
      return 'admin';
    }

    if (await isTechnician(req, res)) {
      return 'technician';
    }

    return 'user';
  } catch (error) {
    console.error('[utils] Error in getUserRole:', error);
    return null;
  }
}

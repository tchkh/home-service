// lib/middleware/authRedirect
import { NextRequest, NextResponse } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { isTechnician, isAdmin } from "./utils";

export async function authRedirectMiddleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const url = req.nextUrl.clone();

  if (!session) return res;

  // ถ้ามี session แล้ว ให้ redirect ตาม role และหน้าที่เข้ามา
  switch (url.pathname) {
    case '/login':
    case '/register':
      url.pathname = '/';
      return NextResponse.redirect(url);

    case '/technician/login':
      // ตรวจสอบว่าเป็น technician หรือไม่
      const technicianStatus = await isTechnician(req, res);
      if (technicianStatus) {
        // ถ้าเป็น technician ให้ไปหน้า technician
        url.pathname = '/technician/service-request';
      } else {
        // ถ้าไม่ใช่ technician ให้ไปหน้าแรก
        url.pathname = '/';
      }
      return NextResponse.redirect(url);

    case '/admin/login':
      // ตรวจสอบว่าเป็น admin หรือไม่
      const adminStatus = await isAdmin(req, res);
      if (adminStatus) {
        url.pathname = '/admin/categories';
      } else {
        url.pathname = '/';
      }
      return NextResponse.redirect(url);

    default:
      return res;
  }
}

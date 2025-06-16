import { NextRequest, NextResponse } from "next/server";
import { getSessionFromMiddleware, isAdmin } from "./utils";

export default async function requireAdminMiddleware(req: NextRequest) {
    const res = NextResponse.next();
    const { session } = await getSessionFromMiddleware(req, res);
    const url = req.nextUrl.clone();

  if (!session) {
    const returnUrl = encodeURIComponent(req.nextUrl.pathname);
    url.pathname = "/admin/login";
    url.searchParams.set("returnUrl", returnUrl);

    return NextResponse.redirect(url);
  }

  // ตรวจสอบว่าเป็น admin หรือไม่
    const adminnStatus = await isAdmin(req, res);
    console.log("Admin status:", adminnStatus);

    // ถ้าไม่ใช่ admin แต่มี session (login แล้ว)
    if (!adminnStatus) {
      // ทางเลือก 1: Redirect ไปที่หน้า home
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
}
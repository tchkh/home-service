import { NextRequest, NextResponse } from "next/server";
import { getSessionFromMiddleware, isTechnician } from "./utils";

export default async function requireTechnicianMiddleware(req: NextRequest) {
  const res = NextResponse.next();
  const { session } = await getSessionFromMiddleware(req, res);
  const url = req.nextUrl.clone();

  if (!session) {
    const returnUrl = encodeURIComponent(req.nextUrl.pathname);
    url.pathname = "/technician/login";
    url.searchParams.set("returnUrl", returnUrl);

    return NextResponse.redirect(url);
  }

  // ตรวจสอบว่าเป็น technician หรือไม่
  const technicianStatus = await isTechnician(req, res);
  console.log("Technician status:", technicianStatus);

  // ถ้าไม่ใช่ technician แต่มี session (login แล้ว)
  if (!technicianStatus) {
    // ทางเลือก 1: Redirect ไปที่หน้า home
    url.pathname = "/";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

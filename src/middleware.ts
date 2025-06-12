// src/middlware.ts
import { NextRequest, NextResponse } from "next/server";
import { authRedirectMiddleware } from "@/lib/middleware/authRedirect";
import { protectApiMiddleware } from "./lib/middleware/protectApi";
import requireAuthMiddleware from "@/lib/middleware/requireAuth";
import requireTechnicianMiddleware from "./lib/middleware/requireTechnician";
import requireAdminMiddleware from "./lib/middleware/requireAdmin";
import { getUserRole } from "./lib/middleware/utils";

const AUTH_ROUTES = ["/register", "/login", "/technician/login", "/admin/login"];
const PROTECTED_ROUTES = ['/user/profile', '/user/history', '/user/repair']; // ต้อง login ก่อน
const TECHNICIAN_ROUTES = ['/technician/service-request', '/technician/pending', '/technician/history', '/technician/account-setting']; // ต้องเป็น technician
const ADMIN_ROUTES = ['/admin/services', '/admin/services/:path*', '/admin/categories', '/admin/categories/:path*']; // ต้องเป็น admin

// Redirect targets for each role
const DEFAULT_REDIRECTS: Record<string, string> = {
  technician: "/technician/service-request",
  admin: "/admin/categories",
};

// Utils to match paths
const isExactOrStartsWith = (pathname: string, routes: string[]) =>
  routes.some(route => pathname === route || pathname.startsWith(`${route}/`));

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const res = NextResponse.next();

  // 1. ตรวจสอบ auth routes (/login, /register) สำหรับผู้ใช้ที่ login แล้ว
  if (AUTH_ROUTES.includes(pathname)) {
    return await authRedirectMiddleware(req);
  }

  // 2. ตรวจสอบ API profile route สำหรับการป้องกัน API
  if (pathname.startsWith("/api/profile")) {
    return await protectApiMiddleware(req);
  }

  // 3. GET USER ROLE FIRST
  let role = null;
  try {
    role = await getUserRole(req, res);
  } catch (error) {
    console.error('[middleware] Error getting user role:', error);
  }

  // 4. ตรวจสอบ role mis-access ก่อน role-specific protections
  
  if (pathname.startsWith("/user")) {
    if (role === "technician" || role === "admin") {
      const url = req.nextUrl.clone();
      url.pathname = DEFAULT_REDIRECTS[role] || "/";
      return NextResponse.redirect(url);
    }
  }

  if (pathname.startsWith("/technician")) {
    if (role === "user" || role === "admin") {
      const url = req.nextUrl.clone();
      url.pathname = DEFAULT_REDIRECTS[role] || "/";
      return NextResponse.redirect(url);
    }
  }

  if (pathname.startsWith("/admin")) {
    if (role === "user" || role === "technician") {
      const url = req.nextUrl.clone();
      url.pathname = DEFAULT_REDIRECTS[role] || "/";
      return NextResponse.redirect(url);
    }
  }

  // 5. Role-specific route protections
  if (isExactOrStartsWith(pathname, ADMIN_ROUTES)) {
    return await requireAdminMiddleware(req);
  }

  if (isExactOrStartsWith(pathname, TECHNICIAN_ROUTES)) {
    return await requireTechnicianMiddleware(req);
  }

  if (isExactOrStartsWith(pathname, PROTECTED_ROUTES)) {
    return await requireAuthMiddleware(req);
  }

  // 8. Redirect homepage by role
  if (pathname === "/" && (role === "technician" || role === "admin")) {
    const url = req.nextUrl.clone();
    url.pathname = DEFAULT_REDIRECTS[role];
    return NextResponse.redirect(url);
  }

  return res;
}

export const config = {
  matcher: [
    "/",
    "/register", 
    "/login", 
    "/technician/login",
    "/admin/login", 
    "/api/profile", 
    "/user/:path*", 
    "/technician/:path*",
    "/admin/:path*",
  ],
};
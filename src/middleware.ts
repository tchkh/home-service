// src/middlware.ts
import { NextRequest, NextResponse } from "next/server";
import { authRedirectMiddleware } from "@/lib/middleware/authRedirect";
import { protectApiMiddleware } from "./lib/middleware/protectApi";

const AUTH_ROUTES = ["/register", "/login"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (AUTH_ROUTES.includes(pathname)) {
    return await authRedirectMiddleware(req);
  }

  if (pathname.startsWith("/api/profile")) {
    return await protectApiMiddleware(req);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/register", "/login", "/api/profile"],
};

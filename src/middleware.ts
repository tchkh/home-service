import { NextRequest, NextResponse} from "next/server";
import { authRedirectMiddleware } from "@/lib/middleware/authRedirect";

const AUTH_ROUTES = ['/register', '/login'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (AUTH_ROUTES.some(route => pathname === route)) {
    return await authRedirectMiddleware(req);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    ...AUTH_ROUTES,
  ],
};






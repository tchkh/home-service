import { NextRequest, NextResponse } from "next/server";
import { getSessionFromMiddleware } from "./utils";

export default async function requireAuthMiddleware(req: NextRequest) {
  const res = NextResponse.next();
  const { session } = await getSessionFromMiddleware(req, res);
  const url = req.nextUrl.clone();

  if (!session) {
    const returnUrl = encodeURIComponent(req.nextUrl.pathname);
    url.pathname = '/login';
    url.searchParams.set('returnUrl', returnUrl);

    return NextResponse.redirect(url);
  }

  return res;
}


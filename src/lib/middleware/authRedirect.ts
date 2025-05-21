import { NextRequest, NextResponse } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

export async function authRedirectMiddleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const url = req.nextUrl.clone()
  if (session && ['/register', '/login'].includes(url.pathname)) {
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  return res
}

import { createPagesServerClient } from '@supabase/auth-helpers-nextjs'
import type { NextApiRequest, NextApiResponse } from 'next'
import type { IncomingMessage, ServerResponse } from 'http'

type SupabaseServerContext =
  | { req: NextApiRequest; res: NextApiResponse } // ✅ API Routes
  | {
      req: IncomingMessage & { cookies: Partial<Record<string, string>> }
      res: ServerResponse
    } // ✅ getServerSideProps

export const createSupabaseServerClient = ({
  req,
  res,
}: SupabaseServerContext) => {
  return createPagesServerClient({
    req: req as NextApiRequest,
    res: res as NextApiResponse,
  })
}

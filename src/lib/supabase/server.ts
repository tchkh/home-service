import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';
import type { NextApiRequest, NextApiResponse } from 'next';
import type { IncomingMessage, ServerResponse } from 'http';

type SupabaseServerContext = 
  | { req: NextApiRequest; res: NextApiResponse }
  | { req: IncomingMessage & { cookies: Partial<Record<string, string>> }; res: ServerResponse };

export const createSupabaseServerClient = ({ req, res }: SupabaseServerContext) => {
  return createPagesServerClient({
    req: req as NextApiRequest,
    res: res as NextApiResponse
  });
};

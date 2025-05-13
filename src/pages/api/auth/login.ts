import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: "Missing email or password" });
    return;
  }
  const supabase = createPagesServerClient({ req, res})
  const { error} = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) {
    res.status(401).json({ error: error.message });
    return;
  }
  
  res.status(200).json({ message: "Logged in" });
}

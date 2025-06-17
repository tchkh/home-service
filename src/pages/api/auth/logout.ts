import type { NextApiRequest, NextApiResponse } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const supabase = createSupabaseServerClient({ req, res });
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.log(error.message);
    return res.status(500).json({ error: error.message });
  }
  return res.status(200).json({ message: "Logged out" });
}

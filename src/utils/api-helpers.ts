import { NextApiRequest, NextApiResponse } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// ฟังก์ชันสำหรับดึง session และ supabase client
export async function getAuthenticatedClient(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const supabase = createSupabaseServerClient({ req, res });
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      res.status(401).json({ error: "Unauthorized: No active session" });
      return null;
    }

    return { session, supabase };
  } catch (error) {
    console.error("Error in acceptJob:", error);
    res.status(500).json({
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    });
    return null;
  }
}

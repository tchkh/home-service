import { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase";

// Disable body parsing (though no body expected)
export const config = { api: { bodyParser: false } };

// Schema for query parameters
type DeleteResponse = { message: string } | { error: string };
const ServiceIdSchema = z.object({
  serviceId: z.string(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<DeleteResponse>
) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // Validate query
  let serviceId: string;
  try {
    ({ serviceId } = ServiceIdSchema.parse(req.query));
  } catch {
    return res.status(400).json({ error: "Invalid serviceId" });
  }

  if (!supabaseAdmin) {
    return res.status(500).json({ error: "Supabase Admin is not initialized" });
  }

  try {
    // Delete sub_services first
    const { error: delSubErr } = await supabaseAdmin
      .from("sub_services")
      .delete()
      .eq("service_id", serviceId);
    if (delSubErr) {
      console.error("Error deleting sub_services:", delSubErr);
      throw delSubErr;
    }

    // Delete service
    const { error: delSvcErr } = await supabaseAdmin
      .from("services")
      .delete()
      .eq("id", serviceId);
    if (delSvcErr) {
      console.error("Error deleting service:", delSvcErr);
      throw delSvcErr;
    }

    return res
      .status(200)
      .json({ message: `Service ${serviceId} deleted successfully` });
  } catch (error: unknown) {
    console.error("Error in deleteServiceById:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal Server Error";
    return res
      .status(500)
      .json({ error: errorMessage });
  }
}

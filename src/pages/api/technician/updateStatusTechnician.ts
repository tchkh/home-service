import { NextApiRequest, NextApiResponse } from "next";
import { getAuthenticatedClient } from "@/utils/api-helpers";

export default async function updateStatusTechnician(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "PUT") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const authResult = await getAuthenticatedClient(req, res);

    if (!authResult) {
      return; // response ถูกส่งไปแล้วใน getAuthenticatedClient
    }

    const { session, supabase } = authResult;
    const technicianId = session.user.id;

    const { data: technicianData, error: technicianError } = await supabase
    .from("technicians")
    .select("*")
    .eq("id", technicianId)
    .single();

    if (technicianError || !technicianData) {
      return res.status(404).json({ error: "Technician not found" });
    }

    const { error: updateError } = await supabase
    .from("technicians")
    .update({ status: "active"})
    .eq("id", technicianId);

    if (updateError) {
      return res.status(500).json({ error: "Failed to update technician status" });
    }

    return res.status(200).json({ message: "Technician status updated to active" });

  } catch (error) {
    console.error("Unexpected error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

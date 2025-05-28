import { NextApiRequest, NextApiResponse } from "next";
import { getAuthenticatedClient } from "@/utils/api-helpers";

export default async function rejectJob(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const authResult = await getAuthenticatedClient(req, res);
    // ตรวจสอบว่า authentication สำเร็จหรือไม่
    if (!authResult) {
      return; // response ถูกส่งไปแล้วใน getAuthenticatedClient
    }

    const { session, supabase } = authResult;
    const { serviceRequestId } = req.body;
    const technicianId = session.user.id;

    if (!serviceRequestId) {
      return res.status(400).json({ error: "Service request ID is required" });
    }

    // เช็คว่ามี assignment อยู่แล้วหรือไม่
    const { data: existingAssignment, error: checkError } =
      await supabase
        .from("technician_assignment")
        .select("*")
        .eq("service_request_id", serviceRequestId)
        .eq("technician_id", technicianId)
        .single();

    if (checkError && checkError.code !== "PGRST116") { // PGRST116 = no rows found
      throw new Error(`Error checking existing assignment: ${checkError.message}`);
    }

    let assignment;

    if (existingAssignment) {
      // อัปเดตข้อมูลที่มีอยู่แล้ว
      const { data: updatedAssignment, error: updateError } =
        await supabase
          .from("technician_assignment")
          .update({
            accepted_at: null,
            rejected_at: new Date().toISOString(),
          })
          .eq("service_request_id", serviceRequestId)
          .eq("technician_id", technicianId)
          .select()
          .single();

      if (updateError) {
        throw new Error(`Update assignment error: ${updateError.message}`);
      }

      assignment = updatedAssignment;
    } else {
      // สร้างใหม่
      const { data: newAssignment, error: insertError } =
        await supabase
          .from("technician_assignment")
          .insert({
            service_request_id: serviceRequestId,
            technician_id: technicianId,
            accepted_at: null,
            rejected_at: new Date().toISOString(),
          })
          .select()
          .single();

      if (insertError) {
        throw new Error(`Insert assignment error: ${insertError.message}`);
      }

      assignment = newAssignment;
    }

    return res.status(200).json({
      success: true,
      message: "Job rejected successfully",
      assignment,
    });
  } catch (error) {
    console.error("Error in rejectJob:", error);
    return res.status(500).json({
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    });
  }
}
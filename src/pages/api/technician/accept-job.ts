import { NextApiRequest, NextApiResponse } from "next";
import { getAuthenticatedClient } from "@/utils/api-helpers";

export default async function acceptJob(
  req: NextApiRequest,
  res: NextApiResponse
) {
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

    // ตรวจสอบว่างานนี้ยังไม่ถูกรับไปแล้ว
    const { data: existingAssignment, error: checkError } =
      await supabase
        .from("technician_assignment")
        .select("*")
        .eq("service_request_id", serviceRequestId)
        .not("accepted_at", "is", null)
        .single();

    if (checkError && checkError.code !== "PGRST116") {
      // PGRST116 = no rows returned
      throw new Error(`Error checking assignment: ${checkError.message}`);
    }

    if (existingAssignment) {
      return res
        .status(409)
        .json({
          error: "This job has already been accepted by another technician",
        });
    }

    // ตรวจสอบว่ามี assignment สำหรับ technician และ service request นี้แล้วหรือไม่
    const { data: existingTechAssignment } = await supabase
      .from("technician_assignment")
      .select("*")
      .eq("service_request_id", serviceRequestId)
      .eq("technician_id", technicianId)
      .single();

    let assignment;

    if (existingTechAssignment) {
      // อัพเดทข้อมูลที่มีอยู่
      const { data: updatedAssignment, error: updateError } =
        await supabase
          .from("technician_assignment")
          .update({
            accepted_at: new Date().toISOString(),
            rejected_at: null,
          })
          .eq("id", existingTechAssignment.id)
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
            accepted_at: new Date().toISOString(),
            rejected_at: null,
          })
          .select()
          .single();

      if (insertError) {
        throw new Error(`Insert assignment error: ${insertError.message}`);
      }
      assignment = newAssignment;
    }

    // อัพเดทสถานะของ service_request เป็น "กำลังดำเนินการ" (สมมติว่า status_id = 2)
    const { error: statusError } = await supabase
      .from("service_requests")
      .update({
        status_id: 2, // กำลังดำเนินการ
        updated_at: new Date().toISOString(),
      })
      .eq("id", serviceRequestId);

    if (statusError) {
      throw new Error(`Status update error: ${statusError.message}`);
    }

    return res.status(200).json({
      success: true,
      message: "Job accepted successfully",
      assignment,
    });
  } catch (error) {
    console.error("Error in acceptJob:", error);
    return res.status(500).json({
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    });
  }
}

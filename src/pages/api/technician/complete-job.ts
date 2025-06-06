import { NextApiRequest, NextApiResponse } from "next";
import { getAuthenticatedClient } from "@/utils/api-helpers";

export default async function completeJob(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // ตรวจสอบ HTTP method
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const authResult = await getAuthenticatedClient(req, res);

    if (!authResult) {
      return;
    }

    const { session, supabase } = authResult;
    const { serviceRequestId } = req.body;
    const technicianId = session.user.id;

    // ตรวจสอบว่า technician มีสิทธิ์ในงานนี้หรือไม่
    const { data: assignment, error: assignmentError } = await supabase
      .from("technician_assignment")
      .select("id, service_request_id, technician_id")
      .eq("service_request_id", serviceRequestId)
      .eq("technician_id", technicianId)
      .single();

    if (assignmentError || !assignment) {
      return res.status(403).json({
        error: "You don't have permission to complete this job",
      });
    }

    // ตรวจสอบสถานะปัจจุบันของงาน
    const { data: currentJob, error: jobError } = await supabase
      .from("service_requests")
      .select("id, status_id")
      .eq("id", serviceRequestId)
      .single();

    if (jobError || !currentJob) {
      return res.status(404).json({ error: "Service request not found" });
    }

    // ตรวจสอบว่างานอยู่ในสถานะที่สามารถเปลี่ยนเป็น complete ได้
    if (currentJob.status_id !== 2) {
      return res.status(400).json({
        error: "Job is not in pending status and cannot be completed",
      });
    }

    const { data: updatedRequest, error: updateError } = await supabase
      .from("service_requests")
      .update({
        status_id: 3,
        // completed_at: new Date().toISOString() *จำเป็นต้องมีมั้ย
      })
      .eq("id", serviceRequestId)
      .select();

    if (updateError) {
      console.error("Update error:", updateError);
      throw new Error(`Update service request error: ${updateError.message}`);
    }

    // ตรวจสอบว่า update สำเร็จหรือไม่
    if (!updatedRequest || updatedRequest.length === 0) {
      return res.status(404).json({ error: "Service request not found" });
    }
    return res.status(200).json({
      message: "Job completed successfully",
      data: {
        id: updatedRequest[0].id,
        status_id: updatedRequest[0].status_id,
        // completed_at: updatedRequest[0].completed_at
      }
    });
  } catch (error) {
    console.error("Error in acceptJob:", error);
    return res.status(500).json({
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    });
  }
}

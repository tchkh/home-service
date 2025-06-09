import { NextApiRequest, NextApiResponse } from "next";
import { getAuthenticatedClient } from "@/utils/api-helpers";
import { JobDetail } from "@/types";

export default async function jobDetail(
  req: NextApiRequest,
  res: NextApiResponse<JobDetail | { error: string }>
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const authResult = await getAuthenticatedClient(req, res);
    if (!authResult) {
      return;
    }

    const { session, supabase } = authResult;
    const technicianId = session.user.id;
    const { id: jobId } = req.query;

    if (!jobId || typeof jobId !== 'string') {
      return res.status(400).json({ error: "Job ID is required" });
    }

    // ดึงข้อมูล job เฉพาะรายการที่ต้องการ
    const { data: jobData, error: jobError } = await supabase
      .from("technician_pending_jobs")
      .select("*")
      .eq("technician_id", technicianId)
      .eq("request_id", jobId)
      .single();

      if (jobError) {
      if (jobError.code === 'PGRST116') {
        return res.status(404).json({ error: "Job not found" });
      }
      return res.status(500).json({
        error: `Error fetching job: ${jobError.message}`,
      });
    }

    if (!jobData) {
      return res.status(404).json({ error: "Job not found" });
    }

    // แปลงข้อมูลเป็น format ที่ต้องการ
    const jobDetail: JobDetail = {
      id: jobData.request_id,
      user_id: jobData.user_id,
      category: jobData.category_name,
      category_color: jobData.category_color,
      service: jobData.service_title,
      sub_service: jobData.sub_service_title,
      appointment_at: jobData.appointment_at,
      full_address: jobData.full_address,
      latitude: jobData.latitude,
      longitude: jobData.longitude,
      total_price: jobData.total_price,
      first_name: jobData.customer_first_name,
      last_name: jobData.customer_last_name,
      tel: jobData.customer_tel,
      accepted_at: jobData.accepted_at,
      service_id: jobData.service_id,
      quantity: jobData.quantity,
      service_unit: jobData.service_unit,
      service_request_code: jobData.service_request_code,
      technician_latitude: jobData.technician_latitude,
      technician_longitude: jobData.technician_longitude,
    };

    return res.status(200).json(jobDetail);

  } catch (error) {
    console.error("Error in jobDetail:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "An unknown error occurred"
    });
  }
}

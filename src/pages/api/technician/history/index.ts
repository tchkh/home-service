import { NextApiRequest, NextApiResponse } from "next";
import { getAuthenticatedClient } from "@/utils/api-helpers";
import {
  TechnicianService,
  CompletedJob,
  CompletedJobsResponse,
} from "@/types";

export default async function technicianHistory(
  req: NextApiRequest,
  res: NextApiResponse<CompletedJobsResponse | { error: string }>
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

    const { service_id, search } = req.query;

    let query = supabase
      .from("technician_history_jobs")
      .select("*")
      .eq("technician_id", technicianId);

    // เพิ่ม search condition
    if (typeof search === "string" && search.trim() !== "") {
      const searchTerm = search.trim();
      query.or(`service_title.ilike.%${searchTerm}%,service_request_code.ilike.%${searchTerm}%`)
    }

    if (service_id && service_id !== "all") {
      const selectedServiceId = parseInt(service_id as string);
      if (!isNaN(selectedServiceId)) {
        query = query.eq("service_id", selectedServiceId);
      }
    }

    const { data: jobsData, error: jobsError } = await query;

    if (jobsError) {
      return res.status(500).json({
        error: `Error fetching jobs: ${jobsError.message}`,
      });
    }

    // Handle case where no jobs found
    if (!jobsData || jobsData.length === 0) {
      // Try to get technician info from users table if no jobs
      const { data: technicianData } = await supabase
        .from("technicians")
        .select("first_name, last_name, email")
        .eq("id", technicianId)
        .single();

      const technician = {
        id: technicianId,
        name: technicianData
          ? `${technicianData.first_name} ${technicianData.last_name}`
          : "Unknown Technician",
        email: technicianData?.email || "",
      };

      // Get available services
      const { data: allServices } = await supabase
        .from("technician_available_services")
        .select("service_id, service_title")
        .eq("technician_id", technicianId);

      const services: TechnicianService[] =
        allServices?.map((service) => ({
          service_id: service.service_id,
          service_title: service.service_title,
        })) || [];

      // กำหนดข้อความตามเงื่อนไขการกรอง
      let message = "ยังไม่มีรายการที่รอดำเนินการในขณะนี้";

      if (service_id && service_id !== "all") {
        // หาชื่อ service ที่เลือก
        const selectedService = services.find(
          (s) => s.service_id === parseInt(service_id as string)
        );
        const serviceName = selectedService
          ? selectedService.service_title
          : "บริการที่เลือก";
        message = `ไม่พบประวัติการทำงานสำหรับ "${serviceName}"`;
      }

      return res.status(200).json({
        services,
        jobs: [],
        technician,
        message,
        hasJobs: false,
      });
    }

    // ดึงข้อมูล technician จาก record แรก (เนื่องจากเป็นคนเดียวกัน)
    const firstRecord = jobsData[0];
    const technician = {
      id: technicianId,
      name: `${firstRecord.technician_first_name} ${firstRecord.technician_last_name}`,
      email: firstRecord.technician_email,
    };

    // ดึงข้อมูล services ทั้งหมดของ technician
    const { data: allServices } = await supabase
      .from("technician_available_services")
      .select("service_id, service_title")
      .eq("technician_id", technicianId);

    const services: TechnicianService[] =
      allServices?.map((service) => ({
        service_id: service.service_id,
        service_title: service.service_title,
      })) || [];

    // แปลงข้อมูลเป็น format ที่ UI ต้องการ
    const jobs: CompletedJob[] = jobsData.map((job) => ({
      id: job.request_id,
      user_id: job.user_id,
      category: job.category_title,
      service: job.service_title,
      sub_service: job.sub_service_title,
      appointment_at: job.appointment_at,
      address: job.full_address,
      latitude: job.latitude,
      longitude: job.longitude,
      total_price: job.total_price,
      first_name: job.customer_first_name,
      last_name: job.customer_last_name,
      tel: job.customer_tel,
      service_id: job.service_id,
      service_request_code: job.service_request_code
    }));

    return res.status(200).json({
      services,
      jobs,
      technician,
      hasJobs: true,
    });
  } catch (error) {
    console.error("Error in technicianPending:", error);
    return res.status(500).json({
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    });
  }
}

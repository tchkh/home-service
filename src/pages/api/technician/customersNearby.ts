import { NextApiRequest, NextApiResponse } from "next";
import { filterNearbyCustomers } from "@/utils/distance";
import { ServiceRequestNearby } from "@/types";
import { getAuthenticatedClient } from "@/utils/api-helpers";

export default async function customersNearby(
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
    const technicianId = session.user.id;

    // ดึงข้อมูลช่างและตรวจสอบสถานะ
    const { data: technician, error: technicianError } =
      await supabase
        .from("technicians")
        .select("*")
        .eq("id", technicianId)
        .single();

    if (technicianError || !technician) {
      return res.status(404).json({
        error: `Technician not found or inactive: ${
          technicianError?.message || "No active technician found"
        }`,
      });
    }

    // ตรวจสอบสถานะช่าง - ถ้าไม่ใช่ active ให้ส่งข้อมูลพิเศษ
    if (technician.status !== "active") {
      return res.status(200).json({
        technician_inactive: true,
        technician: {
          id: technician.id,
          name: `${technician.first_name} ${technician.last_name}`,
          email: technician.email,
          status: technician.status,
          latitude: technician.latitude,
          longitude: technician.longitude,
          address: technician.address,
        },
        message: "ช่างยังไม่พร้อมให้บริการ กรุณาเปลี่ยนสถานะเป็นพร้อมให้บริการ"
      });
    }

    // ตรวจสอบว่าช่างมีข้อมูลพิกัดหรือไม่
    if (!technician.latitude || !technician.longitude) {
      return res
        .status(400)
        .json({ error: "Technician location not available" });
    }

    // ใช้ Function ที่สร้างไว้ใน Supabase เพื่อลด API calls
    const { data: serviceRequests, error: requestsError } =
      await supabase
        .rpc("get_available_requests_for_technician", {
        technician_id_param: technicianId,
        })
        .select("*");

    if (requestsError) {
      throw new Error(`Service requests error: ${requestsError.message}`);
    }

    const customers = (serviceRequests || []).map((req: ServiceRequestNearby) => ({
      id: req.id,
      user_id: req.user_id,
      full_address: req.full_address,
      address: req.address,
      province: req.province,
      sub_district: req.sub_district,
      additional_info: req.additional_info,
      latitude: req.latitude,
      longitude: req.longitude,
      total_price: req.total_price,
      appointment_at: req.appointment_at,
      quantity: req.quantity,
      service_request_code: req.service_request_code,
      service: {
        name: req.service_title || "Unknown Service",
        sub_service: req.sub_service_title || "Unknown Sub-Service",
        price: req.sub_service_price || 0,
        unit: req.service_unit || "",
      },
    }));

    // หาลูกค้าที่อยู่ใกล้เคียง (รัศมี 10 กิโลเมตร)
    const nearby = filterNearbyCustomers(
      {
        latitude: technician.latitude,
        longitude: technician.longitude,
      },
      customers,
      10000 
    );
    
    return res.status(200).json({
      nearby,
      technician: {
        id: technician.id,
        name: `${technician.first_name} ${technician.last_name}`,
        email: technician.email,
        latitude: technician.latitude,
        longitude: technician.longitude,
        address: technician.address,
      },
    });
  } catch (error) {
    console.error("Error in customersNearby:", error);
    return res.status(500).json({
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    });
  }
}

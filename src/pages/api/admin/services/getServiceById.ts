import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabase";
import { ServiceIdSchema } from "../../../../schemas/get-service-by-id";
import { z } from "zod";
import { getAuthenticatedClient } from "@/utils/api-helpers";
import { ServiceWithDetails } from "@/types";
import { CategoryName } from "@/types";
import { ServiceWithDetailsAndCategories } from "@/types";
import { SubService } from "@/types";

// 1. ฟังก์ชันสำหรับดึงข้อมูล Service พร้อม Categories และ Sub-services จาก Supabase
async function fetchServiceWithDetails(
  serviceId: string
): Promise<ServiceWithDetails | null> {
  try {
    const { data, error } = await supabase
      .from("services") // ระบุตารางที่ต้องการดึงข้อมูล
      .select(
        `
        id,
        title,
        image_url,
        created_at,
        updated_at,
        category: categories (
          name
        ),
        sub_services: sub_services (
          id,
          title,
          price,
          service_unit,
          status
        )
      `
      )
      .eq("id", serviceId) // กรองข้อมูลด้วย serviceId ที่ระบุ
      .eq("status", "active") // กรองข้อมูลด้วย status ที่ระบุ
      .single();

    // กรอง sub_services เฉพาะที่ status เป็น active
    if (data && data.sub_services) {
      data.sub_services = data.sub_services.filter((s: SubService) => s.status === "active");
    } // ดึงข้อมูลเพียงรายการเดียว (เนื่องจากเราใช้ serviceId ซึ่งเป็น Primary Key)

    if (error) {
      console.error("Error fetching service with details:", error);
      // ตรวจสอบ Error Code จาก Supabase ว่าเป็นกรณีไม่พบข้อมูลหรือไม่
      if (
        error.code === "PGRST116" &&
        error.details === "The result contains 0 rows"
      ) {
        return null; // Return null เมื่อไม่พบข้อมูล
      }
      throw error; // โยน Error เพื่อให้ถูกจัดการใน Handler Function
    }

    // ตรวจสอบว่ามีข้อมูลถูกส่งกลับมาหรือไม่ และมีโครงสร้างเป็น Object ที่มี id หรือไม่
    if (!data || typeof data !== "object" || !("id" in data)) {
      throw new Error("Invalid data structure received from Supabase");
    }

    return data as ServiceWithDetails; // แปลง Type ของข้อมูลให้ตรงกับ Interface ที่กำหนด
  } catch (error) {
    console.error("Error in fetchServiceWithDetails:", error);
    throw error; // โยน Error เพื่อให้ถูกจัดการใน Handler Function
  }
}

const getAllCategories = async () : Promise<CategoryName[] | null> => {
   try {
      const { data, error } = await supabase.from("categories").select(
        `
        id,
        name
        `
      );
      if (error) throw error;
      return data as CategoryName[];
   } catch (error) {
      console.error("Error fetching categories:", error);
      return null;
   }
};

// 2. Handler Function สำหรับ API Route ของ Next.js
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ServiceWithDetailsAndCategories | { message: string }> // กำหนด Type ของ Response
) {
  if (req.method !== "GET") {
    // ตรวจสอบว่า Method เป็น GET หรือไม่
    return res.status(405).json({ message: "Method Not Allowed" }); // ถ้าไม่ใช่ GET, ส่ง Error 405
  }

  try {
    const authResult = await getAuthenticatedClient(req, res);
    if (!authResult) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const { serviceId } = ServiceIdSchema.parse(req.query); // ตรวจสอบและดึงค่า serviceId จาก Query

    const service = await fetchServiceWithDetails(serviceId); // ดึงข้อมูล Service จากฐานข้อมูล
    const categories = await getAllCategories();

    if (service) {
      // ถ้าดึงข้อมูล Service ได้สำเร็จ
      return res.status(200).json({service, categories: categories as CategoryName[] || []}); // ส่งข้อมูล Service กลับไปพร้อม Status 200 OK
    } else {
      // ถ้าไม่พบ Service ที่มี ID ตรงกับที่ระบุ
      return res
        .status(404)
        .json({ message: `Service with ID ${serviceId} not found` }); // ส่ง Error 404 Not Found
    }
  } catch (error) {
    // ดักจับ Error ที่อาจเกิดขึ้น
    if (error instanceof z.ZodError) {
      // ถ้าเป็น Error จาก Zod (ข้อมูลไม่ตรงกับ Schema)
      return res
        .status(400)
        .json({ message: "Invalid serviceId provided: Invalid data" }); // ส่ง Error 400 Bad Request
    }
    console.error("Error fetching service:", error); // Log Error ไปที่ Console (สำหรับ Debug)
    return res
      .status(500)
      .json({ message: "Internal Server Error: Failed to fetch service" }); // ส่ง Error 500 Internal Server Error
  }
}
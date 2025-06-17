import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabase";
import { ServiceIdSchema } from "../../../../schemas/get-service-by-id";
import { z } from "zod";
import { getAuthenticatedClient } from "@/utils/api-helpers";

// 2. กำหนด Interface สำหรับโครงสร้างข้อมูลของ Service ที่มีข้อมูลที่เกี่ยวข้อง
interface ServiceWithDetails {
  id: string;
  title: string;
  image_url: string;
  created_at: Date;
  updated_at: Date;
  category:
    | {
        // กำหนดโครงสร้างข้อมูลของ Categories
        id: string;
        name: string;
        description: string;
        created_at: Date;
        updated_at: Date;
      }[]
    | null;
  sub_services: {
    // กำหนดโครงสร้างข้อมูลของ Sub-services
    id: string;
    title: string;
    price: number;
    service_unit: string;
  }[];
}

// 3. ฟังก์ชันสำหรับดึงข้อมูล Service พร้อม Categories และ Sub-services จาก Supabase
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
          id,
          name,
          description,
          created_at,
          updated_at
        ),
        sub_services: sub_services (
          id,
          title,
          price,
          service_unit
        )
      `
      )
      .eq("id", serviceId) // กรองข้อมูลด้วย serviceId ที่ระบุ
      .single(); // ดึงข้อมูลเพียงรายการเดียว (เนื่องจากเราใช้ serviceId ซึ่งเป็น Primary Key)

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

// 4. Handler Function สำหรับ API Route ของ Next.js
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ServiceWithDetails | { message: string }> // กำหนด Type ของ Response
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

    if (service) {
      // ถ้าดึงข้อมูล Service ได้สำเร็จ
      return res.status(200).json(service); // ส่งข้อมูล Service กลับไปพร้อม Status 200 OK
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
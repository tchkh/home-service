import { NextApiRequest, NextApiResponse } from "next";
import { supabase, supabaseAdmin } from "@/lib/supabase";
import { IncomingForm, File } from "formidable";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import {
  ServiceIdSchema,
  UpdateServiceSchema,
  UpdateServicePayload,
} from "../../../../schemas/put-service-by-id";
import { z } from "zod";

// บอก Next.js ว่าไม่ต้อง parse body เอง (we’ll use formidable)
export const config = { api: { bodyParser: false } };

// 2. ฟังก์ชันช่วยอัปโหลดภาพไป Supabase Storage

// Helper: Delete image from Supabase Storage
async function deleteImageFromStorage(imageUrl: string): Promise<void> {
  try {
    if (!imageUrl) return;
    if (supabaseAdmin === null) {
      throw new Error("Supabase Admin is not initialized");
    }
    // Only delete if imageUrl is a Supabase storage URL and in the correct bucket
    const match = imageUrl.match(/service-image\/(.+)$/);
    if (!match) {
      console.error("Not a service-image bucket file");
      return;
    }
    let filePath = match[1];
    if (!filePath.startsWith("service-image/")) {
      filePath = `service-image/${filePath}`;
    }

    const { error } = await supabaseAdmin.storage
      .from("service-image")
      .remove([filePath]);
    if (error) {
      console.error("Supabase Storage delete error:", error);
    }
  } catch (err) {
    console.error("Error deleting image from storage:", err);
  }
}

async function uploadImageToStorage(
  filePath: string,
  originalFilename: string
): Promise<string> {
  const fileExt = originalFilename.split(".").pop();
  const uniqueName = `service-image/${uuidv4()}.${fileExt}`;
  const fileBuffer = fs.readFileSync(filePath);

  if (supabaseAdmin === null) {
    throw new Error("Supabase Admin is not initialized");
  }

  const { error: uploadError } = await supabaseAdmin.storage
    .from("service-image")
    .upload(uniqueName, fileBuffer, {
      contentType: `image/${fileExt}`,
      upsert: false,
    });

  if (uploadError) {
    console.error("Supabase Storage upload error:", uploadError);
    throw uploadError;
  }

  // Get public URL and return it
  const { data } = supabaseAdmin.storage
    .from("service-image")
    .getPublicUrl(uniqueName);

  return data.publicUrl;
}

// 3. ฟังก์ชันสำหรับอัปเดตข้อมูล Service และ Sub-services ใน Supabase
async function updateServiceWithDetails(
  serviceId: string,
  payload: UpdateServicePayload & { image_url: string | null }
) {
  const now = new Date().toISOString(); // กำหนด updated_at เป็นเวลาปัจจุบัน

  try {
    // หา category_id
    const { data: cat, error: catErr } = await supabase
      .from("categories")
      .select("id")
      .eq("name", payload.category)
      .single();
    if (catErr || !cat) throw catErr ?? new Error("Category not found");

    // อัปเดตตาราง services
    if (supabaseAdmin === null) {
      throw new Error("Supabase Admin is not initialized");
    }
    const { error: svcErr } = await supabaseAdmin
      .from("services")
      .update({
        title: payload.title,
        category_id: cat.id,
        image_url: payload.image_url,
        updated_at: now,
      })
      .eq("id", serviceId);
    if (svcErr) throw svcErr;

    // อัปเดต status ของ sub_services เดิมเป็น cancelled (soft delete)
    // 1. ดึง sub_services เดิมทั้งหมดของ serviceId
const { data: oldSubs, error: getOldErr } = await supabaseAdmin
  .from("sub_services")
  .select("id, title, price, service_unit")
  .eq("service_id", serviceId)
  .eq("status", "active");
if (getOldErr) throw getOldErr;

// 2. หา sub_service เดิมที่ถูกลบ (ไม่มีใน payload)
const payloadKeys = payload.sub_services.map(s => `${s.title}|${s.price}|${s.service_unit}`);
const toCancel = (oldSubs ?? []).filter(
  old => !payloadKeys.includes(`${old.title}|${old.price}|${old.service_unit}`)
);
if (toCancel.length > 0) {
  const toCancelIds = toCancel.map(s => s.id);
  const { error: cancelErr } = await supabaseAdmin
    .from("sub_services")
    .update({ status: "cancelled" })
    .in("id", toCancelIds);
  if (cancelErr) throw cancelErr;
}

// 3. หา sub_service ใหม่ (ไม่มีใน oldSubs)
const oldKeys = (oldSubs ?? []).map(s => `${s.title}|${s.price}|${s.service_unit}`);
const toInsert = payload.sub_services.filter(
  s => !oldKeys.includes(`${s.title}|${s.price}|${s.service_unit}`)
);
if (toInsert.length > 0) {
  const insertPayload = toInsert.map(s => ({
    service_id: serviceId,
    title: s.title,
    price: s.price,
    service_unit: s.service_unit,
    status: "active",
  }));
  const { error: insErr } = await supabaseAdmin
    .from("sub_services")
    .insert(insertPayload);
  if (insErr) throw insErr;
}
  } catch (error) {
    console.error("Error in updateServiceWithDetails:", error);
    throw error;
  }
}

// 4. Handler Function สำหรับ API Route ของ Next.js (PUT Request)
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<
    { message: string } | { error: string; issues?: z.ZodIssue[] }
  >
) {
  if (req.method !== "PUT") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const parseForm = () =>
    new Promise<{
      fields: Record<string, unknown>;
      files: Record<string, File | File[]>;
    }>((resolve, reject) => {
      const form = new IncomingForm({ keepExtensions: true });
      form.parse(req, (err, fields, files) => {
        if (err) return reject(err);
        // Remove undefined values from files
        const filteredFiles: Record<string, File | File[]> = {};
        for (const key in files) {
          const value = files[key];
          if (value !== undefined) {
            filteredFiles[key] = value as File | File[];
          }
        }
        resolve({ fields, files: filteredFiles });
      });
    });

    let fields, files;
    try {
      ({ fields, files } = await parseForm());
    } catch (e) {
    console.error("Form parse error:", e);
    return res.status(500).json({ error: "Cannot parse form data" });
  }

  try {
    // 1) ดึง serviceId จาก query
    const { serviceId } = ServiceIdSchema.parse(req.query);

    // 2) แปลง fields → payload เทียบ schema
    const rawPayload = {
      title: Array.isArray(fields.title) ? fields.title[0] : fields.title,
      category: Array.isArray(fields.category)
        ? fields.category[0]
        : fields.category,
      sub_services: JSON.parse(
        Array.isArray(fields.sub_services)
          ? fields.sub_services[0]
          : (fields.sub_services as string)
      ),
    };
    const validPayload = UpdateServiceSchema.parse(rawPayload);

    let imageUrl: string;

    // 3) ตรวจสอบไฟล์ภาพ ถ้ามีให้ลบรูปเก่าจาก Supabase Storage และอัปโหลด ถ้าเป็น string (URL เดิม) ไม่ต้องทำอะไร
    // กรณีอัปโหลดไฟล์ใหม่
    if (files.image) {
      if (supabaseAdmin === null) {
        throw new Error("Supabase Admin is not initialized");
      }
      // ก่อนอัปโหลดใหม่ ลบรูปเก่า (ถ้ามี)
      // ดึงข้อมูล service เดิม เพื่อเอา image_url เดิม
      const { data: oldData, error: oldErr } = await supabaseAdmin
        .from("services")
        .select("image_url")
        .eq("id", serviceId)
        .single();
      if (!oldErr && oldData?.image_url) {
        await deleteImageFromStorage(oldData.image_url);
      }
      const img = Array.isArray(files.image) ? files.image[0] : files.image;
      imageUrl = await uploadImageToStorage(
        img.filepath,
        img.originalFilename!
      );
    }
    // กรณีใช้ URL เดิม
    else if (fields.image) {
      imageUrl = Array.isArray(fields.image) ? fields.image[0] : fields.image;
    } else {
      throw new Error("Image file or URL is required");
    }

    // 4) เรียกอัปเดตใน DB
    await updateServiceWithDetails(serviceId, {
      ...validPayload,
      image_url: imageUrl,
    });

    return res
      .status(200)
      .json({ message: `Service ${serviceId} updated successfully` });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return res
        .status(400)
        .json({ error: "Validation error", issues: err.issues });
    }
    console.error("Error in PUT service:", err);
    if (err instanceof Error) {
      return res
        .status(500)
        .json({ error: err.message || "Internal Server Error" });
    }
    console.error("[ERROR][putServiceById]", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

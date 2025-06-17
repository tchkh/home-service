import type { NextApiRequest, NextApiResponse } from "next";
import { createPagesServerClient } from "@supabase/auth-helpers-nextjs";

interface ApplyResponse {
  success: boolean;
  message: string;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApplyResponse>,
) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  }

  const { code } = req.body;

  if (!code) {
    return res.status(400).json({
      success: false,
      message: "Promocode is required",
    });
  }

  try {
    const supabase = createPagesServerClient({ req, res });

    // First, get current promocode data
    const { data: promoCode, error: fetchError } = await supabase
      .from("available_discount_codes")
      .select("*")
      .eq("code", code)
      .single();

    if (fetchError || !promoCode) {
      return res.status(400).json({
        success: false,
        message: "รหัสส่วนลดไม่ถูกต้อง",
      });
    }

    // Update usage count and remaining usage
    const { error: updateError } = await supabase
      .from("discount_codes")
      .update({
        used_count: promoCode.used_count + 1,
      })
      .eq("id", promoCode.id);

    if (updateError) {
      console.error("Error updating promocode usage:", updateError);
      return res.status(500).json({
        success: false,
        message: "เกิดข้อผิดพลาดในการอัปเดตการใช้งานรหัสส่วนลด",
      });
    }

    return res.status(200).json({
      success: true,
      message: "ใช้รหัสส่วนลดสำเร็จ",
    });
  } catch (error) {
    console.error("Promocode apply error:", error);
    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการใช้รหัสส่วนลด",
    });
  }
}

import type { NextApiRequest, NextApiResponse } from "next";
import { createPagesServerClient } from "@supabase/auth-helpers-nextjs";

interface ValidationResponse {
  success: boolean;
  message: string;
  discount?: {
    type: "percentage" | "fixed";
    value: number;
    amount: number; // calculated discount amount
  };
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ValidationResponse>,
) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  }

  const { code, totalAmount } = req.body;

  if (!code || !totalAmount) {
    return res.status(400).json({
      success: false,
      message: "Code and total amount are required",
    });
  }

  try {
    const supabase = createPagesServerClient({ req, res });

    // Find the promocode
    const { data: promoCode, error } = await supabase
      .from("available_discount_codes")
      .select("*")
      .eq("code", code)
      .single();

    if (error || !promoCode) {
      return res.status(400).json({
        success: false,
        message: "รหัสส่วนลดไม่ถูกต้องหรือไม่มีอยู่ในระบบ",
      });
    }

    const now = new Date();
    const startDate = new Date(promoCode.start_date);
    const endDate = new Date(promoCode.end_date);

    // Check if promocode is within valid date range
    if (now < startDate) {
      return res.status(400).json({
        success: false,
        message: "รหัสส่วนลดยังไม่เริ่มใช้งาน",
      });
    }

    if (now > endDate) {
      return res.status(400).json({
        success: false,
        message: "รหัสส่วนลดหมดอายุแล้ว",
      });
    }

    // Check remaining usage
    if (promoCode.remaining_usage <= 0) {
      return res.status(400).json({
        success: false,
        message: "รหัสส่วนลดถูกใช้งานหมดแล้ว",
      });
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (promoCode.discount_type === "percentage") {
      discountAmount = (totalAmount * promoCode.discount_value) / 100;
    } else {
      discountAmount = Math.min(promoCode.discount_value, totalAmount);
    }

    return res.status(200).json({
      success: true,
      message: "รหัสส่วนลดใช้ได้",
      discount: {
        type: promoCode.discount_type,
        value: promoCode.discount_value,
        amount: discountAmount,
      },
    });
  } catch (error) {
    console.error("Promocode validation error:", error);
    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการตรวจสอบรหัสส่วนลด",
    });
  }
}

import type { NextApiRequest } from "next";
import { PomotionData } from "@/types";

// เช็คว่ามี name color ไหม
// export function promotionVaridate(req: NextApiRequest) {
//    const {
//       code,
//       discount_type,
//       discount_value,
//       usage_limit,
//       start_date,
//       end_date,
//    } = req.body as PomotionData;
// }

// export function checkDataComplete

export function checkDataComplete(req: NextApiRequest) {
   const {
      code,
      discount_type,
      discount_value,
      usage_limit,
      start_date,
      end_date,
   } = req.body as PomotionData;
   if (
      !code ||
      !discount_type ||
      !discount_value ||
      !usage_limit ||
      !start_date ||
      !end_date
   ) {
      return {
         error: "ให้ข้อมูลมาไม่ครบ กรุณาใส่ข้อมูล code, discount_type,discount_value, usage_limit, start_date, end_date, ให้ครบ",
      };
   }
   return { error: null }; // ถ้าทุกอย่างถูกต้อง
}

//เช็ต code เป็น อังกฤษ กับ เลข เท่านั้น
export function checkTextPromotion(req: NextApiRequest) {
   const { code } = req.body as PomotionData;
   if (!/^[A-Za-z0-9]+$/.test(code)) {
      return { error: "โปรดใส้เฉพาะตัวอักษรภาษาอังกฤษและเลขเท่านั้น" };
   }
   return { error: null }; // ถ้าทุกอย่างถูกต้อง
}
export function checkTypePromotion(req: NextApiRequest) {
   const { discount_type } = req.body as PomotionData;
   if (discount_type !== "fixed" && discount_type !== "percentage") {
      return { error: "ใส่ชนิตส่วนลดไม่ถูกต้อง เลือกเฉพาะ fixed  percentage " };
   }
   return { error: null }; // ถ้าทุกอย่างถูกต้อง
}

// เช็ตเป็นตัวเลขและไม่ติดลย
export function checkNumberNotNagative(checkNumber: number) {
   if (typeof checkNumber !== "number" || checkNumber < 0) {
      return { error: "โปรดใส้เฉพาะตัวเลขและไม่ติดลบ" };
   }
   return { error: null }; // ถ้าทุกอย่างถูกต้อง
}

// เช็ควันที่ dateNotPass ต้องน้อยกว่า dateCheck เสมอ
export function dateNowIsNotPassed(
   dateNotPass: Date,
   dateCheck: Date,
   logError?: string
) {
   if (dateCheck < dateNotPass) {
      return { error: logError };
   }
   return { error: null }; // ถ้าทุกอย่างถูกต้อง
}

// เช็ค promotion สามารถใช้ได้ไหม
export function checkOldPromotion(data: {
   usage_limit: number;
   used_count: number;
   start_date: Date;
   end_date: Date;
}) {
   const { usage_limit, used_count, start_date, end_date } = data;
   let checkPromotion: boolean;
   if (used_count >= usage_limit || start_date >= end_date) {
      checkPromotion = true;
   } else {
      checkPromotion = false;
   }
   return checkPromotion;
}

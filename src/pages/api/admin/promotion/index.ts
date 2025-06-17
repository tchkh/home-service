import supabase from "@/lib/supabase";
import type { NextApiRequest, NextApiResponse } from "next";
import { PomotionData } from "@/types";
import {
   dateNowIsNotPassed,
   checkTextPromotion,
   checkDataComplete,
   checkNumberNotNagative,
   checkTypePromotion,
   checkOldPromotion,
} from "@/lib/middleware/promotionVaridate";

export default async function handler(
   req: NextApiRequest,
   res: NextApiResponse
) {
   // GET
   //
   // เมื่อครบเงื่อนไข ให้เปลี่ยน active เป็น flase
   if (req.method === "GET") {
      const { id } = req.query as {
         id?: string;
      };

      let query = supabase.from("discount_codes").select("*");
      if (id) {
         // เมื่อไม่ มีการส่่ง id ให้ quely ตาม id
         query = query.eq("id", id).eq("active", true);
         const { data } = await query;
         const dataFetch = data;
         return res.status(200).json(dataFetch);
      } else {
         // fetch ข้อมูลมาทั้งหมด
         query = query.eq("active", true);
         const { data } = await query;
         // หากไม่พบข้อมูล
         if (!data) {
            res.status(404).json({ message: "ไม่พบ Promotion" });
         }
         // ไปเช็คใน function  หากเป็น ture ให้ส่ง index ออกมา
         // กรอก จาก index ก่อนหน้านี้
         const indexesToRemove: number[] = [];
         data?.map((dataInArray, index) => {
            if (checkOldPromotion(dataInArray)) {
               indexesToRemove.push(index);
            }
         });

         const dataFetch = data?.filter(
            (_, index) => !indexesToRemove.includes(index)
         );

         return res.status(200).json(dataFetch);
      }
      // เมื่อครบเงื่อนไข ให้เปลี่ยน active เป็น flase
   }

   // POST

   if (req.method === "POST") {
      const {
         code,
         discount_type,
         discount_value,
         usage_limit,
         start_date,
         end_date,
      } = req.body as PomotionData;
      if (!start_date || !end_date) {
         return res
            .status(400)
            .json({ error: "Start date and end date are required" });
      }
      const now = new Date();
      const startDate = new Date(start_date);

      const endDate = new Date(end_date);

      // ✅ Validation

      // varidate ส่ง data มาครบ
      const errorCheckData = checkDataComplete(req);
      if (errorCheckData.error) {
         res.status(400).json({ error: errorCheckData.error });
      } else {
         const errors: string[] = [];
         //  เช็ต code เป็น อังกฤษ กับ เลข เท่านั้น
         const errorTextPromotions = checkTextPromotion(req);
         if (errorTextPromotions.error) {
            errors.push(errorTextPromotions.error);
         }

         // เช็ค ประเภทส่วนลด
         const errorCheckTypePromotion = checkTypePromotion(req);
         if (errorCheckTypePromotion.error) {
            errors.push(errorCheckTypePromotion.error);
         }

         // เช็คส่วนลดและจำนวนการใช้ เป็นตัวเลข และไม่ติดลบ
         const errorNumberNotNagativeDiscount = checkNumberNotNagative(
            Number(discount_value)
         );
         if (errorNumberNotNagativeDiscount.error) {
            errors.push("ส่วนลด" + errorNumberNotNagativeDiscount.error);
         }
         const errorNumberNotNagativeUselimit = checkNumberNotNagative(
            Number(usage_limit)
         );
         if (errorNumberNotNagativeUselimit.error) {
            errors.push("จำนวนการใช้" + errorNumberNotNagativeUselimit.error);
         }
         if (
            // discount_type &&
            discount_type === "percentage" && discount_value
               ? discount_value
               : 0 < 100
         ) {
            errors.push("ส่วนลดแบบ Percentage ห้ามเกิน 100%");
         }
         // เช็ควันหมดและวันเริ่ม ไม่น้อยกว่าเวลาปัจจุบัน
         const thenEndError =
            "วันเริ่ม Promotion ต้องมาถึงก่อนวันหมด Promotion";
         const errorStartNotThenEnd = dateNowIsNotPassed(
            startDate,
            endDate,
            thenEndError
         );
         if (errorStartNotThenEnd.error) {
            errors.push(errorStartNotThenEnd.error);
         }

         // เช็ควันเริ่ม ไม่เริ่มไม่เกินเวลาปัจุบัน ไม่เกินวันหมดเวลา
         const startThenCurrentError =
            "วันเริ่ม Promotion ต้องมาถึงก่อนวันปัจจุบัน";
         const errorStartThenCurrent = dateNowIsNotPassed(
            now,
            startDate,
            startThenCurrentError
         );
         if (errorStartThenCurrent.error) {
            errors.push(errorStartThenCurrent.error);
         }
         const endThenCurrentError =
            "วันหมด Promotion ต้องมาถึงก่อนวันปัจจุบัน";
         const errorEndThenCurrent = dateNowIsNotPassed(
            now,
            endDate,
            endThenCurrentError
         );
         if (errorEndThenCurrent.error) {
            errors.push(errorEndThenCurrent.error);
         }

         if (errors.length > 0) {
            return res.status(400).json({ errors });
         }
      }
      // เริ่มสร้าง
      const formattedCode = code.toUpperCase();

      // ✅ Insert into Supabase
      const { data, error } = await supabase.from("discount_codes").insert([
         {
            code: formattedCode,
            discount_type,
            discount_value: Number(discount_value),
            usage_limit: Number(usage_limit),
            start_date: startDate.toISOString().split("").slice(0, 10).join(""),
            end_date: endDate.toISOString().split("").slice(0, 10).join(""),
            created_at: new Date(),
            updated_at: new Date(),
         },
      ]);

      if (error) {
         console.log("error: ", error);
         return res.status(500).json({ error: error.message });
      }

      return res
         .status(200)
         .json({ message: "Promotion created successfully", data });
   }

   // PUT
   if (req.method === "PUT") {
      //
      //
      const {
         id,
         code,
         discount_type,
         discount_value,
         usage_limit,
         start_date,
         end_date,
      } = req.body as PomotionData;
      if (!start_date || !end_date) {
         return res
            .status(400)
            .json({ error: "Start date and end date are required" });
      }
      const now = new Date();
      const startDate = new Date(start_date);

      const endDate = new Date(end_date);

      // ✅ Validation

      // varidate ส่ง data มาครบ
      const errorCheckData = checkDataComplete(req);
      if (errorCheckData.error) {
         res.status(400).json({ error: errorCheckData.error });
      } else {
         const errors: string[] = [];
         //  เช็ต code เป็น อังกฤษ กับ เลข เท่านั้น
         const errorTextPromotions = checkTextPromotion(req);
         if (errorTextPromotions.error) {
            errors.push(errorTextPromotions.error);
         }

         // เช็ค ประเภทส่วนลด
         const errorCheckTypePromotion = checkTypePromotion(req);
         if (errorCheckTypePromotion.error) {
            errors.push(errorCheckTypePromotion.error);
         }

         // เช็คส่วนลดและจำนวนการใช้ เป็นตัวเลข และไม่ติดลบ
         const errorNumberNotNagativeDiscount = checkNumberNotNagative(
            Number(discount_value)
         );
         if (errorNumberNotNagativeDiscount.error) {
            errors.push("ส่วนลด" + errorNumberNotNagativeDiscount.error);
         }
         const errorNumberNotNagativeUselimit = checkNumberNotNagative(
            Number(usage_limit)
         );
         if (errorNumberNotNagativeUselimit.error) {
            errors.push("จำนวนการใช้" + errorNumberNotNagativeUselimit.error);
         }

         // เช็ควันหมดและวันเริ่ม ไม่น้อยกว่าเวลาปัจจุบัน
         const thenEndError =
            "วันเริ่ม Promotion ต้องมาถึงก่อนวันหมด Promotion";
         const errorStartNotThenEnd = dateNowIsNotPassed(
            startDate,
            endDate,
            thenEndError
         );
         if (errorStartNotThenEnd.error) {
            errors.push(errorStartNotThenEnd.error);
         }

         // เช็ควันเริ่ม ไม่เริ่มไม่เกินเวลาปัจุบัน ไม่เกินวันหมดเวลา
         const startThenCurrentError =
            "วันเริ่ม Promotion ต้องมาถึงก่อนวันปัจจุบัน";
         const errorStartThenCurrent = dateNowIsNotPassed(
            now,
            startDate,
            startThenCurrentError
         );
         if (errorStartThenCurrent.error) {
            errors.push(errorStartThenCurrent.error);
         }
         const endThenCurrentError =
            "วันหมด Promotion ต้องมาถึงก่อนวันปัจจุบัน";
         const errorEndThenCurrent = dateNowIsNotPassed(
            now,
            endDate,
            endThenCurrentError
         );
         if (errorEndThenCurrent.error) {
            errors.push(errorEndThenCurrent.error);
         }

         if (errors.length > 0) {
            return res.status(400).json({ errors });
         }
      }
      // เริ่มสร้าง
      const formattedCode = code.toUpperCase();

      // ✅ Insert into Supabase
      const { data, error } = await supabase
         .from("discount_codes")
         .update([
            {
               code: formattedCode,
               discount_type,
               discount_value: Number(discount_value),
               usage_limit: Number(usage_limit),
               start_date: startDate
                  .toISOString()
                  .split("")
                  .slice(0, 10)
                  .join(""),
               end_date: endDate.toISOString().split("").slice(0, 10).join(""),
               updated_at: new Date(),
            },
         ])
         .eq("id", id)
         .select();

      if (error) {
         console.log("error: ", error);
         return res.status(500).json({ error: error.message });
      } else {
         return res.status(200).json({ message: "edit data complete", data });
      }
   }
   if (req.method === "DELETE") {
      const { id } = req.query;
      if (!id) {
         res.status(400).json({
            message: "ไม่มี id โปรดส่ง id promotion เข้ามา",
         });
      }
      const { data, error } = await supabase
         .from("discount_codes")
         .update({ active: false })
         .eq("id", id)
         .select();

      if (error) {
         console.log("error: ", error);
         return res.status(500).json({ error: error.message });
      } else {
         return res.status(200).json({ message: "delete data complete", data });
      }
   }
}

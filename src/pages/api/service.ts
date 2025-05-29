import supabase from "@/lib/supabase";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
   req: NextApiRequest,
   res: NextApiResponse
) {
   if (req.method === "GET") {
      try {
         const { search, category, minPrice, maxPrice, sortBy, onLimit } =
            req.query as {
               search?: string;
               category?: string;
               minPrice?: string;
               maxPrice?: string;
               sortBy?: string;
               onLimit?: string;
            };

         // เช็คว่าส่ง limit มาไหม และเกินจำนวนไหม
         let limit;
         if (onLimit) {
            try {
               // ดึงจำนวนมาเช็คก่อนว่า เกินไหม
               const { count, error } = await supabase
                  .from("services_with_card")
                  .select("*", { count: "exact", head: true });
               if (error) {
                  return res
                     .status(500)
                     .json({ error: "Error fetching count" });
               }
               if (count === null) {
                  return res.status(500).json({ error: "Count is null" });
               }

               const parsedLimit = Number(onLimit);
               // console.log("parsedLimit: ", parsedLimit);
               // console.log("count: ", count);
               if (parsedLimit > count) {
                  return res.status(400).json({ error: "over limit data" });
               }
               limit = parsedLimit;
            } catch (err) {
               console.log("error: ", err);
               return res
                  .status(500)
                  .json({ error: "Unexpected server error" });
            }
         } else {
            limit = 8;
         }
         let query = supabase
            .from("services_with_card")
            // head: false นับจำนวนแล้ว เอาข้อมูลมาด้วย
            .select("*", { count: "exact", head: false })
            .range(0, limit);

         if (search) {
            query = query.ilike("service_title", `%${search}%`);
         }

         if (category) {
            if (category !== "บริการทั้งหมด") {
               // ไม่ได้ใช้ คำถามทำไม่ถึง query categoryAll ไม่ได้
               // const categoryAll = '';
               query = query.eq("category_name", category);
            }
         }

         if (minPrice) {
            query = query.gte("min_price", minPrice);
         }

         if (maxPrice) {
            query = query.lte("max_price", maxPrice);
         }

         if (sortBy === "ascending") {
            query = query.order("service_title", { ascending: true });
         } else if (sortBy === "descending ") {
            query = query.order("service_title", { ascending: false });
         } else if (sortBy === "title") {
            query = query.order("id", { ascending: true });
         }

         const { count, data: service, error } = await query;
         if (error) {
            console.log("error: ", error);
            return res.status(500).json({ error: "Error fetching services" });
         }
         return res.status(200).json({ count, service });
      } catch (error) {
         console.log("error at get methor", error);
      }
   }
}

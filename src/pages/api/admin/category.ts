import supabase from "@/lib/supabase";
import type { NextApiRequest, NextApiResponse } from "next";
import {
   validateCategory,
   checkIdCategory,
} from "@/lib/middleware/validateCategory";

export default async function handler(
   req: NextApiRequest,
   res: NextApiResponse
) {
   // get ข้อมูลทั้งหมด และ get ด้วย id

   if (req.method === "GET") {
      const { id } = req.body as {
         id: number;
      };
      let query = supabase.from("categories").select("*");

      // เมื่อมี id ให้ query เฉพาะ id หาก
      if (id) {
         query = query.eq("id", id);
      }

      // ดึงข้อมูลแล้วเก็บใน data
      const { data, error } = await query;
      if (error) {
         console.log("error: ", error);
         throw error;
      }
      return res.status(200).json(data);
   }

   // สร้าง ข้อมูล
   else if (req.method === "POST") {
      const { name, color } = req.body as {
         name: string;
         color: string;
      };
      try {
         // vaidate ข้อมูลที่ส่งมา
         const { error } = validateCategory(req);
         if (error) {
            return res.status(400).json({ message: error });
         }
         // ส่ง data ไปสร้าง category
         const { data, error: dbError } = await supabase
            .from("categories")
            .insert([{ name, color }]);

         if (dbError) throw dbError;

         return res.status(200).json({ message: "Category created", data });
      } catch (error) {
         console.log("error at get methor", error);
         return res.status(500).json({ message: "Server error" });
      }
   }
   // แก้ไข้ category โดย id
   else if (req.method === "PUT") {
      const { id, name, color } = req.body as {
         id: number;
         name: string;
         color: string;
      };

      // เช็ค ว่ามี id, name, color อะป่าว
      const validateError = [checkIdCategory(req), validateCategory(req)];
      for (const check of validateError) {
         if (check.error) {
            return res.status(400).json({ message: check.error });
         }
      }
      // update เข้า supabase
      const { data, error: dbError } = await supabase
         .from("categories")
         .update({ name: name, color: color })
         .eq("id", id)
         .select();
      if (dbError) throw dbError;
      return res
         .status(200)
         .json({ message: "Update category complete", data });
   }
   // ลบ category โดย id
   else if (req.method === "DELETE") {
      const { id } = req.body as {
         id: number;
      };

      // เช็ค ว่ามี id, name, color อะป่าว
      const { error } = checkIdCategory(req);

      if (error) {
         return res.status(400).json({ message: error });
      }

      // update เข้า supabase
      const { data, error: dbError } = await supabase
         .from("categories")
         .delete()
         .eq("id", id);
      if (dbError) throw dbError;
      return res
         .status(200)
         .json({ message: "Delete category complete", data });
   } else {
      return res.status(405).json({ message: "Method not allowed" });
   }
}

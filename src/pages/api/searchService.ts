import supabase from "@/lib/supabase";
import type { NextApiRequest, NextApiResponse } from "next";
export default async function handler(
   req: NextApiRequest,
   res: NextApiResponse
) {
   /* 
   หากไม่มี query เข้ามา ไม่ให้ fetch api
   หากไม่พบเนื้อหา ให้ ส่งข้อมูลว่า none service
   */
   try {
      const { searchTitle } = req.query as { searchTitle: string };
      // console.log("searchTitle: ", searchTitle);
      if (searchTitle) {
         const { data: services, error } = await supabase
            .from("services")
            .select("title")
            .range(0, 4)
            .ilike("title", `%${searchTitle}%`);
         // console.log("data: ", services);
         if (error) {
            // console.log("error: ", error);
            return res.status(500).json({ massage: "Error fetching services" });
         }
         if (services[0]) {
            return res.status(200).json(services);
         } else {
            // หาไม่มีข้มูลให้ return
            return res.status(404).json({ massage: "No suggestions found." });
         }
      } else {
         //หากไม่มีการใส้คำค้นหาให้ return
         return res.status(400).json("Please enter a search term.");
      }
   } catch (error) {
      // console.log("error: ", error);
      return res
         .status(500)
         .json({ massage: `Error fetching services${error}` });
   }
}

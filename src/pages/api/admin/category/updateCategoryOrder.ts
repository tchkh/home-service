import supabase from "@/lib/supabase";
import type { NextApiRequest, NextApiResponse } from "next";
export default async function handler(
   req: NextApiRequest,
   res: NextApiResponse
) {
   if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
   }

   const { oldOrder, newOrder } = req.body;

   console.log("Call reorder_category with", { oldOrder, newOrder });

   if (oldOrder === undefined || newOrder === undefined) {
      return res.status(400).json({ error: "Missing required fields" });
   }

   if (!supabase) {
      return res.status(500).json({ error: "Server configuration error" });
   }

   try {
      // เริ่ม transaction
      const { data, error } = await supabase.rpc("reorder_category", {
         old_order: oldOrder,
         new_order: newOrder,
      });

      if (error) {
         console.error("Error updating service order:", error, {
            oldOrder,
            newOrder,
         });
         return res.status(500).json({
            error: "Failed to update service order",
            detail: error.message,
            success: false,
         });
      }

      return res.status(200).json({
         success: true,
         message: "Service order updated successfully",
         data,
      });
   } catch (err) {
      console.error("Error in updateServiceOrder:", err);
      return res.status(500).json({
         error: "Internal server error",
         success: false,
      });
   }
}

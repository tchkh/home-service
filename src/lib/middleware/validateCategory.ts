import type { NextApiRequest } from "next";

// เช็คว่ามี name color ไหม
export function validateCategory(req: NextApiRequest) {
   const { name, color } = req.body;

   if (!name || typeof name !== "string") {
      return { error: "Missing or invalid 'name'" };
   }

   if (!color || typeof color !== "string") {
      return { error: "Missing or invalid 'color'" };
   }

   return { error: null }; // ถ้าทุกอย่างถูกต้อง
}

export function checkIdCategory(req: NextApiRequest) {
   const { id } = req.body;
   if (!id) {
      return { error: "Missing or invalid 'id'" };
   }
   return { error: null };
}
export function checkIdParam(req: NextApiRequest) {
   const { id } = req.query;
   if (!id) {
      return { error: "Missing or invalid 'id'" };
   }
   return { error: null };
}

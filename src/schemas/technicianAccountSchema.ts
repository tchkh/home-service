import { z } from "zod";

export const technicianAccountSchema = z.object({
  firstName: z.string().min(1, "กรุณากรอกชื่อ"),
  lastName: z.string().min(1, "กรุณากรอกนามสกุล"),
  tel: z.string().min(10, "เบอร์โทรศัพท์ต้องมีอย่างน้อย 10 หลัก"),
  currentLocation: z.string().min(1, "กรุณากรอกตำแหน่งที่อยู่ปัจจุบัน"),
  technicianStatus: z.string().optional(),
  servicesActive: z.array(z.object({service_id: z.number(), is_active: z.boolean()})),
});

export type TechnicianAccountFormData = z.infer<typeof technicianAccountSchema>;
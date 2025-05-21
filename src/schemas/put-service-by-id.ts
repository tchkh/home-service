import { z } from 'zod'

export const ServiceIdSchema = z.object({
  serviceId: z.string(), // กำหนดว่า serviceId ควรเป็น string
})

export const UpdateServiceSchema = z.object({
  id: z.number().optional(),
  title: z.string().min(1, 'กรุณากรอกชื่อเซอร์วิส'),
  category: z.string().min(1, 'กรุณาระบุชื่อประเภท'),
  sub_services: z
    .array(
      z.object({
        id: z.number().optional(), // ID ของ Sub-service (optional สำหรับรายการใหม่)
        title: z.string().min(1, 'กรุณาระบุชื่อรายการ'),
        price: z.number().min(0, 'ราคาต้องไม่น้อยกว่า 0'),
        service_unit: z.string().min(1, 'กรุณาระบุหน่วย'),
      })
    )
    .min(1, 'กรุณาเพิ่มรายการอย่างน้อย 1 รายการ'),
})

export type UpdateServicePayload = z.infer<typeof UpdateServiceSchema>

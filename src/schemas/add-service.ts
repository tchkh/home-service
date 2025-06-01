import { z } from 'zod'

export const serviceSchema = z.object({
  id: z.number().optional(),
  title: z.string().min(1, 'กรุณากรอกชื่อเซอร์วิส'),
  category: z.string().min(1, 'กรุณาเลือกประเภท'),
  image: z.instanceof(File, { message: 'กรุณาเพิ่มรูปภาพ' }).nullable(),
  sub_services: z
    .array(
      z.object({
        id: z.number().optional(),
        title: z.string().min(1, 'กรุณาระบุชื่อรายการ'),
        price: z
          .number({ invalid_type_error: 'กรุณาระบุราคาเป็นตัวเลข' })
          .min(0, 'ราคาต้องไม่น้อยกว่า 0'),
        service_unit: z.string().min(1, 'กรุณาระบุหน่วย'),
      })
    )
    .min(1, 'กรุณาเพิ่มรายการอย่างน้อย 1 รายการ'),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
})

export type ServiceFormValues = z.infer<typeof serviceSchema>

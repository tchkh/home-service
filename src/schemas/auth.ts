import { z } from 'zod'

// login
export const loginSchema = z.object({
  email: z.string().email('กรุณากรอกอีเมลให้ถูกต้อง'),
  password: z.string().min(1, 'กรุณากรอกรหัสผ่าน'),
})

export type LoginFormInputs = z.infer<typeof loginSchema>

// register
export const registerSchema = z.object({
  fullName: z
    .string()
    .regex(/^[A-Za-z\s]+$/, 'กรุณากรอกข้อมูลเป็นภาษาอังกฤษเท่านั้น'),
  phone: z.string().min(9, 'กรุณากรอกเบอร์โทรศัพท์ที่ถูกต้อง'),
  email: z
    .string()
    .email('กรุณากรอกอีเมลให้ถูกต้อง')
    .endsWith('.com', { message: 'กรุณาใช้โดเมน .com เท่านั้น' }),
  password: z.string().min(12, 'รหัสผ่านต้องมีอย่างน้อย 12 ตัวอักษร'),

  acceptTerms: z.boolean().refine(val => val === true, {
    message: 'กรุณายอมรับข้อตกลงและเงื่อนไข',
  }),
})

export type RegisterFormInputs = z.infer<typeof registerSchema>

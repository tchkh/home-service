// schemas/booking.ts
import { z } from 'zod'

// Customer Info Schema
export const customerInfoSchema = z.object({
  serviceDate: z
    .date({
      required_error: 'กรุณาเลือกวันที่รับบริการ',
    })
    .refine(date => date > new Date(), {
      message: 'วันที่รับบริการต้องเป็นวันในอนาคต',
    }),

  serviceTime: z
    .string()
    .min(1, 'กรุณาเลือกเวลารับบริการ')
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'รูปแบบเวลาไม่ถูกต้อง'),

  address: z
    .string()
    .min(10, 'กรุณากรอกที่อยู่อย่างน้อย 10 ตัวอักษร')
    .max(200, 'ที่อยู่ต้องไม่เกิน 200 ตัวอักษร'),

  province: z.string().min(1, 'กรุณาเลือกจังหวัด'),

  district: z.string().min(1, 'กรุณาเลือกเขต/อำเภอ'),

  subDistrict: z.string().min(1, 'กรุณาเลือกแขวง/ตำบล'),

  additionalInfo: z
    .string()
    .max(500, 'ข้อมูลเพิ่มเติมต้องไม่เกิน 500 ตัวอักษร')
    .optional(),

  // GPS coordinates (optional)
  latitude: z.number().optional(),
  longitude: z.number().optional(),
})

export type CustomerInfoForm = z.infer<typeof customerInfoSchema>

// Payment Schema
export const creditCardSchema = z.object({
  method: z.literal('creditcard'),
  cardNumber: z
    .string()
    .transform(val => val.replace(/\s/g, ''))
    .pipe(z.string().regex(/^\d{13,19}$/, 'หมายเลขบัตรเครดิตไม่ถูกต้อง')),

  cardName: z
    .string()
    .min(3, 'ชื่อบนบัตรต้องมีอย่างน้อย 3 ตัวอักษร')
    .regex(/^[a-zA-Z\s]+$/, 'ชื่อบนบัตรต้องเป็นภาษาอังกฤษเท่านั้น'),

  expiryDate: z
    .string()
    .regex(
      /^(0[1-9]|1[0-2])\/([0-9]{2})$/,
      'รูปแบบวันหมดอายุไม่ถูกต้อง (MM/YY)'
    )
    .refine(val => {
      const [month, year] = val.split('/')
      const expiry = new Date(2000 + parseInt(year), parseInt(month) - 1)
      return expiry > new Date()
    }, 'บัตรหมดอายุแล้ว'),

  cvv: z.string().regex(/^\d{3,4}$/, 'CVV ต้องเป็นตัวเลข 3-4 หลัก'),

  promoCode: z.string().optional(),
})

export const promptPaySchema = z.object({
  method: z.literal('promptpay'),
  promoCode: z.string().optional(),
})

export const paymentSchema = z.discriminatedUnion('method', [
  creditCardSchema,
  promptPaySchema,
])

export type PaymentForm = z.infer<typeof paymentSchema>

// Cart Item Schema
export const cartItemSchema = z
  .object({
    id: z.number(),
    quantity: z.number().min(0),
  })
  .refine(item => item.quantity > 0, {
    message: 'กรุณาเลือกบริการอย่างน้อย 1 รายการ',
  })

export const cartSchema = z
  .array(cartItemSchema)
  .min(1, 'กรุณาเลือกบริการอย่างน้อย 1 รายการ')

// Alternative: Simpler payment schema (recommended)
export const simplePaymentSchema = z
  .object({
    method: z.enum(['creditcard', 'promptpay']),
    cardName: z.string().optional(),
    promoCode: z.string().optional(),
  })
  .refine(
    data => {
      if (data.method === 'creditcard') {
        return data.cardName && data.cardName.trim().length > 0
      }
      return true
    },
    {
      message: 'กรุณากรอกชื่อบนบัตรเครดิต',
      path: ['cardName'],
    }
  )

export type SimplePaymentForm = z.infer<typeof simplePaymentSchema>

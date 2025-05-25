import { z } from 'zod'

export const ServiceIdSchema = z.object({
  serviceId: z.string(), // กำหนดว่า serviceId ควรเป็น string (UUID)
})

import { z } from 'zod'

export const ServiceIdSchema = z.object({
  serviceId: z.string(),
})

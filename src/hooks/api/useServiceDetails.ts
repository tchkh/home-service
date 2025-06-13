import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { z } from 'zod'

// Schemas for type safety
export const SubServiceSchema = z.object({
  id: z.number(),
  service_id: z.number(),
  service_title: z.string().optional(),
  title: z.string(),
  price: z.number(),
  unit: z.string(),
})

export const ServiceDetailsResponseSchema = z.array(SubServiceSchema)

export type SubService = z.infer<typeof SubServiceSchema>

// API functions
const fetchServiceDetails = async (
  serviceId: string
): Promise<SubService[]> => {
  const { data } = await axios.get(`/api/service/${serviceId}`)

  // Validate response with Zod
  const validated = ServiceDetailsResponseSchema.parse(data)
  return validated
}

// Query hook
export const useServiceDetails = (serviceId: string | null) => {
  return useQuery({
    queryKey: ['service-details', serviceId],
    queryFn: () => fetchServiceDetails(serviceId!),
    enabled: !!serviceId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  })
}

// Booking submission
export const BookingSubmissionSchema = z.object({
  serviceId: z.string(),
  items: z.array(
    z.object({
      id: z.number(),
      quantity: z.number(),
      price: z.number(),
    })
  ),
  customerInfo: z.object({
    serviceDate: z.string(),
    serviceTime: z.string(),
    address: z.string(),
    province: z.string(),
    district: z.string(),
    subDistrict: z.string(),
    additionalInfo: z.string().optional(),
  }),
  paymentInfo: z.object({
    method: z.enum(['promptpay', 'creditcard']),
    cardNumber: z.string().optional(),
    cardName: z.string().optional(),
    expiryDate: z.string().optional(),
    cvv: z.string().optional(),
    promoCode: z.string().optional(),
  }),
  totalAmount: z.number(),
})

export type BookingSubmission = z.infer<typeof BookingSubmissionSchema>

const submitBooking = async (booking: BookingSubmission) => {
  // In real app, this would POST to your API
  const { data } = await axios.post('/api/bookings', booking)
  return data
}

export const useSubmitBooking = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: submitBooking,
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
    },
  })
}

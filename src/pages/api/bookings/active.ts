import { NextApiRequest, NextApiResponse } from 'next'
import { createSupabaseServerClient } from '@/lib/supabase/server'

interface ServiceRequest {
  id: string
  sub_service_id: number
  appointment_at: string
  total_price: number
  quantity: number
  address: string | null
  province: string | null
  district: string | null
  sub_district: string | null
  additional_info: string | null
  latitude: number | null
  longitude: number | null
  payment_status: string | null
  payment_intent_id: string | null
  sub_services: {
    id: number
    title: string
    price: number
    service_id: number
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET,OPTIONS,PATCH,DELETE,POST,PUT'
  )
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  )

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { userId } = req.query

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' })
  }

  // Create authenticated Supabase client
  const supabase = createSupabaseServerClient({ req, res })

  try {
    // Get the most recent active booking for the user
    const { data: serviceRequests, error } = await supabase
      .from('service_requests')
      .select(
        `
        id,
        sub_service_id,
        appointment_at,
        total_price,
        quantity,
        address,
        province,
        district,
        sub_district,
        additional_info,
        latitude,
        longitude,
        sub_services (
          id,
          title,
          price,
          service_id
        )
      `
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch active booking' })
    }

    if (!serviceRequests || serviceRequests.length === 0) {
      return res.status(200).json(null)
    }

    // Cast to unknown first, then to ServiceRequest[]
    const requests = serviceRequests as unknown as ServiceRequest[]

    // Map subServices and cart to match frontend store
    const subServices = requests.map(request => ({
      id: request.sub_services.id,
      service_id: request.sub_services.service_id,
      service_title: '', // ถ้ามี
      title: request.sub_services.title,
      price: request.sub_services.price,
      unit: '', // ถ้ามี
    }))
    const cart = requests.map(request => ({
      id: request.sub_services.id,
      quantity: request.quantity,
    }))

    const subServicesObj = requests[0]?.sub_services
    const serviceId = subServicesObj ? subServicesObj.service_id : null
    const serviceName = subServicesObj ? subServicesObj.title : ''

    const activeBooking = {
      serviceId,
      serviceName,
      subServices,
      cart,
      customerInfo: {
        serviceDate: new Date(requests[0].appointment_at),
        serviceTime: new Date(requests[0].appointment_at).toLocaleTimeString(
          'th-TH',
          {
            hour: '2-digit',
            minute: '2-digit',
          }
        ),
        address: requests[0].address,
        province: requests[0].province,
        district: requests[0].district,
        subDistrict: requests[0].sub_district,
        additionalInfo: requests[0].additional_info ?? '',
        latitude: requests[0].latitude,
        longitude: requests[0].longitude,
      },
    }

    return res.status(200).json(activeBooking)
  } catch (error) {
    return res.status(500).json({
      error: 'Internal server error',
      details: (error as Error).message,
    })
  }
}

import { NextApiRequest, NextApiResponse } from 'next'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { geocodeAddress } from '@/utils/location'

interface CartItem {
  id: number
  price: number
  quantity: number
}

interface Coordinates {
  lat: number
  lng: number
}

// Use custom server client wrapper

// Interface removed since we're using direct object mapping now

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

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Create authenticated Supabase client
  const supabase = createSupabaseServerClient({ req, res })

  // Get user from session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const userId = session.user.id

  try {
    const {
      items,
      customerInfo,
      paymentIntentId,
      paymentStatus = 'paid',
    } = req.body

    // Validate required fields
    if (!items || !customerInfo) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Log incoming data for debugging
    console.log('🔍 Debugging booking creation:')
    console.log('userId:', userId)
    console.log('items:', JSON.stringify(items, null, 2))
    console.log('customerInfo:', JSON.stringify(customerInfo, null, 2))
    console.log('paymentIntentId:', paymentIntentId)
    console.log('paymentStatus:', paymentStatus)

    // Format appointment datetime
    const appointmentDateTime = new Date(customerInfo.serviceDate)
    const [hours, minutes] = customerInfo.serviceTime.split(':')
    appointmentDateTime.setHours(parseInt(hours), parseInt(minutes))

    // Get GPS coordinates if not provided manually
    let latitude = customerInfo.latitude
    let longitude = customerInfo.longitude

    if (!latitude || !longitude) {
      try {
        const coordinates = (await geocodeAddress(
          `${customerInfo.address} ${customerInfo.subDistrict} ${customerInfo.district} ${customerInfo.province}`
        )) as Coordinates
        latitude = coordinates.lat
        longitude = coordinates.lng
      } catch (error) {
        console.error('Geocoding error:', error)
        // Continue without coordinates
      }
    }

    // Prepare service requests
    const serviceRequests = (items as CartItem[]).map(item => ({
      user_id: userId,
      sub_service_id: item.id,
      address: customerInfo.address,
      province: customerInfo.province,
      district: customerInfo.district,
      sub_district: customerInfo.subDistrict,
      additional_info: customerInfo.additionalInfo ?? null,
      latitude: latitude ?? null,
      longitude: longitude ?? null,
      appointment_at: appointmentDateTime.toISOString(),
      total_price: item.price * item.quantity,
      quantity: item.quantity,
    }))

    // Insert to database
    const { data, error } = await supabase
      .from('service_requests')
      .insert(serviceRequests)
      .select()

    if (error) {
      console.error('❌ Supabase error:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))
      return res.status(500).json({
        error: 'Failed to create booking',
        details: error.message,
        supabaseError: error,
      })
    }

    console.log('✅ Successfully inserted to database:', data)

    // Generate booking ID from the first inserted record
    const bookingId =
      data && data[0] ? `BKG-${data[0].id}` : `BKG-${Date.now()}`

    // TODO: บันทึกข้อมูล payment ใน table แยก (ถ้าต้องการ)
    // const paymentRecord = {
    //   booking_id: bookingId,
    //   payment_intent_id: paymentIntentId,
    //   payment_status: paymentStatus,
    //   total_amount: totalAmount,
    //   payment_method: 'creditcard'
    // }
    // await supabase.from('payments').insert([paymentRecord])

    // Return success response
    return res.status(200).json({
      success: true,
      bookingId,
      serviceRequests: data,
      message: 'Booking created successfully',
      totalRecords: data?.length || 0,
    })
  } catch (error) {
    console.error('API error:', error)
    return res.status(500).json({
      error: 'Internal server error',
      details: (error as Error).message,
    })
  }
}

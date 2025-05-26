import { NextApiRequest, NextApiResponse } from 'next'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { geocodeAddress } from '@/utils/location'

// Use custom server client wrapper

// Interface removed since we're using direct object mapping now

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
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
      console.log('🌍 GPS not provided, trying to geocode address...')
      try {
        const fullAddress = `${customerInfo.address} ${customerInfo.subDistrict} ${customerInfo.district} ${customerInfo.province} ประเทศไทย`
        console.log('📍 Geocoding address:', fullAddress)

        const coordinates = await geocodeAddress(fullAddress)
        latitude = coordinates.lat
        longitude = coordinates.lng

        console.log('✅ Geocoding successful:', { latitude, longitude })
      } catch (geocodeError) {
        console.warn('⚠️ Geocoding failed:', geocodeError)
        // Continue without GPS coordinates - not critical for booking
        latitude = null
        longitude = null
      }
    } else {
      console.log('📍 Using provided GPS coordinates:', { latitude, longitude })
    }

    // Prepare service requests data - one record per unique sub_service_id with quantity
    const serviceRequests = items.map(
      (item: { id: number; price: number; quantity: number }) => ({
        user_id: userId,
        sub_service_id: item.id,
        address: customerInfo.address,
        province: customerInfo.province,
        district: customerInfo.district,
        sub_district: customerInfo.subDistrict,
        additional_info: customerInfo.additionalInfo ?? null,
        latitude: latitude,
        longitude: longitude,
        appointment_at: appointmentDateTime.toISOString(),
        total_price: item.price * item.quantity, // total price for this service
        quantity: item.quantity,
        // Note: ลบ quantity, payment_intent_id, payment_status ออกเพราะอาจไม่มีใน table จริง
      })
    )

    // Log prepared data for debugging
    console.log('📝 Prepared service requests data:')
    console.log(JSON.stringify(serviceRequests, null, 2))

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

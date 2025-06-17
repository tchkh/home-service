import { NextApiRequest, NextApiResponse } from 'next'
import Stripe from 'stripe'

// Initialize Stripe with error handling
let stripe: Stripe
try {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-05-28.basil',
  })
} catch (error) {
  console.error('Failed to initialize Stripe:', error)
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

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!stripe) {
    return res.status(500).json({ error: 'Stripe is not initialized' })
  }

  try {
    const { amount, bookingId, customerId, customerInfo, items } = req.body

    // Validate amount
    if (!amount || amount < 20) {
      return res.status(400).json({ error: 'Minimum amount is 20 THB' })
    }

    // Create Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to satang
      currency: 'thb',
      // สำหรับ demo ใช้ automatic confirmation
      confirm: false, // จะ confirm ใน client
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never', // ป้องกัน redirect สำหรับ demo
      },
      metadata: {
        bookingId: bookingId || `booking_${Date.now()}`,
        customerId: customerId || 'demo_customer',
        serviceDate: customerInfo?.serviceDate || '',
        serviceTime: customerInfo?.serviceTime || '',
        address: customerInfo?.address || '',
        itemCount: String(items?.length || 0),
      },
    })

    // TODO: บันทึกข้อมูลการจองเบื้องต้นลง database พร้อม payment intent ID
    // const booking = {
    //   bookingId: bookingId || `booking_${Date.now()}`,
    //   paymentIntentId: paymentIntent.id,
    //   customerId: customerId || 'demo_customer',
    //   customerInfo: customerInfo,
    //   items: items,
    //   totalAmount: amount,
    //   paymentStatus: 'pending',
    //   createdAt: new Date(),
    // }
    // await db.bookings.create({ data: booking })

    console.log('Created payment intent:', paymentIntent.id)

    return res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    })
  } catch (error) {
    console.error('Stripe error:', error)

    // ส่ง error message ที่ชัดเจนกว่า
    if (error instanceof Stripe.errors.StripeError) {
      return res.status(400).json({
        error: error.message,
        type: error.type,
        code: error.code,
      })
    } else {
      return res.status(500).json({
        error: 'Failed to create payment intent',
        details: (error as Error).message,
      })
    }
  }
}

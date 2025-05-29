import { loadStripe } from '@stripe/stripe-js'

// ใส่ Publishable Key (pk_test_xxx หรือ pk_live_xxx)
export const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
)

// pages/api/create-payment-intent.ts
import { NextApiRequest, NextApiResponse } from 'next'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
})

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { amount, bookingId, customerId } = req.body

    // สร้าง Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Stripe ใช้หน่วยเป็น satang/cents
      currency: 'thb',
      payment_method_types: ['card', 'promptpay'], // Stripe รองรับ PromptPay
      metadata: {
        bookingId,
        customerId,
      },
    })

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
    })
  } catch (error) {
    console.error('Error creating payment intent:', error)
    res.status(500).json({ error: 'Failed to create payment intent' })
  }
}

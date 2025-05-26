import { loadStripe } from '@stripe/stripe-js'

console.log('🔑 Stripe key available:', !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
console.log('🔑 Stripe key length:', process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.length)
console.log('🔑 Stripe key preview:', process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.substring(0, 20) + '...')

// Use the official Stripe test key for testing
const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_TYooMQauvdEDq54NiTphI7jx'

const stripePromise = loadStripe(publishableKey).then(stripe => {
  console.log('✅ Stripe loaded successfully:', !!stripe)
  if (stripe) {
    console.log('🎯 Stripe instance ready')
  } else {
    console.error('❌ Stripe instance is null')
  }
  return stripe
}).catch(error => {
  console.error('❌ Stripe loading failed:', error)
  return null
})

export { stripePromise }

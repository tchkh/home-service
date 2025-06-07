import { loadStripe } from '@stripe/stripe-js'

// Use the official Stripe test key for testing
const publishableKey =
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ??
  'pk_test_TYooMQauvdEDq54NiTphI7jx'

const stripePromise = loadStripe(publishableKey)
  .then(stripe => {
    if (!stripe) {
      console.error('❌ Stripe instance is null')
    }
    return stripe
  })
  .catch(error => {
    console.error('❌ Stripe loading failed:', error)
    return null
  })

export { stripePromise }

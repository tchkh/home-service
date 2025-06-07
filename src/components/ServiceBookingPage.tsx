import React, { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useBookingStore } from '@/stores/bookingStore'
import { useServiceDetails } from '@/hooks/api/useServiceDetails'
import { useAuth } from '@/hooks/useAuth'
import toast from 'react-hot-toast'

import BookingHeader from './BookingHeader'
import BookingStepper, { STEPS_DATA } from './BookingStepper'
import ServiceSelection from './ServiceSelection'
import OrderSummary from './OrderSummary'
import BookingFooter from './BookingFooter'
import BookingDetailsForm from './BookingDetailsForm'
import PaymentForm from './PaymentForm'
import { Elements } from '@stripe/react-stripe-js'
import { stripePromise } from '@/lib/stripe'

interface ServiceBookingPageProps {
  id: string
}

const STEP_MAP = {
  items: 0,
  details: 1,
  payment: 2,
} as const

const ServiceBookingPage: React.FC<ServiceBookingPageProps> = ({ id }) => {
  const router = useRouter()
  const { userId } = useAuth()
  const [paymentHandler, setPaymentHandler] = React.useState<
    (() => Promise<void>) | null
  >(null)
  const [isPaymentProcessing, setIsPaymentProcessing] = React.useState(false)
  const [isNavigating, setIsNavigating] = React.useState(false)

  // Debug payment handler registration
  const handlePaymentHandlerChange = React.useCallback(
    (handler: (() => Promise<void>) | null) => {
      console.log('💎 Payment handler updated', {
        hasHandler: !!handler,
        handlerType: typeof handler,
        isFunction: typeof handler === 'function',
        handlerToString: handler?.toString().substring(0, 100) + '...',
      })

      // Extra validation before setting
      if (handler && typeof handler === 'function') {
        console.log('✅ Setting valid function handler')
        setPaymentHandler(() => handler)
      } else if (handler === null) {
        console.log('🔄 Setting handler to null')
        setPaymentHandler(null)
      } else {
        console.error('❌ Refusing to set invalid handler:', typeof handler)
        // Don't set invalid handlers
      }
    },
    []
  )

  const {
    currentStep,
    setCurrentStep,
    serviceId,
    setServiceId,
    setSubServices,
    canProceedToNext,
    // resetBooking, // removed as not used
  } = useBookingStore()

  // Fetch service details
  const { data: subServices, isLoading, error } = useServiceDetails(serviceId)
  console.log('subServices: ', subServices)

  // Set service ID from props
  useEffect(() => {
    if (id && id !== serviceId) {
      setServiceId(id)
    }
  }, [id, serviceId, setServiceId])

  // Update sub-services when data is fetched
  useEffect(() => {
    if (subServices) {
      // Ensure service_title is always a string
      const validatedSubServices = subServices.map(service => ({
        ...service,
        service_title: service.service_title ?? '',
      }))
      setSubServices(validatedSubServices)
    }
  }, [subServices, setSubServices])

  // Debug logging for payment button state
  useEffect(() => {
    console.log(
      '🎯 Payment button state (current step: ' + currentStep + '):',
      {
        isPaymentStep: currentStep === 'payment',
        paymentHandler: !!paymentHandler,
        isPaymentProcessing,
        isNavigating,
        userId: !!userId,
        canProceed:
          currentStep === 'payment'
            ? !!paymentHandler &&
              !isPaymentProcessing &&
              !isNavigating &&
              !!userId
            : canProceedToNext() && !isNavigating,
      }
    )
  }, [
    currentStep,
    paymentHandler,
    isPaymentProcessing,
    isNavigating,
    userId,
    canProceedToNext,
  ])

  // Handle navigation
  const handleNext = async () => {
    console.log('🚀 handleNext called', {
      currentStep,
      paymentHandler: !!paymentHandler,
      isPaymentProcessing,
      isNavigating,
    })

    // ป้องกันการเรียกหลายครั้งพร้อมกัน
    if (isNavigating || isPaymentProcessing) {
      console.log('🚫 Already processing, skipping')
      return
    }

    const steps: Array<typeof currentStep> = ['items', 'details', 'payment']
    const currentIndex = steps.indexOf(currentStep)

    if (currentIndex < steps.length - 1) {
      setIsNavigating(true)
      setCurrentStep(steps[currentIndex + 1])
      toast.success(
        `ไปยังขั้นตอน: ${STEPS_DATA[STEP_MAP[steps[currentIndex + 1]]].name}`,
        {
          duration: 2000,
        }
      )
      setTimeout(() => setIsNavigating(false), 500) // Reset after short delay
    } else {
      // Process payment
      console.log('💳 Processing payment...', {
        paymentHandler: !!paymentHandler,
        paymentHandlerType: typeof paymentHandler,
        paymentHandlerValue: paymentHandler,
        isPaymentProcessing,
      })

      if (
        paymentHandler &&
        typeof paymentHandler === 'function' &&
        !isPaymentProcessing
      ) {
        setIsPaymentProcessing(true)
        try {
          console.log('✨ Calling payment handler...')
          await paymentHandler()
        } catch (error) {
          console.error('Payment processing error:', error)
          toast.error('การชำระเงินล้มเหลว กรุณาลองใหม่', {
            duration: 3000,
          })
        } finally {
          setIsPaymentProcessing(false)
        }
      } else if (!paymentHandler) {
        console.error('❌ No payment handler available')
        toast.error('ระบบการชำระเงินยังไม่พร้อม กรุณาลองใหม่', {
          duration: 3000,
        })
      } else if (typeof paymentHandler !== 'function') {
        console.error('❌ paymentHandler is not a function:', {
          type: typeof paymentHandler,
          value: paymentHandler,
        })
        toast.error('ระบบการชำระเงินมีปัญหา กรุณาลองใหม่', {
          duration: 3000,
        })
      } else {
        console.warn('⚠️ Payment already processing')
      }
    }
  }

  const handleBack = () => {
    const steps: Array<typeof currentStep> = ['items', 'details', 'payment']
    const currentIndex = steps.indexOf(currentStep)

    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1])
      toast(
        `กลับไปยังขั้นตอน: ${
          STEPS_DATA[STEP_MAP[steps[currentIndex - 1]]].name
        }`,
        {
          duration: 2000,
        }
      )
    } else {
      // Go back to service selection page
      router.push('/services')
    }
  }

  // Removed handleSubmitBooking as it's no longer used
  // Payment is now handled directly by PaymentForm

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-32 bg-gray-200 rounded-t-lg mb-6"></div>
            <div className="h-20 bg-gray-200 rounded-lg mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 h-96 bg-gray-200 rounded-lg"></div>
              <div className="h-64 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">
              เกิดข้อผิดพลาดในการโหลดข้อมูล กรุณาลองใหม่อีกครั้ง
            </p>
          </div>
        </div>
      </div>
    )
  }

  const isBackDisabled = currentStep === 'items'
  const nextButtonText = currentStep === 'payment' ? 'ชำระเงิน' : 'ดำเนินการต่อ'

  // Debug - check if can proceed to next step or process payment
  const canProceed =
    currentStep === 'payment'
      ? !!paymentHandler && !isPaymentProcessing && !isNavigating && !!userId
      : canProceedToNext() && !isNavigating

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <BookingHeader />
        <BookingStepper currentStepId={currentStep} steps={STEPS_DATA} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            {currentStep === 'items' && (
              <ServiceSelection onNext={handleNext} onBack={handleBack} />
            )}
            {currentStep === 'details' && <BookingDetailsForm />}
            {currentStep === 'payment' && (
              <Elements stripe={stripePromise}>
                <PaymentForm onPaymentReady={handlePaymentHandlerChange} />
              </Elements>
            )}
          </div>

          <div className="md:col-span-1">
            <OrderSummary />
          </div>
        </div>

        <BookingFooter
          onBack={handleBack}
          onNext={handleNext}
          isNextDisabled={!canProceed}
          isBackDisabled={isBackDisabled}
          nextButtonText={nextButtonText}
          currentStep={currentStep}
        />
      </div>
    </div>
  )
}

export default ServiceBookingPage

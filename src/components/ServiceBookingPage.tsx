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
      // Extra validation before setting
      if (handler && typeof handler === 'function') {
        setPaymentHandler(() => handler)
      } else if (handler === null) {
        setPaymentHandler(null)
      } else {
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
    // No need to log payment button state
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
    // ป้องกันการเรียกหลายครั้งพร้อมกัน
    if (isNavigating || isPaymentProcessing) {
      return
    }

    const steps: Array<typeof currentStep> = ['items', 'details', 'payment']
    const currentIndex = steps.indexOf(currentStep)

    if (currentIndex < steps.length - 1) {
      setIsNavigating(true)
      setCurrentStep(steps[currentIndex + 1])
      setTimeout(() => setIsNavigating(false), 500) // Reset after short delay
    } else {
      // Process payment
      if (
        paymentHandler &&
        typeof paymentHandler === 'function' &&
        !isPaymentProcessing
      ) {
        setIsPaymentProcessing(true)
        try {
          await paymentHandler()
        } catch {
          toast.error('การชำระเงินล้มเหลว กรุณาลองใหม่', {
            duration: 3000,
          })
        } finally {
          setIsPaymentProcessing(false)
        }
      } else if (!paymentHandler) {
        toast.error('ระบบการชำระเงินยังไม่พร้อม กรุณาลองใหม่', {
          duration: 3000,
        })
      } else if (typeof paymentHandler !== 'function') {
        toast.error('ระบบการชำระเงินมีปัญหา กรุณาลองใหม่', {
          duration: 3000,
        })
      }
    }
  }

  const handleBack = () => {
    const steps: Array<typeof currentStep> = ['items', 'details', 'payment']
    const currentIndex = steps.indexOf(currentStep)

    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1])
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* BookingHeader: เต็มจอ */}
      <BookingHeader />

      {/* Main content container */}
      <div className="w-full max-w-7xl mx-auto flex-1 flex flex-col px-4 py-6">
        <BookingStepper currentStepId={currentStep} steps={STEPS_DATA} />

        {/* Desktop layout: side-by-side, Mobile: stacked */}
        <div className="flex flex-col lg:flex-row lg:gap-8 mt-6">
          {/* Main content area */}
          <div className="flex-1 lg:flex-[2] order-1 lg:order-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-300 p-6">
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
          </div>

          {/* OrderSummary: mobile อยู่ล่าง, desktop อยู่ขวา */}
          <div className="lg:flex-1 order-2 lg:order-2 mt-6 lg:mt-0">
            <div className="lg:sticky lg:top-6">
              <OrderSummary />
            </div>
          </div>
        </div>

        {/* BookingFooter: อยู่ล่างสุดเสมอ */}
        <div className="mt-6">
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
    </div>
  )
}

export default ServiceBookingPage

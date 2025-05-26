import React, { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useBookingStore } from '@/stores/bookingStore'
import { useServiceDetails } from '@/hooks/api/useServiceDetails'
import { useToast } from '@/hooks/use-toast'

import BookingHeader from './BookingHeader'
import BookingStepper, { STEPS_DATA } from './BookingStepper'
import ServiceSelection from './ServiceSelection'
import OrderSummary from './OrderSummary'
import BookingFooter from './BookingFooter'
import BookingDetailsForm from './BookingDetailsForm'
import PaymentForm from './PaymentForm'

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
  const { toast } = useToast()

  const {
    currentStep,
    setCurrentStep,
    serviceId,
    setServiceId,
    setSubServices,
    canProceedToNext,
    resetBooking,
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
      setSubServices(subServices)
    }
  }, [subServices, setSubServices])

  // Handle navigation
  const handleNext = () => {
    const steps: Array<typeof currentStep> = ['items', 'details', 'payment']
    const currentIndex = steps.indexOf(currentStep)

    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1])
      toast({
        title: 'ดำเนินการต่อ',
        description: `ไปยังขั้นตอน: ${
          STEPS_DATA[STEP_MAP[steps[currentIndex + 1]]].name
        }`,
      })
    } else {
      // Submit booking
      handleSubmitBooking()
    }
  }

  const handleBack = () => {
    const steps: Array<typeof currentStep> = ['items', 'details', 'payment']
    const currentIndex = steps.indexOf(currentStep)

    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1])
      toast({
        title: 'ย้อนกลับ',
        description: `กลับไปยังขั้นตอน: ${
          STEPS_DATA[STEP_MAP[steps[currentIndex - 1]]].name
        }`,
      })
    } else {
      // Go back to service selection page
      router.push('/services')
    }
  }

  const handleSubmitBooking = async () => {
    try {
      // In real implementation, you would use the mutation hook here
      toast({
        title: 'ยืนยันการจอง',
        description: 'การจองของคุณได้รับการยืนยันแล้ว',
      })

      // Reset and redirect
      resetBooking()
      router.push('/booking-success')
    } catch {
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถทำการจองได้ กรุณาลองใหม่อีกครั้ง',
        variant: 'destructive',
      })
    }
  }

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
  const nextButtonText =
    currentStep === 'payment' ? 'ยืนยันการชำระเงิน' : 'ดำเนินการต่อ'

  // Debug
  const canProceed = canProceedToNext()

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <BookingHeader />
        <BookingStepper currentStepId={currentStep} steps={STEPS_DATA} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            {currentStep === 'items' && <ServiceSelection />}
            {currentStep === 'details' && <BookingDetailsForm />}
            {currentStep === 'payment' && <PaymentForm />}
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
        />
      </div>
    </div>
  )
}

export default ServiceBookingPage

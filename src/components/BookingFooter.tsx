import React from 'react'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/router'
import { toast } from 'react-hot-toast'
import { useBookingStore } from '@/stores/bookingStore'
import { STEPS_DATA } from './BookingStepper'

interface BookingFooterProps {
  onBack: () => void
  onNext: () => void
  isNextDisabled: boolean
  isBackDisabled?: boolean
  nextButtonText?: string // New optional prop for the next button text
  currentStep: 'items' | 'details' | 'payment'
}

const STEP_MAP = {
  items: 0,
  details: 1,
  payment: 2,
} as const

const BookingFooter: React.FC<BookingFooterProps> = ({
  onBack,
  onNext,
  isNextDisabled,
  isBackDisabled = false, // Changed default to false to make back button usually enabled unless explicitly disabled
  nextButtonText = 'ดำเนินการต่อ', // Default text
  currentStep,
}) => {
  const router = useRouter()
  const { userId, loading } = useAuth()
  const { getActiveCartItems } = useBookingStore()

  const handleNext = () => {
    if (!userId && !loading) {
      toast.error('กรุณาเข้าสู่ระบบก่อนดำเนินการต่อ', {
        duration: 3000,
      })
      router.push(`/login?redirect=${encodeURIComponent(router.asPath)}`)
      return
    }

    if (currentStep === 'items') {
      const selectedItems = getActiveCartItems()
      if (selectedItems.length === 0) {
        toast.error('กรุณาเลือกบริการอย่างน้อย 1 รายการ')
        return
      }
    }

    onNext()

    // Show success toast after navigation
    const steps: Array<typeof currentStep> = ['items', 'details', 'payment']
    const currentIndex = steps.indexOf(currentStep)
    if (currentIndex < steps.length - 1) {
      toast.success(
        `ไปยังขั้นตอน: ${STEPS_DATA[STEP_MAP[steps[currentIndex + 1]]].name}`,
        {
          duration: 2000,
        }
      )
    }
  }

  const handleBack = () => {
    onBack()

    // Show toast after navigation
    const steps: Array<typeof currentStep> = ['items', 'details', 'payment']
    const currentIndex = steps.indexOf(currentStep)
    if (currentIndex > 0) {
      toast.success(
        `กลับไปยังขั้นตอน: ${
          STEPS_DATA[STEP_MAP[steps[currentIndex - 1]]].name
        }`,
        {
          duration: 2000,
        }
      )
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-300 p-4">
      <div className="flex flex-col gap-3 md:flex-row md:justify-between md:items-center max-w-7xl mx-auto">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={isBackDisabled}
          className="w-full md:w-auto px-6 py-2 border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> ย้อนกลับ
        </Button>
        <Button
          onClick={handleNext}
          disabled={isNextDisabled || loading}
          className="w-full md:w-auto px-8 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium"
        >
          {loading
            ? 'กำลังโหลด...'
            : !userId
            ? 'เข้าสู่ระบบเพื่อดำเนินการต่อ'
            : nextButtonText}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

export default BookingFooter

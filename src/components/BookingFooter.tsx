import React, { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/router'
import { toast } from 'react-hot-toast'
import { useBookingStore } from '@/stores/bookingStore'

interface BookingFooterProps {
  onBack: () => void
  onNext: () => void
  isNextDisabled: boolean
  isBackDisabled?: boolean
  nextButtonText?: string // New optional prop for the next button text
  currentStep: 'items' | 'details' | 'payment'
}

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

  // Debug auth state
  useEffect(() => {
    console.log('🔑 Auth state changed:', { userId, loading })
  }, [userId, loading])

  const handleNext = () => {
    if (!userId && !loading) {
      toast.error('กรุณาเข้าสู่ระบบก่อนดำเนินการต่อ', {
        duration: 3000,
        position: 'top-right',
      })
      router.push(`/login?redirect=${encodeURIComponent(router.asPath)}`)
      return
    }

    if (currentStep === 'items') {
      const selectedItems = getActiveCartItems()
      if (selectedItems.length === 0) {
        toast.error('กรุณาเลือกบริการอย่างน้อย 1 รายการ', {
          position: 'top-right',
        })
        return
      }
    }

    onNext()
  }

  return (
    <div className="mt-8 p-6 bg-white rounded-lg shadow flex justify-between items-center">
      <Button
        variant="outline"
        onClick={onBack}
        disabled={isBackDisabled}
        className="btn--secondary cursor-pointer"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> ย้อนกลับ
      </Button>
      <Button
        onClick={handleNext}
        disabled={isNextDisabled || loading}
        className="btn--primary cursor-pointer"
      >
        {loading
          ? 'กำลังโหลด...'
          : !userId
          ? 'เข้าสู่ระบบเพื่อดำเนินการต่อ'
          : nextButtonText}{' '}
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  )
}

export default BookingFooter

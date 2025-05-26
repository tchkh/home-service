import React from 'react'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight } from 'lucide-react'

interface BookingFooterProps {
  onBack: () => void
  onNext: () => void
  isNextDisabled: boolean
  isBackDisabled?: boolean
  nextButtonText?: string // New optional prop for the next button text
}

const BookingFooter: React.FC<BookingFooterProps> = ({
  onBack,
  onNext,
  isNextDisabled,
  isBackDisabled = false, // Changed default to false to make back button usually enabled unless explicitly disabled
  nextButtonText = 'ดำเนินการต่อ', // Default text
}) => {
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
        onClick={onNext}
        disabled={isNextDisabled}
        className="btn--primary cursor-pointer"
      >
        {nextButtonText} <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  )
}

export default BookingFooter

import React from 'react'
import { Step } from '@/types'
import { cn } from '@/lib/utils'
import { List, Edit3, CreditCard } from 'lucide-react' // Using available icons

export const STEPS_DATA: Step[] = [
  { id: 'items', name: 'รายการ', icon: List },
  { id: 'details', name: 'กรอกข้อมูลบริการ', icon: Edit3 },
  { id: 'payment', name: 'ชำระเงิน', icon: CreditCard },
]

interface BookingStepperProps {
  currentStepId: string
  steps: Step[]
}

const BookingStepper: React.FC<BookingStepperProps> = ({
  currentStepId,
  steps,
}) => {
  const currentStepIndex = steps.findIndex(step => step.id === currentStepId)

  return (
    <div className="bg-white shadow-md rounded-lg p-6 relative z-10 mb-6">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isActive = step.id === currentStepId
          const isCompleted = index < currentStepIndex
          const IconComponent = step.icon

          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center text-center">
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center border-2 mb-2',
                    isActive
                      ? 'bg-blue-500 border-blue-500 text-white'
                      : isCompleted
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'bg-gray-100 border-gray-300 text-gray-400'
                  )}
                >
                  <IconComponent size={20} />
                </div>
                <span
                  className={cn(
                    'text-xs sm:text-sm',
                    isActive
                      ? 'font-semibold text-blue-600'
                      : isCompleted
                      ? 'text-green-600'
                      : 'text-gray-500'
                  )}
                >
                  {step.name}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'flex-1 h-0.5 mx-2 sm:mx-4',
                    isCompleted ? 'bg-green-500' : 'bg-gray-300'
                  )}
                />
              )}
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}

export default BookingStepper

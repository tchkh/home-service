import React from "react";
import { Step } from "@/types";
import { cn } from "@/lib/utils";
import { List, Edit3, CreditCard } from "lucide-react"; // Using available icons

export const STEPS_DATA: Step[] = [
  { id: "items", name: "รายการ", icon: List },
  { id: "details", name: "กรอกข้อมูลบริการ", icon: Edit3 },
  { id: "payment", name: "ชำระเงิน", icon: CreditCard },
];

interface BookingStepperProps {
  currentStepId: string;
  steps: Step[];
}

const BookingStepper: React.FC<BookingStepperProps> = ({
  currentStepId,
  steps,
}) => {
  const currentStepIndex = steps.findIndex((step) => step.id === currentStepId);

  return (
    <div className="w-full -mt-8 md:-mt-12 mb-6 relative z-10">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          {steps.map((step, index) => {
            const isActive = step.id === currentStepId;
            const isCompleted = index < currentStepIndex;
            const IconComponent = step.icon;

            return (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center text-center flex-shrink-0">
                  <div
                    className={cn(
                      "w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center border-2 mb-2 transition-all duration-200",
                      isActive
                        ? "bg-blue-500 border-blue-500 text-white shadow-lg scale-110"
                        : isCompleted
                          ? "bg-green-500 border-green-500 text-white shadow-md"
                          : "bg-gray-100 border-gray-300 text-gray-400",
                    )}
                  >
                    <IconComponent size={isActive ? 22 : 18} className="md:w-6 md:h-6" />
                  </div>
                  <span
                    className={cn(
                      "text-xs md:text-base font-medium px-1 md:px-2 whitespace-nowrap leading-tight",
                      isActive
                        ? "font-semibold text-blue-600"
                        : isCompleted
                          ? "font-semibold text-green-600"
                          : "text-gray-500",
                    )}
                  >
                    {step.name}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className="flex-1 mx-4 md:mx-6">
                    <div
                      className={cn(
                        "h-0.5 md:h-1 rounded-full transition-all duration-300",
                        isCompleted ? "bg-green-500" : "bg-gray-300",
                      )}
                    />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BookingStepper;

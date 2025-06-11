import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/router";
import { toast } from "react-hot-toast";
import { useBookingStore } from "@/stores/bookingStore";
import { STEPS_DATA } from "./BookingStepper";

interface BookingFooterProps {
  onBack: () => void;
  onNext: () => void;
  isNextDisabled: boolean;
  isBackDisabled?: boolean;
  nextButtonText?: string; // New optional prop for the next button text
  currentStep: "items" | "details" | "payment";
}

const STEP_MAP = {
  items: 0,
  details: 1,
  payment: 2,
} as const;

const BookingFooter: React.FC<BookingFooterProps> = ({
  onBack,
  onNext,
  isNextDisabled,
  isBackDisabled = false, // Changed default to false to make back button usually enabled unless explicitly disabled
  nextButtonText = "ดำเนินการต่อ", // Default text
  currentStep,
}) => {
  const router = useRouter();
  const { userId, loading } = useAuth();
  const { getActiveCartItems } = useBookingStore();

  const handleNext = () => {
    if (!userId && !loading) {
      toast.error("กรุณาเข้าสู่ระบบก่อนดำเนินการต่อ", {
        duration: 3000,
      });
      router.push(`/login?redirect=${encodeURIComponent(router.asPath)}`);
      return;
    }

    if (currentStep === "items") {
      const selectedItems = getActiveCartItems();
      if (selectedItems.length === 0) {
        toast.error("กรุณาเลือกบริการอย่างน้อย 1 รายการ");
        return;
      }
    }

    onNext();

    // Show success toast after navigation
    const steps: Array<typeof currentStep> = ["items", "details", "payment"];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      toast.success(
        `ไปยังขั้นตอน: ${STEPS_DATA[STEP_MAP[steps[currentIndex + 1]]].name}`,
        {
          duration: 2000,
        },
      );
    }
  };

  const handleBack = () => {
    onBack();

    // Show toast after navigation
    const steps: Array<typeof currentStep> = ["items", "details", "payment"];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      toast.success(
        `กลับไปยังขั้นตอน: ${
          STEPS_DATA[STEP_MAP[steps[currentIndex - 1]]].name
        }`,
        {
          duration: 2000,
        },
      );
    }
  };

  return (
    <>
      {/* Mobile: Fixed bottom footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg lg:hidden z-50">
        <div className="p-4 pb-safe">
          <div className="flex gap-3 max-w-sm mx-auto">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={isBackDisabled}
              className="flex-1 py-3 border-gray-300 text-gray-700 hover:bg-gray-50 font-medium cursor-pointer"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              ย้อนกลับ
            </Button>
            <Button
              onClick={handleNext}
              disabled={isNextDisabled || loading}
              className="flex-[2] py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium text-base cursor-pointer"
            >
              {loading
                ? "กำลังโหลด..."
                : !userId
                  ? "เข้าสู่ระบบ"
                  : nextButtonText}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop: Fixed bottom footer - full width */}
      <div className="hidden lg:block fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="w-full px-6 py-4">
          <div className="flex justify-between items-center max-w-7xl mx-auto">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={isBackDisabled}
              className="px-6 py-3 border-gray-300 text-gray-700 hover:bg-gray-50 font-medium text-base cursor-pointer"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> ย้อนกลับ
            </Button>
            <Button
              onClick={handleNext}
              disabled={isNextDisabled || loading}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium text-base cursor-pointer"
            >
              {loading
                ? "กำลังโหลด..."
                : !userId
                  ? "เข้าสู่ระบบเพื่อดำเนินการต่อ"
                  : nextButtonText}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default BookingFooter;

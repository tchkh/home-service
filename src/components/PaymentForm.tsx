import React, { useState, useEffect, useCallback, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useBookingStore } from "@/stores/bookingStore";
import { simplePaymentSchema, SimplePaymentForm } from "@/schemas/booking";
import toast from "react-hot-toast";
import { useRouter } from "next/router";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CreditCard, QrCode } from "lucide-react";
import Image from "next/image";
import axios from "axios";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface PaymentFormProps {
  onPaymentReady?: (paymentHandler: () => Promise<void>) => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ onPaymentReady }) => {
  const router = useRouter();
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const { userId } = useAuth();

  // PromptPay QR Code states
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrCodeData, setQrCodeData] = useState<{
    qrCode: string;
    paymentId: string;
    amount: number;
    promptPayId: string;
    expiresIn: number;
  } | null>(null);
  const [qrCountdown, setQrCountdown] = useState(0);

  const {
    paymentInfo,
    updatePaymentInfo,
    getTotalAmount,
    customerInfo,
    getActiveCartItems,
  } = useBookingStore();

  const form = useForm<SimplePaymentForm>({
    resolver: zodResolver(simplePaymentSchema),
    defaultValues: {
      method: paymentInfo.method,
      cardName: paymentInfo.cardName,
      promoCode: paymentInfo.promoCode,
    },
  });

  const paymentMethod = form.watch("method");
  const totalAmount = getTotalAmount();

  // Store refs for latest values (to avoid stale closures)
  const storeRef = useRef({
    customerInfo,
    getActiveCartItems,
    totalAmount,
    userId,
  });

  useEffect(() => {
    storeRef.current = {
      customerInfo,
      getActiveCartItems,
      totalAmount,
      userId,
    };
  }, [customerInfo, getActiveCartItems, totalAmount, userId]);

  // จำลองการชำระเงินสำเร็จผ่าน PromptPay
  const handlePromptPaySuccess = useCallback(
    async (paymentId: string) => {
      setShowQRModal(false);
      setIsProcessing(true);

      try {
        toast.success(
          "ชำระเงินผ่านพร้อมเพย์สำเร็จ! กำลังบันทึกข้อมูลการจอง...",
          {
            duration: 4000,
          },
        );

        // Use refs for latest values
        const { customerInfo, getActiveCartItems, totalAmount, userId } =
          storeRef.current;

        // บันทึกข้อมูลการจองลง Supabase
        const { data: bookingData } = await axios.post(
          "/api/booking/create",
          {
            userId: userId,
            items: getActiveCartItems(),
            customerInfo: customerInfo,
            totalAmount: totalAmount,
            paymentIntentId: paymentId,
            paymentStatus: "paid",
          },
          {
            withCredentials: true,
          },
        );

        console.log("Booking created successfully:", bookingData.bookingId);

        // Redirect to success page
        router.push(`/booking-success?payment_intent=${paymentId}`);
      } catch (error) {
        console.error("Error processing PromptPay payment:", error);
        toast.error("เกิดข้อผิดพลาดในการดำเนินการ", {
          duration: 5000,
        });
      } finally {
        setIsProcessing(false);
      }
    },
    [setShowQRModal, setIsProcessing, router],
  );

  // PromptPay Payment
  const processPromptPayPayment = useCallback(async () => {
    // Use refs for latest values
    const { customerInfo, getActiveCartItems, totalAmount } = storeRef.current;

    const { data: qrData } = await axios.post("/api/create-promptpay-qr", {
      amount: totalAmount,
      bookingId: `booking_${Date.now()}`,
      customerInfo: customerInfo,
      items: getActiveCartItems(),
    });

    setQrCodeData(qrData);
    setQrCountdown(qrData.expiresIn);
    setShowQRModal(true);

    // เริ่ม countdown timer
    const timer = setInterval(() => {
      setQrCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setShowQRModal(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // จำลองการชำระเงินหลัง 10 วินาที (สำหรับ demo)
    setTimeout(() => {
      handlePromptPaySuccess(qrData.paymentId);
    }, 10000);
  }, [setQrCodeData, setQrCountdown, setShowQRModal, handlePromptPaySuccess]);

  const handleApplyPromoCode = () => {
    const promoCode = form.getValues("promoCode");
    if (promoCode?.trim()) {
      toast.success(`โค้ด "${promoCode}" ถูกใช้แล้ว (จำลอง)`, {
        duration: 3000,
      });
    } else {
      toast.error("กรุณากรอกโค้ดส่วนลด", {
        duration: 3000,
      });
    }
  };

  // NOTE: Commented out booking sync logic as it interferes with new booking flow
  // If you need to restore previous bookings, implement this in a separate component
  // useEffect(() => {
  //   if (userId) {
  //     // Sync booking store with user data
  //     const syncBookingStore = async () => {
  //       try {
  //         const response = await axios.get(
  //           `/api/bookings/active?userId=${userId}`
  //         )
  //         const activeBooking = await response.data

  //         if (activeBooking) {
  //           useBookingStore.getState().setServiceId(activeBooking.serviceId)
  //           useBookingStore.getState().setSubServices(activeBooking.subServices)
  //           // Update each cart item individually
  //           activeBooking.cart.forEach(
  //             (item: { id: number; quantity: number }) => {
  //               useBookingStore
  //                 .getState()
  //                 .updateCartQuantity(item.id, item.quantity)
  //             }
  //           )
  //           useBookingStore
  //             .getState()
  //             .updateCustomerInfo(activeBooking.customerInfo)
  //         }
  //       } catch (error) {
  //         console.error('Failed to sync booking store:', error)
  //       }
  //     }
  //     syncBookingStore()
  //   }
  // }, [userId])

  // Credit Card Payment with Stripe Elements
  const processCreditCardPayment = useCallback(async () => {
    if (!stripe || !elements) {
      throw new Error("Stripe has not loaded");
    }

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      throw new Error("Card element not found");
    }

    // Use refs for latest values
    const { customerInfo, getActiveCartItems, totalAmount, userId } =
      storeRef.current;

    // Create payment intent
    const { data: paymentData } = await axios.post(
      "/api/create-payment-intent",
      {
        amount: totalAmount,
        bookingId: `booking_${Date.now()}`,
        customerId: userId,
        customerInfo: {
          serviceDate: customerInfo.serviceDate,
          serviceTime: customerInfo.serviceTime,
          address: `${customerInfo.address} ${customerInfo.subDistrict} ${customerInfo.district} ${customerInfo.province}`,
          additionalInfo: customerInfo.additionalInfo,
        },
        items: getActiveCartItems(),
      },
    );

    const { clientSecret, paymentIntentId } = paymentData;

    // Confirm payment with Stripe Elements
    const { error: confirmError } = await stripe.confirmCardPayment(
      clientSecret,
      {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: form.getValues("cardName") ?? "Anonymous",
          },
        },
      },
    );

    if (confirmError) {
      throw new Error(confirmError.message ?? "Payment confirmation failed");
    }

    // Payment successful
    toast.success("ชำระเงินสำเร็จ! กำลังบันทึกข้อมูลการจอง...", {
      duration: 4000,
    });

    // บันทึกข้อมูลการจองลง Supabase
    try {
      const { data: bookingData } = await axios.post(
        "/api/booking/create",
        {
          userId: userId,
          items: getActiveCartItems(),
          customerInfo: customerInfo,
          totalAmount: totalAmount,
          paymentIntentId: paymentIntentId,
          paymentStatus: "paid",
        },
        {
          withCredentials: true,
        },
      );

      console.log("Booking created successfully:", bookingData.bookingId);
    } catch (error) {
      console.error("Error creating booking:", error);
      toast.error("ระบบบันทึกข้อมูลมีปัญหา กรุณาติดต่อเจ้าหน้าที่", {
        duration: 6000,
      });
    }

    // Redirect to success page
    router.push(`/booking-success?payment_intent=${paymentIntentId}`);
  }, [stripe, elements, form, router]);

  // Register payment handler with parent
  useEffect(() => {
    if (!onPaymentReady) return;

    // Create a stable reference to the payment handler
    const handleProcessPayment = async () => {
      if (isProcessing) {
        return;
      }

      setIsProcessing(true);
      try {
        if (!userId) {
          return;
        }

        if (totalAmount <= 0) {
          throw new Error("ไม่มียอดที่ต้องชำระ");
        }

        if (paymentMethod === "creditcard") {
          if (!stripe || !elements) {
            throw new Error("กรุณารอสักครู่ ระบบกำลังโหลด...");
          }
          await processCreditCardPayment();
        } else {
          await processPromptPayPayment();
        }
      } catch (error) {
        toast.error(
          (error as Error).message || "ไม่สามารถดำเนินการชำระเงินได้",
          {
            duration: 5000,
          },
        );
      } finally {
        setIsProcessing(false);
      }
    };

    onPaymentReady(handleProcessPayment);

    // Cleanup function to set handler to null when component unmounts or dependencies change
    return () => {
      onPaymentReady(async () => {});
    };
  }, [
    onPaymentReady,
    paymentMethod,
    stripe,
    elements,
    totalAmount,
    userId,
    isProcessing,
    customerInfo,
    getActiveCartItems,
    processCreditCardPayment,
    processPromptPayPayment,
  ]);

  // Update store when form values change
  useEffect(() => {
    const subscription = form.watch((value) => {
      updatePaymentInfo({
        method: value.method ?? "creditcard",
        cardNumber: "",
        cardName: value.cardName ?? "",
        expiryDate: "",
        cvv: "",
        promoCode: value.promoCode ?? "",
      });
    });
    return () => subscription.unsubscribe();
  }, [form, updatePaymentInfo]);

  return (
    <Form {...form}>
      <div className="bg-white rounded-lg shadow p-4 md:p-6 space-y-6">
        <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-4">
          ชำระเงิน
        </h2>

        {/* Payment Method Selection */}
        <FormField
          control={form.control}
          name="method"
          render={({ field }) => (
            <FormItem>
              <div className="flex flex-col gap-2 md:grid md:grid-cols-2 md:gap-4">
                <button
                  type="button"
                  onClick={() => field.onChange("creditcard")}
                  className={cn(
                    "flex flex-col items-center justify-center p-6 border rounded-lg transition-all duration-150 ease-in-out cursor-pointer",
                    field.value === "creditcard"
                      ? "border-blue-500 ring-2 ring-blue-500 bg-blue-50"
                      : "border-gray-300 hover:border-gray-400",
                  )}
                >
                  <CreditCard
                    className={cn(
                      "w-10 h-10 mb-2",
                      field.value === "creditcard"
                        ? "text-blue-600"
                        : "text-gray-500",
                    )}
                  />
                  <span
                    className={cn(
                      "font-medium",
                      field.value === "creditcard"
                        ? "text-blue-700"
                        : "text-gray-700",
                    )}
                  >
                    บัตรเครดิต
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => field.onChange("promptpay")}
                  className={cn(
                    "flex flex-col items-center justify-center p-6 border rounded-lg transition-all duration-150 ease-in-out cursor-pointer",
                    field.value === "promptpay"
                      ? "border-blue-500 ring-2 ring-blue-500 bg-blue-50"
                      : "border-gray-300 hover:border-gray-400",
                  )}
                >
                  <QrCode
                    className={cn(
                      "w-10 h-10 mb-2",
                      field.value === "promptpay"
                        ? "text-blue-600"
                        : "text-gray-500",
                    )}
                  />
                  <span
                    className={cn(
                      "font-medium",
                      field.value === "promptpay"
                        ? "text-blue-700"
                        : "text-gray-700",
                    )}
                  >
                    พร้อมเพย์
                  </span>
                </button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Credit Card Fields */}
        {paymentMethod === "creditcard" && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                💡 สำหรับทดสอบ: ใช้เลขบัตร 4242 4242 4242 4242
              </p>
            </div>

            <FormField
              control={form.control}
              name="cardName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    ชื่อบนบัตร <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="JOHN DOE"
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value.replace(
                          /[^a-zA-Z\s]/g,
                          "",
                        );
                        field.onChange(value.toUpperCase());
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                ข้อมูลบัตรเครดิต <span className="text-red-500">*</span>
              </label>
              <div className="border border-gray-300 rounded-md p-3 bg-white">
                <CardElement
                  options={{
                    style: {
                      base: {
                        fontSize: "16px",
                        color: "#424770",
                        "::placeholder": {
                          color: "#aab7c4",
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* PromptPay Info */}
        {paymentMethod === "promptpay" && (
          <div className="text-center p-4 border border-dashed border-gray-300 rounded-lg">
            <QrCode className="w-24 h-24 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">
              คลิกชำระเงินเพื่อสร้าง QR Code สำหรับพร้อมเพย์
            </p>
          </div>
        )}

        {/* Promotion Code */}
        <FormField
          control={form.control}
          name="promoCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Promotion Code (ถ้ามี)</FormLabel>
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-2 w-full">
                <FormControl>
                  <Input
                    type="text"
                    placeholder="กรอกรหัสส่วนลด (ถ้ามี)"
                    {...field}
                    className="w-full"
                  />
                </FormControl>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleApplyPromoCode}
                  className="border-blue-500 text-blue-500 hover:bg-blue-50 cursor-pointer w-full md:w-auto"
                >
                  ใช้โค้ด
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Stripe Loading Warning */}
        {paymentMethod === "creditcard" && (!stripe || !elements) && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <svg
                  className="w-5 h-5 text-blue-400 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-800">
                  กำลังโหลดระบบการชำระเงิน...
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  กรุณารอสักครู่เพื่อให้ระบบเตรียมพร้อม
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* PromptPay QR Modal */}
      <AlertDialog open={showQRModal} onOpenChange={setShowQRModal}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-center">
              สแกน QR Code เพื่อชำระเงิน
            </AlertDialogTitle>
          </AlertDialogHeader>

          <div className="flex flex-col items-center space-y-4 p-4">
            {qrCodeData && (
              <>
                {/* QR Code */}
                <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
                  <Image
                    src={qrCodeData.qrCode}
                    alt="PromptPay QR Code"
                    width={192}
                    height={192}
                    className="w-48 h-48"
                    unoptimized={true}
                  />
                </div>

                {/* Payment Details */}
                <div className="text-center space-y-2">
                  <div className="text-2xl font-bold text-blue-600">
                    ฿{qrCodeData.amount.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600">
                    PromptPay ID: {qrCodeData.promptPayId}
                  </div>

                  {/* Countdown Timer */}
                  <div className="flex items-center justify-center space-x-2 text-orange-600">
                    <span className="text-sm">หมดเวลาใน:</span>
                    <span className="font-mono font-bold">
                      {Math.floor(qrCountdown / 60)}:
                      {(qrCountdown % 60).toString().padStart(2, "0")}
                    </span>
                  </div>
                </div>

                {/* Instructions */}
                <div className="bg-blue-50 p-3 rounded-lg text-center">
                  <p className="text-sm text-blue-800">
                    📱 เปิดแอปธนาคารและสแกน QR Code นี้
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    💡 สำหรับ Demo: ระบบจะจำลองการชำระเงินอัตโนมัติใน 10 วินาที
                  </p>
                </div>

                {/* Manual Payment Success Button (for demo) */}
                <Button
                  onClick={() => handlePromptPaySuccess(qrCodeData.paymentId)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white cursor-pointer"
                  size="sm"
                >
                  ✅ จำลองการชำระเงินสำเร็จ (Demo)
                </Button>

                {/* Cancel Button */}
                <Button
                  variant="outline"
                  onClick={() => setShowQRModal(false)}
                  className="w-full cursor-pointer"
                  size="sm"
                >
                  ยกเลิก
                </Button>
              </>
            )}
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </Form>
  );
};

export default PaymentForm;

// Export types for parent component to use
export type { PaymentFormProps };

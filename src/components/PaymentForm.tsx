import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useBookingStore } from '@/stores/bookingStore'
import { simplePaymentSchema, SimplePaymentForm } from '@/schemas/booking'
import toast from 'react-hot-toast'
import { useRouter } from 'next/router'
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js'
import { useAuth } from '@/hooks/useAuth'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { CreditCard } from 'lucide-react'
import axios from 'axios'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

interface PaymentFormProps {
  onPaymentReady?: (paymentHandler: () => Promise<void>) => void
}

const PaymentForm: React.FC<PaymentFormProps> = ({ onPaymentReady }) => {
  const router = useRouter()
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const { userId } = useAuth()

  const {
    paymentInfo,
    updatePaymentInfo,
    getTotalAmount,
    getFinalAmount,
    setPromoCodeDiscount,
    clearPromoCode,
    customerInfo,
    getActiveCartItems,
  } = useBookingStore()

  const form = useForm<SimplePaymentForm>({
    resolver: zodResolver(simplePaymentSchema),
    defaultValues: {
      method: paymentInfo.method,
      cardName: paymentInfo.cardName,
      promoCode: paymentInfo.promoCode,
    },
  })

  const paymentMethod = form.watch('method')
  const totalAmount = getTotalAmount()
  const finalAmount = getFinalAmount()
  const [isValidatingPromo, setIsValidatingPromo] = useState(false)

  // Store refs for latest values (to avoid stale closures)
  const storeRef = useRef({
    customerInfo,
    getActiveCartItems,
    totalAmount,
    userId,
    paymentInfo,
    getFinalAmount,
  })

  useEffect(() => {
    storeRef.current = {
      customerInfo,
      getActiveCartItems,
      totalAmount,
      userId,
      paymentInfo,
      getFinalAmount,
    }
  }, [
    customerInfo,
    getActiveCartItems,
    totalAmount,
    userId,
    paymentInfo,
    getFinalAmount,
  ])

  const handleApplyPromoCode = async () => {
    const promoCode = form.getValues('promoCode')
    if (!promoCode?.trim()) {
      toast.error('กรุณากรอกโค้ดส่วนลด', {
        duration: 3000,
      })
      return
    }

    setIsValidatingPromo(true)
    try {
      const response = await axios.post('/api/promocode/validate', {
        code: promoCode.trim(),
        totalAmount: totalAmount,
      })

      if (response.data.success) {
        setPromoCodeDiscount(response.data.discount)
        toast.success(
          `ใช้โค้ดส่วนลดสำเร็จ! ลด ฿${response.data.discount.amount.toFixed(
            2
          )}`,
          {
            duration: 4000,
          }
        )
      } else {
        clearPromoCode()
        form.setValue('promoCode', '')
        toast.error(response.data.message, {
          duration: 4000,
        })
      }
    } catch (error: unknown) {
      clearPromoCode()
      form.setValue('promoCode', '')
      const errorMessage =
        axios.isAxiosError(error) && error.response?.data?.message
          ? error.response.data.message
          : 'เกิดข้อผิดพลาดในการตรวจสอบโค้ดส่วนลด'
      toast.error(errorMessage, {
        duration: 4000,
      })
    } finally {
      setIsValidatingPromo(false)
    }
  }

  const handleRemovePromoCode = () => {
    clearPromoCode()
    form.setValue('promoCode', '')
    toast.success('ยกเลิกโค้ดส่วนลดแล้ว', {
      duration: 2000,
    })
  }

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
      throw new Error('Stripe has not loaded')
    }

    const cardElement = elements.getElement(CardElement)

    if (!cardElement) {
      throw new Error('Card element not found')
    }

    // Use refs for latest values
    const { customerInfo, getActiveCartItems, totalAmount, userId } =
      storeRef.current

    // Apply promocode if exists
    if (
      storeRef.current.paymentInfo.discount &&
      storeRef.current.paymentInfo.promoCode
    ) {
      try {
        await axios.post('/api/promocode/apply', {
          code: storeRef.current.paymentInfo.promoCode,
        })
      } catch (error) {
        console.error('Error applying promocode:', error)
        // Continue with payment even if promocode application fails
      }
    }

    // Create payment intent
    const { data: paymentData } = await axios.post(
      '/api/create-payment-intent',
      {
        amount: storeRef.current.getFinalAmount(),
        bookingId: `booking_${Date.now()}`,
        customerId: userId,
        customerInfo: {
          serviceDate: customerInfo.serviceDate,
          serviceTime: customerInfo.serviceTime,
          address: `${customerInfo.address} ${customerInfo.subDistrict} ${customerInfo.district} ${customerInfo.province}`,
          additionalInfo: customerInfo.additionalInfo,
        },
        items: getActiveCartItems(),
      }
    )

    const { clientSecret, paymentIntentId } = paymentData

    // Confirm payment with Stripe Elements
    const { error: confirmError } = await stripe.confirmCardPayment(
      clientSecret,
      {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: form.getValues('cardName') ?? 'Anonymous',
          },
        },
      }
    )

    if (confirmError) {
      throw new Error(confirmError.message ?? 'Payment confirmation failed')
    }

    // Payment successful
    toast.success('ชำระเงินสำเร็จ! กำลังบันทึกข้อมูลการจอง...', {
      duration: 4000,
    })

    // บันทึกข้อมูลการจองลง Supabase
    try {
      const { data: bookingData } = await axios.post(
        '/api/booking/create',
        {
          userId: userId,
          items: getActiveCartItems(),
          customerInfo: customerInfo,
          totalAmount: totalAmount,
          finalAmount: storeRef.current.getFinalAmount(),
          promoCode: storeRef.current.paymentInfo.promoCode,
          discount: storeRef.current.paymentInfo.discount,
          paymentIntentId: paymentIntentId,
          paymentStatus: 'paid',
        },
        {
          withCredentials: true,
        }
      )

      console.log('Booking created successfully:', bookingData.bookingId)
    } catch (error) {
      console.error('Error creating booking:', error)
      toast.error('ระบบบันทึกข้อมูลมีปัญหา กรุณาติดต่อเจ้าหน้าที่', {
        duration: 6000,
      })
    }

    // Redirect to success page
    router.push(`/booking-success?payment_intent=${paymentIntentId}`)
  }, [stripe, elements, form, router])

  // Register payment handler with parent
  useEffect(() => {
    if (!onPaymentReady) return

    // Create a stable reference to the payment handler
    const handleProcessPayment = async () => {
      if (isProcessing) {
        return
      }

      setIsProcessing(true)
      try {
        if (!userId) {
          return
        }

        if (finalAmount <= 0) {
          throw new Error('ไม่มียอดที่ต้องชำระ')
        }

        if (paymentMethod === 'creditcard') {
          if (!stripe || !elements) {
            throw new Error('กรุณารอสักครู่ ระบบกำลังโหลด...')
          }
          await processCreditCardPayment()
        }
      } catch (error) {
        toast.error(
          (error as Error).message || 'ไม่สามารถดำเนินการชำระเงินได้',
          {
            duration: 5000,
          }
        )
      } finally {
        setIsProcessing(false)
      }
    }

    onPaymentReady(handleProcessPayment)

    // Cleanup function to set handler to null when component unmounts or dependencies change
    return () => {
      onPaymentReady(async () => {})
    }
  }, [
    onPaymentReady,
    paymentMethod,
    stripe,
    elements,
    finalAmount,
    userId,
    isProcessing,
    processCreditCardPayment,
  ])

  // Update store when form values change
  useEffect(() => {
    const subscription = form.watch(value => {
      updatePaymentInfo({
        method: value.method ?? 'creditcard',
        cardNumber: '',
        cardName: value.cardName ?? '',
        expiryDate: '',
        cvv: '',
        promoCode: value.promoCode ?? '',
      })
    })
    return () => subscription.unsubscribe()
  }, [form, updatePaymentInfo])

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
              <div className="flex flex-col gap-2 md:grid md:grid-cols-1 md:gap-4">
                <button
                  type="button"
                  onClick={() => field.onChange('creditcard')}
                  className={cn(
                    'flex flex-col items-center justify-center p-6 border rounded-lg transition-all duration-150 ease-in-out cursor-pointer',
                    field.value === 'creditcard'
                      ? 'border-blue-500 ring-2 ring-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  )}
                >
                  <CreditCard
                    className={cn(
                      'w-10 h-10 mb-2',
                      field.value === 'creditcard'
                        ? 'text-blue-600'
                        : 'text-gray-500'
                    )}
                  />
                  <span
                    className={cn(
                      'font-medium',
                      field.value === 'creditcard'
                        ? 'text-blue-700'
                        : 'text-gray-700'
                    )}
                  >
                    บัตรเครดิต
                  </span>
                </button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Credit Card Fields */}
        {paymentMethod === 'creditcard' && (
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
                      onChange={e => {
                        const value = e.target.value.replace(/[^a-zA-Z\s]/g, '')
                        field.onChange(value.toUpperCase())
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
                        fontSize: '16px',
                        color: '#424770',
                        '::placeholder': {
                          color: '#aab7c4',
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>
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
                    disabled={isValidatingPromo}
                  />
                </FormControl>
                {!paymentInfo.discount ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleApplyPromoCode}
                    disabled={isValidatingPromo || !field.value?.trim()}
                    className="border-blue-500 text-blue-500 hover:bg-blue-50 cursor-pointer w-full md:w-auto"
                  >
                    {isValidatingPromo ? 'กำลังตรวจสอบ...' : 'ใช้โค้ด'}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleRemovePromoCode}
                    className="border-red-500 text-red-500 hover:bg-red-50 cursor-pointer w-full md:w-auto"
                  >
                    ยกเลิก
                  </Button>
                )}
              </div>

              {/* Show discount info if applied */}
              {paymentInfo.discount && (
                <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-green-800 font-medium">
                      ✅ ใช้โค้ดส่วนลดแล้ว: {paymentInfo.promoCode}
                    </span>
                  </div>
                  <div className="text-sm text-green-700 mt-1">
                    ส่วนลด{' '}
                    {paymentInfo.discount.type === 'percentage'
                      ? `${paymentInfo.discount.value}%`
                      : `฿${paymentInfo.discount.value}`}{' '}
                    = ฿{paymentInfo.discount.amount.toFixed(2)}
                  </div>
                </div>
              )}

              <FormMessage />
            </FormItem>
          )}
        />

        {/* Stripe Loading Warning */}
        {paymentMethod === 'creditcard' && (!stripe || !elements) && (
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
    </Form>
  )
}

export default PaymentForm

// Export types for parent component to use
export type { PaymentFormProps }

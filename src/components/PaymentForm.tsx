import React, { useState } from 'react'
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
import { CreditCard, QrCode } from 'lucide-react'
import Image from 'next/image'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface PaymentFormProps {
  onPaymentReady?: (paymentHandler: () => Promise<void>) => void
}

const PaymentForm: React.FC<PaymentFormProps> = ({ onPaymentReady }) => {
  console.log('🔥 PaymentForm rendered with props:', {
    onPaymentReady: !!onPaymentReady,
  })

  const router = useRouter()
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const { userId } = useAuth()

  // Debug Stripe state
  React.useEffect(() => {
    console.log('🎯 Stripe state changed:', {
      stripe: !!stripe,
      elements: !!elements,
      stripeType: typeof stripe,
      elementsType: typeof elements,
    })
  }, [stripe, elements])

  // PromptPay QR Code states
  const [showQRModal, setShowQRModal] = useState(false)
  const [qrCodeData, setQrCodeData] = useState<{
    qrCode: string
    paymentId: string
    amount: number
    promptPayId: string
    expiresIn: number
  } | null>(null)
  const [qrCountdown, setQrCountdown] = useState(0)

  const {
    paymentInfo,
    updatePaymentInfo,
    getTotalAmount,
    customerInfo,
    getActiveCartItems,
    cart,
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

  // Debug store values
  React.useEffect(() => {
    const activeCartItemsDirect = cart.filter(item => item.quantity > 0)
    const totalAmountDirect = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    )

    console.log('🏪 Store values in PaymentForm:', {
      totalAmount: totalAmount,
      totalAmountDirect: totalAmountDirect,
      paymentMethod,
      cartItemsGetter: getActiveCartItems(),
      cartItemsDirect: activeCartItemsDirect,
      rawCart: cart,
      customerInfo,
      hasUserId: !!userId,
      mismatch: totalAmount !== totalAmountDirect,
    })
  }, [
    totalAmount,
    paymentMethod,
    getActiveCartItems,
    cart,
    customerInfo,
    userId,
  ])

  // Store refs for latest values (to avoid stale closures)
  const storeRef = React.useRef({
    customerInfo,
    getActiveCartItems,
    totalAmount,
    userId,
  })

  React.useEffect(() => {
    storeRef.current = {
      customerInfo,
      getActiveCartItems,
      totalAmount,
      userId,
    }
  }, [customerInfo, getActiveCartItems, totalAmount, userId])

  // Credit Card Payment with Stripe Elements (not using useCallback)
  const processCreditCardPayment = async () => {
    console.log('💳 processCreditCardPayment called:', {
      stripe: !!stripe,
      elements: !!elements,
      stripeType: typeof stripe,
      elementsType: typeof elements,
    })

    if (!stripe || !elements) {
      console.error('❌ Stripe or Elements not available:', {
        stripe: !!stripe,
        elements: !!elements,
      })
      throw new Error('Stripe has not loaded')
    }

    const cardElement = elements.getElement(CardElement)
    console.log('🎯 CardElement found:', !!cardElement)

    if (!cardElement) {
      console.error('❌ Card element not found')
      throw new Error('Card element not found')
    }

    // Use refs for latest values
    const { customerInfo, getActiveCartItems, totalAmount, userId } =
      storeRef.current

    // Create payment intent
    const response = await fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
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
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to create payment')
    }

    const { clientSecret, paymentIntentId } = await response.json()

    // Confirm payment with Stripe Elements
    const { error: confirmError } = await stripe.confirmCardPayment(
      clientSecret,
      {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: form.getValues('cardName') || 'Anonymous',
          },
        },
      }
    )

    if (confirmError) {
      throw new Error(confirmError.message || 'Payment confirmation failed')
    }

    // Payment successful
    toast.success('ชำระเงินสำเร็จ! กำลังบันทึกข้อมูลการจอง...', {
      duration: 4000,
    })

    // บันทึกข้อมูลการจองลง Supabase
    try {
      const bookingResponse = await fetch('/api/booking/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId,
          items: getActiveCartItems(),
          customerInfo: customerInfo,
          totalAmount: totalAmount,
          paymentIntentId: paymentIntentId,
          paymentStatus: 'paid',
        }),
      })

      if (!bookingResponse.ok) {
        const error = await bookingResponse.json()
        console.error('Booking creation failed:', error)
        toast.error('บันทึกข้อมูลการจองไม่สมบูรณ์ กรุณาติดต่อเจ้าหน้าที่', {
          duration: 6000,
        })
      } else {
        const { bookingId } = await bookingResponse.json()
        console.log('Booking created successfully:', bookingId)
      }
    } catch (error) {
      console.error('Error creating booking:', error)
      toast.error('ระบบบันทึกข้อมูลมีปัญหา กรุณาติดต่อเจ้าหน้าที่', {
        duration: 6000,
      })
    }

    // Redirect to success page
    router.push(`/booking-success?payment_intent=${paymentIntentId}`)
  }

  // PromptPay Payment (not using useCallback)
  const processPromptPayPayment = async () => {
    // Use refs for latest values
    const { customerInfo, getActiveCartItems, totalAmount } = storeRef.current

    const response = await fetch('/api/create-promptpay-qr', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: totalAmount,
        bookingId: `booking_${Date.now()}`,
        customerInfo: customerInfo,
        items: getActiveCartItems(),
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to generate QR code')
    }

    const qrData = await response.json()
    setQrCodeData(qrData)
    setQrCountdown(qrData.expiresIn)
    setShowQRModal(true)

    // เริ่ม countdown timer
    const timer = setInterval(() => {
      setQrCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          setShowQRModal(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    // จำลองการชำระเงินหลัง 10 วินาที (สำหรับ demo)
    setTimeout(() => {
      handlePromptPaySuccess(qrData.paymentId)
    }, 10000)
  }

  // Main payment handler
  const handleProcessPayment = async () => {
    console.log('🔵 Payment handler called', {
      isProcessing,
      userId: storeRef.current.userId,
      totalAmount: storeRef.current.totalAmount,
      paymentMethod,
      customerInfo: storeRef.current.customerInfo,
      cartItems: storeRef.current.getActiveCartItems(),
    })

    if (isProcessing) {
      console.log('🟡 Payment already processing, skipping')
      return
    }

    setIsProcessing(true)
    try {
      if (!storeRef.current.userId) {
        console.log('❌ No user ID - payment blocked by UI')
        return
      }

      if (storeRef.current.totalAmount <= 0) {
        console.error(
          '❌ Total amount is zero or negative:',
          storeRef.current.totalAmount
        )
        throw new Error('ไม่มียอดที่ต้องชำระ')
      }

      console.log('🟢 Starting payment process:', paymentMethod)

      if (paymentMethod === 'creditcard') {
        if (!stripe || !elements) {
          throw new Error('กรุณารอสักครู่ ระบบกำลังโหลด...')
        }
        await processCreditCardPayment()
      } else {
        await processPromptPayPayment()
      }

      console.log('✅ Payment process completed')
    } catch (error) {
      console.error('❌ Payment error:', error)
      toast.error((error as Error).message || 'ไม่สามารถดำเนินการชำระเงินได้', {
        duration: 5000,
      })
    } finally {
      setIsProcessing(false)
    }
  }

  // Register payment handler with parent
  React.useEffect(() => {
    console.log('📋 Registering payment handler', {
      onPaymentReady: !!onPaymentReady,
      stripe: !!stripe,
      elements: !!elements,
      userId: !!userId,
      totalAmount,
      paymentMethod,
    })

    if (!onPaymentReady) return

    // Create a stable reference to the payment handler
    const stablePaymentHandler = async () => {
      console.log('🔵 Stable payment handler called')
      await handleProcessPayment()
    }

    console.log(`🔧 ✅ Registering ${paymentMethod} handler with parent`)
    onPaymentReady(stablePaymentHandler)

    // Cleanup function to set handler to null when component unmounts or dependencies change
    return () => {
      console.log('🧹 Cleaning up payment handler')
      onPaymentReady(async () => {})
    }
  }, [onPaymentReady, paymentMethod, stripe, elements]) // Simplified dependencies

  // Update store when form values change
  React.useEffect(() => {
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

  // จำลองการชำระเงินสำเร็จผ่าน PromptPay
  const handlePromptPaySuccess = async (paymentId: string) => {
    setShowQRModal(false)
    setIsProcessing(true)

    try {
      toast.success('ชำระเงินผ่านพร้อมเพย์สำเร็จ! กำลังบันทึกข้อมูลการจอง...', {
        duration: 4000,
      })

      // Use refs for latest values
      const { customerInfo, getActiveCartItems, totalAmount, userId } =
        storeRef.current

      // บันทึกข้อมูลการจองลง Supabase
      const bookingResponse = await fetch('/api/booking/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId,
          items: getActiveCartItems(),
          customerInfo: customerInfo,
          totalAmount: totalAmount,
          paymentIntentId: paymentId,
          paymentStatus: 'paid',
        }),
      })

      if (!bookingResponse.ok) {
        const error = await bookingResponse.json()
        console.error('Booking creation failed:', error)
        toast.error('บันทึกข้อมูลการจองไม่สมบูรณ์ กรุณาติดต่อเจ้าหน้าที่', {
          duration: 6000,
        })
      } else {
        const { bookingId } = await bookingResponse.json()
        console.log('Booking created successfully:', bookingId)
      }

      // Redirect to success page
      router.push(`/booking-success?payment_intent=${paymentId}`)
    } catch (error) {
      console.error('Error processing PromptPay payment:', error)
      toast.error('เกิดข้อผิดพลาดในการดำเนินการ', {
        duration: 5000,
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleApplyPromoCode = () => {
    const promoCode = form.getValues('promoCode')
    if (promoCode?.trim()) {
      toast.success(`โค้ด "${promoCode}" ถูกใช้แล้ว (จำลอง)`, {
        duration: 3000,
      })
    } else {
      toast.error('กรุณากรอกโค้ดส่วนลด', {
        duration: 3000,
      })
    }
  }

  return (
    <Form {...form}>
      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">ชำระเงิน</h2>

        {/* Payment Method Selection */}
        <FormField
          control={form.control}
          name="method"
          render={({ field }) => (
            <FormItem>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                <button
                  type="button"
                  onClick={() => field.onChange('promptpay')}
                  className={cn(
                    'flex flex-col items-center justify-center p-6 border rounded-lg transition-all duration-150 ease-in-out cursor-pointer',
                    field.value === 'promptpay'
                      ? 'border-blue-500 ring-2 ring-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  )}
                >
                  <QrCode
                    className={cn(
                      'w-10 h-10 mb-2',
                      field.value === 'promptpay'
                        ? 'text-blue-600'
                        : 'text-gray-500'
                    )}
                  />
                  <span
                    className={cn(
                      'font-medium',
                      field.value === 'promptpay'
                        ? 'text-blue-700'
                        : 'text-gray-700'
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

        {/* PromptPay Info */}
        {paymentMethod === 'promptpay' && (
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
              <div className="flex items-center space-x-2">
                <FormControl>
                  <Input
                    type="text"
                    placeholder="กรอกรหัสส่วนลด (ถ้ามี)"
                    {...field}
                  />
                </FormControl>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleApplyPromoCode}
                  className="border-blue-500 text-blue-500 hover:bg-blue-50 cursor-pointer"
                >
                  ใช้โค้ด
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="border-t pt-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">ยอดรวมที่ต้องชำระ</span>
            <span className="text-2xl font-bold text-blue-600">
              ฿{totalAmount.toFixed(2)}
            </span>
          </div>
        </div>

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

        {/* Login Required Warning */}
        {!userId && (
          <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <svg
                  className="w-5 h-5 text-orange-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-orange-800">
                  กรุณาเข้าสู่ระบบก่อนทำการชำระเงิน
                </p>
                <p className="text-xs text-orange-600 mt-1">
                  ปุ่มชำระเงินจะใช้งานได้เมื่อคุณเข้าสู่ระบบแล้ว
                </p>
              </div>
              <button
                onClick={() => router.push('/login')}
                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                เข้าสู่ระบบ
              </button>
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
                      {(qrCountdown % 60).toString().padStart(2, '0')}
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
  )
}

export default PaymentForm

// Export types for parent component to use
export type { PaymentFormProps }

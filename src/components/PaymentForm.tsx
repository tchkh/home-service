// components/PaymentForm.tsx - Refactored with Zustand
import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useBookingStore } from '@/stores/bookingStore'
import { simplePaymentSchema, SimplePaymentForm } from '@/schemas/booking'
import { useToast } from '@/hooks/use-toast'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { CreditCard, QrCode } from 'lucide-react'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

const PaymentForm: React.FC = () => {
  const { toast } = useToast()
  const { paymentInfo, updatePaymentInfo } = useBookingStore()

  const form = useForm<SimplePaymentForm>({
    resolver: zodResolver(simplePaymentSchema),
    defaultValues: {
      method: paymentInfo.method,
      cardNumber: paymentInfo.cardNumber,
      cardName: paymentInfo.cardName,
      expiryDate: paymentInfo.expiryDate,
      cvv: paymentInfo.cvv,
      promoCode: paymentInfo.promoCode,
    },
  })

  // Watch payment method
  const paymentMethod = form.watch('method')

  // Helper function to safely map form values to store

  // Update store when form values change
  React.useEffect(() => {
    const subscription = form.watch(value => {
      updatePaymentInfo({
        method: value.method || 'creditcard',
        cardNumber: value.cardNumber || '',
        cardName: value.cardName || '',
        expiryDate: value.expiryDate || '',
        cvv: value.cvv || '',
        promoCode: value.promoCode || '',
      })
    })
    return () => subscription.unsubscribe()
  }, [form, updatePaymentInfo])

  const handleApplyPromoCode = () => {
    const promoCode = form.getValues('promoCode')
    if (promoCode?.trim()) {
      toast({
        title: 'ใช้โค้ดส่วนลด',
        description: `โค้ด "${promoCode}" ถูกใช้แล้ว (จำลอง)`,
      })
      // TODO: Implement actual promo code logic
    } else {
      toast({
        title: 'ข้อผิดพลาด',
        description: 'กรุณากรอกโค้ดส่วนลด',
        variant: 'destructive',
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
                  onClick={() => field.onChange('promptpay')}
                  className={cn(
                    'flex flex-col items-center justify-center p-6 border rounded-lg transition-all duration-150 ease-in-out',
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

                <button
                  type="button"
                  onClick={() => field.onChange('creditcard')}
                  className={cn(
                    'flex flex-col items-center justify-center p-6 border rounded-lg transition-all duration-150 ease-in-out',
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
            <FormField
              control={form.control}
              name="cardNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    หมายเลขบัตรเครดิต <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="กรุณากรอกหมายเลขบัตรเครดิต"
                      {...field}
                      onChange={e => {
                        // Format card number with spaces
                        const value = e.target.value.replace(/\s/g, '')
                        const formatted =
                          value.match(/.{1,4}/g)?.join(' ') || value
                        field.onChange(formatted)
                      }}
                      maxLength={19} // 16 digits + 3 spaces
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                      placeholder="กรุณากรอกชื่อบนบัตร"
                      {...field}
                      onChange={e => {
                        // Only allow letters and spaces
                        const value = e.target.value.replace(/[^a-zA-Z\s]/g, '')
                        field.onChange(value.toUpperCase())
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="expiryDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      วันหมดอายุ <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="MM/YY"
                        {...field}
                        onChange={e => {
                          // Auto-format MM/YY
                          let value = e.target.value.replace(/\D/g, '')
                          if (value.length >= 2) {
                            value = value.slice(0, 2) + '/' + value.slice(2, 4)
                          }
                          field.onChange(value)
                        }}
                        maxLength={5}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cvv"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      รหัส CVC / CVV <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="XXX"
                        {...field}
                        onChange={e => {
                          // Only allow digits
                          const value = e.target.value.replace(/\D/g, '')
                          field.onChange(value)
                        }}
                        maxLength={4}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        )}

        {/* PromptPay Info */}
        {paymentMethod === 'promptpay' && (
          <div className="text-center p-4 border border-dashed border-gray-300 rounded-lg">
            <QrCode className="w-24 h-24 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">
              สแกน QR Code เพื่อชำระเงินผ่านพร้อมเพย์
            </p>
            <p className="text-sm text-gray-500 mt-1">
              (รายละเอียดการชำระเงินจะแสดงที่นี่)
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
                  className="border-blue-500 text-blue-500 hover:bg-blue-50"
                >
                  ใช้โค้ด
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </Form>
  )
}

export default PaymentForm

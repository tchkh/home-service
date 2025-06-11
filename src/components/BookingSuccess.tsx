import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { CheckCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useBookingStore } from '@/stores/bookingStore'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'

const BookingSuccessPage = () => {
  const router = useRouter()
  const { payment_intent } = router.query
  const [isLoading, setIsLoading] = useState(true)
  const [bookingId, setBookingId] = useState<string>('')

  const {
    customerInfo,
    getActiveCartItems,
    getTotalAmount,
    getFinalAmount,
    paymentInfo,
    resetBooking,
    // serviceName removed as it's not used
  } = useBookingStore()

  const cartItems = getActiveCartItems()
  const totalAmount = getTotalAmount()
  const finalAmount = getFinalAmount()

  useEffect(() => {
    if (payment_intent) {
      // Verify payment status
      verifyPayment(payment_intent as string)
    } else {
      setIsLoading(false)
    }
  }, [payment_intent])

  const verifyPayment = async (paymentIntentId: string) => {
    console.log('Payment Intent ID:', paymentIntentId) // Use the parameter
    try {
      // TODO: เรียก API เพื่อตรวจสอบสถานะการชำระเงินและดึงข้อมูลการจอง
      // const response = await fetch(`/api/verify-payment?payment_intent=${paymentIntentId}`)
      // const data = await response.json()
      // setBookingId(data.bookingId)

      // สำหรับ demo - generate booking ID
      const timestamp = Date.now()
      const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase()
      setBookingId(`${timestamp}/${randomStr}`)

      // TODO: อัพเดทสถานะการจองใน database เป็น 'confirmed'
      // await updateBookingStatus(bookingId, 'confirmed')
    } catch (error) {
      console.error('Error verifying payment:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackToHome = () => {
    resetBooking()
    router.push('/')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">กำลังตรวจสอบการชำระเงิน...</p>
        </div>
      </div>
    )
  }

  // Format service date
  const serviceDateTime = customerInfo.serviceDate
    ? format(new Date(customerInfo.serviceDate), 'd MMM yyyy', { locale: th })
    : ''

  // Calculate total items (for future use)
  // const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-2 md:px-4">
      <div className="bg-white rounded-xl md:rounded-2xl shadow-xl w-full max-w-xs md:max-w-md p-4 md:p-8">
        {/* Success Icon */}
        <div className="flex justify-center mb-4 md:mb-6">
          <div className="bg-teal-600 rounded-full p-2 md:p-3">
            <CheckCircle
              className="w-7 h-7 md:w-8 md:h-8 text-white"
              strokeWidth={3}
            />
          </div>
        </div>

        {/* Success Title */}
        <h1 className="text-xl md:text-2xl font-bold text-center text-gray-800 mb-6 md:mb-8">
          ชำระเงินเรียบร้อย !
        </h1>

        {/* Booking Details */}
        <div className="space-y-4 md:space-y-6 mb-6 md:mb-8">
          {/* Service Items */}
          <div>
            <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-2 md:mb-3">
              รายการบริการ
            </h3>
            <div className="space-y-2">
              {cartItems.length > 0 ? (
                cartItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center py-2 border-b border-gray-100"
                  >
                    <div>
                      <p className="font-medium text-gray-800">{item.title}</p>
                      <p className="text-xs md:text-sm text-gray-500">
                        ฿{item.price.toLocaleString()} x {item.quantity}{' '}
                        {item.unit}
                      </p>
                    </div>
                    <p className="font-semibold text-gray-800">
                      ฿{(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500">
                    ไม่พบข้อมูลรายการบริการในหน่วยความจำ
                  </p>
                  <p className="text-xs md:text-sm text-gray-400 mt-1">
                    กรุณาตรวจสอบอีเมลเพื่อดูรายละเอียดการจอง
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Date */}
          <div className="flex justify-between items-center">
            <span className="text-gray-500">วันที่</span>
            <span className="text-gray-800 font-medium">{serviceDateTime}</span>
          </div>

          {/* Time */}
          <div className="flex justify-between items-center">
            <span className="text-gray-500">เวลา</span>
            <span className="text-gray-800 font-medium">
              {customerInfo.serviceTime || '11:00'} น.
            </span>
          </div>

          {/* Location */}
          <div className="flex justify-between items-start">
            <span className="text-gray-500">สถานที่</span>
            <span className="text-gray-800 font-medium text-right max-w-[120px] md:max-w-[200px]">
              {customerInfo.address || '444/4 คอนโดพูลพาเล เลียบทางด่วน'}
              <br />
              {customerInfo.subDistrict &&
                customerInfo.district &&
                customerInfo.province && (
                  <span className="text-xs md:text-sm">
                    {customerInfo.subDistrict} {customerInfo.district}{' '}
                    {customerInfo.province}
                  </span>
                )}
            </span>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200"></div>

          {/* Pricing Summary */}
          <div className="space-y-2">
            {/* Original Amount (if discount applied) */}
            {paymentInfo.discount && totalAmount > 0 && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">ราคาก่อนส่วนลด</span>
                <span className="text-gray-500 line-through">
                  {totalAmount.toLocaleString('th-TH', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })} ฿
                </span>
              </div>
            )}

            {/* Discount Applied */}
            {paymentInfo.discount && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-green-600">
                  ส่วนลด ({paymentInfo.promoCode})
                </span>
                <span className="text-green-600 font-medium">
                  -{paymentInfo.discount.amount.toLocaleString('th-TH', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })} ฿
                </span>
              </div>
            )}

            {/* Final Amount */}
            <div className="flex justify-between items-center border-t border-gray-200 pt-2">
              <span className="text-gray-800 font-semibold">ราคารวม</span>
              <span className="text-xl md:text-2xl font-bold text-gray-800">
                {finalAmount > 0 ? (
                  <>
                    {finalAmount.toLocaleString('th-TH', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })} ฿
                  </>
                ) : (
                  <span className="text-gray-400">ไม่พบข้อมูลราคา</span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Back to Home Button */}
        <Button
          onClick={handleBackToHome}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium text-base md:text-lg transition-colors duration-200 cursor-pointer"
        >
          เสร็จเรียบร้อย
        </Button>

        {/* Booking Reference (Optional - smaller text) */}
        {bookingId && (
          <p className="text-center text-xs text-gray-400 mt-4">
            หมายเลขการจอง: {bookingId}
          </p>
        )}
      </div>
    </div>
  )
}

export default BookingSuccessPage

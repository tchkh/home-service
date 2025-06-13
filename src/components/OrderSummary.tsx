// OrderSummary.tsx - Fixed Version with Debug
import React, { useState } from 'react'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useBookingStore } from '@/stores/bookingStore'

const OrderSummary: React.FC = () => {
  // ดึง cart และคำนวณ activeCartItems กับ totalAmount เอง
  const { cart, customerInfo, currentStep, paymentInfo, getFinalAmount } = useBookingStore()

  // คำนวณ activeCartItems และ finalAmount ใน component
  const activeCartItems = cart.filter(item => item.quantity > 0)
  const finalAmount = getFinalAmount()

  const showDetails = currentStep !== 'items'

  const formatAddress = () => {
    const { address, subDistrict, district, province } = customerInfo
    if (address && subDistrict && district && province) {
      return `${address}, ${subDistrict}, ${district}, ${province}`
    }
    return null
  }

  // Mobile accordion state
  const [open, setOpen] = useState(false)

  // Accordion toggle handler
  const handleToggle = () => {
    setOpen(o => !o)
  }

  return (
    <div className="w-full">
      {/* Mobile: Accordion summary card */}
      <div className="block lg:hidden">
        <div
          className="bg-white rounded-lg shadow-sm border border-gray-300 px-4 py-3 cursor-pointer select-none"
          onClick={handleToggle}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              handleToggle()
            }
          }}
          role="button"
          tabIndex={0}
          aria-expanded={open}
          aria-controls="order-summary-details"
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-700">สรุปรายการ</span>
              {open ? (
                <ChevronUp className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-500" />
              )}
            </div>
            <span className="text-lg font-bold text-gray-900">
              {finalAmount.toLocaleString()} ฿
            </span>
          </div>
        </div>
        {/* Accordion details */}
        {open && (
          <div
            id="order-summary-details"
            className="bg-white rounded-b-lg shadow-sm  border border-gray-300 border-t-0 px-4 pt-2 pb-4 space-y-2 text-sm text-gray-700"
          >
            {activeCartItems.length > 0 ? (
              <div className="border-b border-gray-300 pb-2 mb-2 space-y-1">
                {activeCartItems.map(item => (
                  <div key={item.id} className="flex justify-between">
                    <span>
                      {item.title} {item.quantity} รายการ
                    </span>
                    <span>฿{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-400 text-center py-2">
                ยังไม่มีรายการที่เลือก
              </div>
            )}
            {showDetails && customerInfo.serviceDate && (
              <>
                <div className="flex justify-between">
                  <span>วันที่:</span>
                  <span>
                    {format(customerInfo.serviceDate, 'd MMM yyyy', {
                      locale: th,
                    })}
                  </span>
                </div>
                {customerInfo.serviceTime && (
                  <div className="flex justify-between">
                    <span>เวลา:</span>
                    <span>{customerInfo.serviceTime}</span>
                  </div>
                )}
                {formatAddress() && (
                  <div className="flex justify-between">
                    <span>สถานที่:</span>
                    <span className="text-right ml-4">{formatAddress()}</span>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
      {/* Desktop: Show all details */}
      <div className="hidden lg:block">
        <div className="bg-white rounded-lg shadow-sm border border-gray-300 p-6 space-y-4">
          <div className="flex justify-between items-center pb-3">
            <h2 className="text-lg font-semibold text-gray-800">สรุปรายการ</h2>
          </div>

          {showDetails && customerInfo.serviceDate && (
            <div className="border-t border-gray-300 pt-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">วันที่</span>
                <span className="text-gray-800 font-medium">
                  {format(customerInfo.serviceDate, 'dd MMM yyyy', {
                    locale: th,
                  })}
                </span>
              </div>
              {customerInfo.serviceTime && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">เวลา</span>
                  <span className="text-gray-800 font-medium">
                    {customerInfo.serviceTime}
                  </span>
                </div>
              )}
              {formatAddress() && (
                <div className="text-sm">
                  <div className="text-gray-600 mb-1">สถานที่</div>
                  <div className="text-gray-800 font-medium text-right">
                    {formatAddress()}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Service Items */}
          {activeCartItems.length > 0 ? (
            <div className="space-y-2">
              {activeCartItems.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {item.title} {item.quantity} รายการ
                  </span>
                  <span className="text-gray-800 font-medium">
                    {(item.price * item.quantity).toLocaleString()} ฿
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-500 text-center py-4 ">
              ยังไม่มีรายการที่เลือก
            </div>
          )}

          {/* Discount */}
          {paymentInfo.discount && (
            <div className="border-t border-gray-300 pt-4 space-y-2">
              <div className="flex justify-between text-sm text-green-600">
                <span>โค้ดส่วนลด: {paymentInfo.promoCode}</span>
                <span>-{paymentInfo.discount.amount.toLocaleString()} ฿</span>
              </div>
              <div className="text-xs text-gray-500">
                ส่วนลด {paymentInfo.discount.type === 'percentage' 
                  ? `${paymentInfo.discount.value}%` 
                  : `฿${paymentInfo.discount.value}`
                }
              </div>
            </div>
          )}

          {/* Total */}
          <div className="border-t border-gray-300 pt-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-800 font-semibold">รวม</span>
              <span className="text-xl font-bold text-gray-900">
                {finalAmount.toLocaleString()} ฿
              </span>
            </div>
          </div>
        </div>
      </div>
      {/* TODO: สามารถเพิ่มรายละเอียด/โปรโมชั่น/ส่วนลดในอนาคตได้ที่นี่ */}
    </div>
  )
}

export default OrderSummary

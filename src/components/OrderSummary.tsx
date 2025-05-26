// OrderSummary.tsx - Fixed Version with Debug
import React from 'react'
import { format } from 'date-fns'
import { useBookingStore } from '@/stores/bookingStore'

const OrderSummary: React.FC = () => {
  // ดึง cart และคำนวณ activeCartItems กับ totalAmount เอง
  const { cart, customerInfo, currentStep } = useBookingStore()

  // คำนวณ activeCartItems และ totalAmount ใน component
  const activeCartItems = cart.filter(item => item.quantity > 0)
  const totalAmount = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )

  const showDetails = currentStep !== 'items'

  const formatAddress = () => {
    const { address, subDistrict, district, province } = customerInfo
    if (address && subDistrict && district && province) {
      return `${address}, ${subDistrict}, ${district}, ${province}`
    }
    return null
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">สรุปรายการ</h2>
      </div>

      {activeCartItems.length > 0 ? (
        <div className="border-b pb-4 mb-4 space-y-2">
          {activeCartItems.map(item => (
            <div
              key={item.id}
              className="flex justify-between text-sm text-gray-600"
            >
              <span>
                {item.title} x{item.quantity}
              </span>
              <span>฿{(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-sm text-gray-500 text-center py-4">
          ยังไม่มีรายการที่เลือก
        </div>
      )}

      {showDetails && customerInfo.serviceDate && (
        <div className="border-b pb-4 mb-4 space-y-2 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>วันที่:</span>
            <span>{format(customerInfo.serviceDate, 'd MMM yyyy')}</span>
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
        </div>
      )}

      <div className="flex justify-between items-center">
        <span className="text-gray-600 font-medium">รวม</span>
        <span className="text-xl font-bold text-gray-800">
          ฿ {totalAmount.toFixed(2)}
        </span>
      </div>
    </div>
  )
}

export default OrderSummary

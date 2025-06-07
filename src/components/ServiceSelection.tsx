// ServiceSelection.tsx - Fixed Version
import React from 'react'
import { useBookingStore } from '@/stores/bookingStore'
import ServiceItem from './ServiceItem'

interface ServiceSelectionProps {
  onNext: () => void
  onBack: () => void
}

const ServiceSelection: React.FC<ServiceSelectionProps> = () => {
  const { subServices, cart, updateCartQuantity } = useBookingStore()
  const serviceName = subServices[0]?.service_title

  const getCartItem = (serviceId: number) => {
    return cart.find(item => item.id === serviceId)
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          เลือกรายการบริการ{serviceName}
        </h2>
        <div className="space-y-2">
          {subServices.map(service => {
            const cartItem = getCartItem(service.id) || {
              ...service,
              quantity: 0,
            }
            return (
              <ServiceItem
                key={service.id}
                item={cartItem}
                onQuantityChange={updateCartQuantity}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default ServiceSelection

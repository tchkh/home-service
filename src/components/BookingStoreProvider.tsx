import React, { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useBookingStore } from '@/stores/bookingStore'
import { LoadingSpinner } from '@/components/LoadingSpinner'

export const BookingStoreProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isLoading, setIsLoading] = useState(true)
  const { userId } = useAuth()

  useEffect(() => {
    const initializeStore = async () => {
      try {
        if (userId) {
          const response = await fetch(`/api/bookings/active?userId=${userId}`)
          const activeBooking = await response.json()

          if (activeBooking) {
            useBookingStore.getState().setServiceId(activeBooking.serviceId)
            useBookingStore.getState().setSubServices(activeBooking.subServices)
            activeBooking.cart.forEach(
              (item: { id: number; quantity: number }) => {
                useBookingStore
                  .getState()
                  .updateCartQuantity(item.id, item.quantity)
              }
            )
            useBookingStore
              .getState()
              .updateCustomerInfo(activeBooking.customerInfo)
          }
        }
      } catch (error) {
        console.error('Failed to initialize booking store:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeStore()
  }, [userId])

  if (isLoading) {
    return <LoadingSpinner />
  }

  return <>{children}</>
}

import { useEffect } from 'react'
import { useBookingStore } from '@/stores/bookingStore'

export const useResetBookingOnNavigation = () => {
  const resetBooking = useBookingStore(state => state.resetBooking)
  
  useEffect(() => {
    // Reset booking data when component mounts (user navigates to this page)
    resetBooking()
  }, [resetBooking])
}
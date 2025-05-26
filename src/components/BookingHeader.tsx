import { useBookingStore } from '@/stores/bookingStore'
import React from 'react'

const BookingHeader: React.FC = () => {
  const { subServices } = useBookingStore()
  const serviceName = subServices[0]?.service_title

  return (
    <div className="relative py-8 px-4 md:px-8 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-t-lg">
      {/* Optional: Add a subtle pattern or texture if desired */}
      {/* <div className="absolute inset-0 bg-black opacity-20"></div> */}
      <div className="relative">
        <div className="text-sm">
          <span className="opacity-80">บริการของเรา</span>
          <span className="mx-2 opacity-80">&gt;</span>
          <span className="font-semibold">{serviceName}</span>
        </div>
      </div>
    </div>
  )
}

export default BookingHeader

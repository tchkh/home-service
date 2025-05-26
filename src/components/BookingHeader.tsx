import { useBookingStore } from "@/stores/bookingStore";
import Link from "next/link";
import React from "react";

const BookingHeader: React.FC = () => {
  const { subServices } = useBookingStore();
  const serviceName = subServices[0]?.service_title;

  return (
    <div
      className="w-full px-4 py-8 bg-gradient-to-r from-blue-500 to-blue-700 text-white relative overflow-hidden"
      style={{
        backgroundImage: "url(/asset/images/backgroundService.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundBlendMode: "overlay",
      }}
    >
      {/* Blue overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/80 to-blue-700/80"></div>

      <div className="relative max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-700 mb-2 inline-flex items-center border border-gray-300 bg-white rounded-lg px-4 py-2">
          <Link href="/serviceList">
            <span>บริการของเรา</span>
          </Link>
          <span className="mx-2">&gt;</span>
          {/* Service Name */}
          <div className="text-blue-600 text-2xl md:text-3xl font-bold">
            {serviceName}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingHeader;

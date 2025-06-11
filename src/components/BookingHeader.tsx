import { useBookingStore } from "@/stores/bookingStore";
import Link from "next/link";
import React from "react";

const BookingHeader: React.FC = () => {
  const { subServices } = useBookingStore();
  const serviceName = subServices[0]?.service_title;

  return (
    <div
      className="w-full px-4 pt-8 pb-16 md:pb-20 bg-gradient-to-r from-blue-500 to-blue-700 text-white relative overflow-hidden"
      style={{
        backgroundImage: "url(/asset/images/backgroundService.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundBlendMode: "overlay",
        minHeight: "280px", // Make header bigger
      }}
    >
      {/* Blue overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/70 to-blue-700/70"></div>

      <div className="relative max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-700 mb-4 inline-flex items-center border border-gray-300 bg-white rounded-lg px-4 py-2 shadow-sm">
          <Link href="/serviceList">
            <span className="hover:text-blue-600 transition-colors">บริการของเรา</span>
          </Link>
          <span className="mx-2 text-gray-400">&gt;</span>
          <span className="text-blue-600 font-medium">{serviceName || "เลือกบริการ"}</span>
        </div>
        
        {/* Service Title */}
        <div className="mt-8">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 drop-shadow-lg">
            {serviceName}
          </h1>
          <p className="text-blue-100 text-lg md:text-xl max-w-2xl">
            เลือกรายการบริการที่คุณต้องการและกรอกข้อมูลเพื่อจองบริการ
          </p>
        </div>
      </div>
    </div>
  );
};

export default BookingHeader;

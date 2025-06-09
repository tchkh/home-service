import { ServiceRequestCard } from "@/components/ServiceRequestCard";
import axios from "axios";
import React, { useState, useEffect, useCallback } from "react";
import { ServiceRequest, Technician } from "@/types";
import MobileHeader from "@/components/shared/MobileHeader";
import NotificationIcon from "@/components/icons/NotificationIcon";
import { calculateStraightDistance } from "@/utils/distance";
import { useServiceRequestStore } from "@/utils/useServiceRequestStore";
import ToggleSidebarComponent from "@/components/ToggleSidebarComponent";
import toast, { Toaster } from "react-hot-toast";

export default function TechnicianRequestPage() {
  const [serviceRequestData, setServiceRequestData] = useState<
    ServiceRequest[]
  >([]);
  const [technician, setTechnician] = useState<Technician>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [technicianInactive, setTechnicianInactive] = useState(false);
  const { setServiceRequestCount } = useServiceRequestStore();

  const fetchNearbyRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post("/api/technician/customersNearby");
      const nearbyData = response.data.nearby || [];

      // ตรวจสอบว่าช่างไม่ active หรือไม่
      if (response.data.technician_inactive) {
        setTechnicianInactive(true);
        setTechnician(response.data.technician);
        setServiceRequestData([]);
        setServiceRequestCount(0);
      } else {
        setTechnicianInactive(false);
        setTechnician(response.data.technician);
        setServiceRequestData(nearbyData);
        setServiceRequestCount(nearbyData.length);
      }
    } catch (error) {
      console.error("Failed to fetch service requests:", error);
      setError("ไม่สามารถโหลดคำขอบริการได้");
    } finally {
      setLoading(false);
    }
  }, [setServiceRequestCount]); // [] หมายถึงฟังก์ชันนี้จะถูกสร้างครั้งเดียวเท่านั้น

  useEffect(() => {
    fetchNearbyRequests();
  }, [fetchNearbyRequests]); // เพิ่ม fetchNearbyRequests ใน dependency array

  // เพิ่มฟังก์ชันสำหรับอัปเดตรายการหลังจากรับ/ปฏิเสธงาน
  // โดยการเรียก fetchNearbyRequests ใหม่
  const handleJobActionComplete = () => {
    fetchNearbyRequests();
  };

  const handleUpdateStatus = async () => {
    try {
      const response = await axios.put("/api/technician/updateStatusTechnician");

      if (response.status === 200) {
        toast.success("เปิดสถานะพร้อมให้บริการแล้ว!");
        fetchNearbyRequests();
      } else {
        toast.error("ไม่สามารถเปลี่ยนสถานะได้");
        console.error("Update status failed:", response.data);
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการเปลี่ยนสถานะ");
      console.error("Error updating technician status:", error);
    }
  };

  return (
    <>
      {/* Mobile Header */}
      <MobileHeader />
      {/* Header */}
      <header className="relative mt-18 md:mt-0 flex flex-row justify-between items-center px-8 h-20 md:h-24 md:py-5 py-4 bg-[var(--white)] shadow-lg overflow-hidden">
        {/* Hide & Show sidebar */}
        <ToggleSidebarComponent />
        <h1 className="text-heading-2 text-2xl font-semibold content-center">
          คำขอบริการซ่อม
        </h1>
      </header>

      {/* If Technician Status: inactive */}
      {technicianInactive ? (
        <section className="w-[90%] max-w-[95%] mx-auto px-5 py-5 bg-[var(--white)] border-1 border-[var(--gray-300)] rounded-[8px] shadow-lg overflow-hidden text-center mt-10 ">
          <div className="flex justify-center items-center mb-4 mt-5">
            <NotificationIcon className="text-[var(--blue-500)] w-14 h-14" />
          </div>

          <h2 className="text-heading-2">
            ต้องการรับแจ้งเตือนคำขอบริการสั่งซ่อม?
          </h2>
          <p className="text-body-2 text-[var(--gray-700)] mt-1 mb-6">
            เปิดใช้งานสถานะพร้อมให้บริการเพื่อแสดงรายการและรับงานซ่อมในบริเวณตำแหน่งที่คุณอยู่
          </p>
          <button
            onClick={handleUpdateStatus}
            className="btn btn--primary py-[10px] px-[24px] mb-6"
          >
            เปลี่ยนสถานะเป็นพร้อมให้บริการ
          </button>
        </section>
      ) : (
        <>
          {/* If Technician Status: active */}
          <section className="flex flex-row justify-between w-[90%] md:w-[100%] max-w-[95%] mx-auto px-5 py-5 gap-2 bg-[var(--blue-100)] border-1 border-[var(--blue-300)] rounded-[8px] shadow-lg overflow-hidden items-center mt-[16px]">
            <div className="flex gap-2 md:gap-3 items-center">
              <svg
                className="content-center w-10 h-10 text-[var(--blue-600)]"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
                />
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17.8 13.938h-.011a7 7 0 1 0-11.464.144h-.016l.14.171c.1.127.2.251.3.371L12 21l5.13-6.248c.194-.209.374-.429.54-.659l.13-.155Z"
                />
              </svg>

              <div>
                <p className="text-body-3 text-[var(--blue-800)]">
                  ตำแหน่งที่อยู่ปัจจุบัน
                </p>
                <p className="text-[16px] text-[var(--blue-600)]">
                  {technician?.address || "ไม่พบตำแหน่งช่าง"}
                </p>
              </div>
            </div>
            <button
              onClick={fetchNearbyRequests}
              className="btn btn--secondary w-[71px] h-[44px] md:w-[92px] md:h-[54px] px-[24px] py-[10px]"
            >
              รีเฟรช
            </button>
          </section>

          {/* Content */}
          <main className="pt-[16px]">
            {loading && (
              <p className="text-center text-[var(--gray-600)]">
                กำลังโหลดข้อมูล...
              </p>
            )}
            {error && <p className="text-center text-red-500">{error}</p>}

            {!loading && !error && serviceRequestData.length === 0 && (
              <p className="text-center text-[var(--gray-500)]">
                ไม่มีคำขอบริการใกล้คุณในขณะนี้
              </p>
            )}

            <div className="space-y-4 mb-20">
              {technician &&
                serviceRequestData.map((request) => {
                  const straightDistance = calculateStraightDistance(
                    technician.latitude,
                    technician.longitude,
                    request.latitude,
                    request.longitude
                  );

                  return (
                    <ServiceRequestCard
                      key={request.id}
                      data={request}
                      technicianLocation={{
                        latitude: technician.latitude,
                        longitude: technician.longitude,
                      }}
                      straightDistance={straightDistance}
                      onJobActionComplete={handleJobActionComplete} // ส่ง callback prop
                    />
                  );
                })}
            </div>
            <Toaster
              position="top-center"
              toastOptions={{
                duration: 3000,
                style: {
                  background: "#363636",
                  color: "#fff",
                },
                success: {
                  duration: 2000,
                  iconTheme: {
                    primary: "#4ade80",
                    secondary: "#fff",
                  },
                },
                error: {
                  duration: 4000,
                  iconTheme: {
                    primary: "#ef4444",
                    secondary: "#fff",
                  },
                },
                loading: {
                  iconTheme: {
                    primary: "#3b82f6",
                    secondary: "#fff",
                  },
                },
              }}
            />
          </main>
        </>
      )}
    </>
  );
}

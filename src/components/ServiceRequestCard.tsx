import { useState, useEffect } from "react";
import { ServiceRequestCardProps } from "@/types";
import { useTechnicianJobs } from "@/hooks/useTechnicianJobs";
import toast, { Toaster } from "react-hot-toast";
import { MapPopup } from "./MapPopup";
import { formatAppointmentDate } from "@/utils/datetime";

export function ServiceRequestCard({
  data,
  technicianLocation,
  straightDistance,
  onJobActionComplete,
}: ServiceRequestCardProps) {
  const [showMap, setShowMap] = useState(false);
  const [isClient, setIsClient] = useState(false);
  // ดึงฟังก์ชัน acceptJob และ rejectJob จาก hook
  const { acceptJob, rejectJob, loading } = useTechnicianJobs(); // เพิ่ม loading state เพื่อปิดปุ่มระหว่างรอ

  const handleAccept = async () => {
    // ส่ง serviceRequestId ไปที่ฟังก์ชัน acceptJob
    const result = await acceptJob(data.id);
    if (result.success) {
      toast.success("รับงานเรียบร้อย!");
      onJobActionComplete(); // เรียกใช้ callback เมื่อเสร็จสิ้น
      // TODO: อาจจะต้องเรียก fetchNearbyRequests ใหม่จาก TechnicianRequestPage เพื่ออัปเดตรายการ
      // หรือลบรายการนี้ออกจาก state ไปเลย
    } else {
      alert(`เกิดข้อผิดพลาดในการรับงาน: ${result.error}`);
    }
  };

  const handleReject = async () => {
    // ส่ง serviceRequestId ไปที่ฟังก์ชัน rejectJob
    const result = await rejectJob(data.id);
    if (result.success) {
      toast.success("ปฏิเสธงานเรียบร้อย!");
      onJobActionComplete(); // เรียกใช้ callback เมื่อเสร็จสิ้น
      // TODO: อาจจะต้องเรียก fetchNearbyRequests ใหม่จาก TechnicianRequestPage เพื่ออัปเดตรายการ
      // หรือลบรายการนี้ออกจาก state ไปเลย
    } else {
      alert(`เกิดข้อผิดพลาดในการปฏิเสธงาน: ${result.error}`);
    }
  };

  // ตรวจสอบว่าอยู่ใน client-side แล้ว
  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className="w-[90%] md:w-[100%] max-w-[95%] mx-auto px-5 py-5 bg-[var(--white)] border-1 border-[var(--gray-300)] rounded-[8px] shadow-lg overflow-hidden">
      <div className="md:flex md:flex-row md:justify-between flex flex-col gap-2">
        <h1 className="text-heading-2">{data.service.name}</h1>
        <div className="md:flex md:gap-5">
          <p className="text-heading-5 text-[var(--gray-700)]">
            วันเวลาดำเนินการ
          </p>
          <p className={`text-heading-5 ${
            !data.appointment_at 
              ? 'text-[var(--gray-700)]' 
              : 'text-[var(--blue-600)]'
          }`}>
            {formatAppointmentDate(data.appointment_at)}
          </p>
        </div>
      </div>

      <div className="grid [grid-template-columns:minmax(130px,auto)_1fr] gap-y-5 mt-5">
        <p className="text-[var(--gray-700)] text-heading-5">รายการ</p>
        <p>{data.service.sub_service} {data.quantity} {data.service.unit}</p>

        <p className="text-[var(--gray-700)] text-heading-5">รหัสคำสั่งซ่อม</p>
        <p>{data.service_request_code}</p>

        <p className="text-[var(--gray-700)] text-heading-5">ราคารวม</p>
        <p>{data.service.price} ฿</p>

        <p className="text-[var(--gray-700)] text-heading-5">สถานที่</p>
        <p>{data.full_address}</p>
      </div>

      <div className="md:flex md:flex-row md:justify-between mt-2">
        <button
          onClick={() => setShowMap(true)}
          className="btn btn--ghost mb-7 pl-32"
          disabled={!isClient}
        >
          <svg
            className="content-center w-5 h- text-[var(--blue-600)]"
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
          ดูแผนที่
        </button>
        <div className="flex gap-[16px]">
          <button
            onClick={handleReject}
            className="btn btn--secondary w-[112px] h-[44px]"
            disabled={loading} // ปิดการใช้งานปุ่มขณะโหลด
          >
            {loading ? "กำลังปฏิเสธ..." : "ปฏิเสธ"}
          </button>
          <button
            onClick={handleAccept}
            className="btn btn--primary w-[112px] h-[44px]"
            disabled={loading} // ปิดการใช้งานปุ่มขณะโหลด
          >
            {loading ? "กำลังรับงาน..." : "รับงาน"}
          </button>
        </div>
      </div>

      {/* Map Popup Modal - แสดงเมื่ออยู่ใน client-side เท่านั้น */}
      {isClient && (
        <MapPopup
          isOpen={showMap}
          onClose={() => setShowMap(false)}
          data={data}
          technicianLocation={technicianLocation}
          straightDistance={straightDistance}
        />
      )}

      {/* เพิ่ม Toaster component ที่นี่เพื่อให้ toast สามารถแสดงผลได้ */}
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
    </div>
  );
}

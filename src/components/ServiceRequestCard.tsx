import { useState, useEffect } from "react";
import { ServiceRequestCardProps } from "@/types";
import { useTechnicianJobs } from "@/hooks/useTechnicianJobs";
import toast from "react-hot-toast";
import { MapPopup } from "./MapPopup";
import { formatAppointmentDate } from "@/utils/datetime";
import Image from "next/image";

// Confirmation Modal Component
interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  type: "accept" | "reject";
  loading: boolean;
}

function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
  type,
  loading,
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-gray-700 opacity-40 bg"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl p-6 mx-4 max-w-md w-full animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300 rounded-full p-1 disabled:opacity-50 cursor-pointer"
          disabled={loading}
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="text-center">
          {/* Icon */}
          <div
            className="mx-auto flex items-center justify-center h-12 w-12 rounded-full"
          >
            {type === "accept" ? (
              <Image
                src="/asset/images/Group.png"
                alt="Accept Icon"
                width={36}
                height={36}
                className="h-9 w-9"
              />
            ) : (
              <svg
                className="h-9 w-9 text-red-600 "
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            )}
          </div>

          {/* Title */}
          <h3 className="text-[20px] font-medium text-[var(--gray-950)] mb-2">{title}</h3>

          {/* Message */}
          <p className="text-[16px] text-[var(--gray-700)] mb-6 md:px-10">{message}</p>

          {/* Buttons */}
          <div className="flex gap-3 justify-center">
            <button
              onClick={onClose}
              className="w-[112px] h-[44px] btn btn--secondary"
              disabled={loading}
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className="w-[112px] h-[44px] btn btn--primary"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  กำลังดำเนินการ...
                </div>
              ) : (
                confirmText
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ServiceRequestCard({
  data,
  technicianLocation,
  straightDistance,
  onJobActionComplete,
}: ServiceRequestCardProps) {
  const [showMap, setShowMap] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"accept" | "reject" | null>(null);
  // ดึงฟังก์ชัน acceptJob และ rejectJob จาก hook
  const { acceptJob, rejectJob, loading } = useTechnicianJobs(); // เพิ่ม loading state เพื่อปิดปุ่มระหว่างรอ

  const handleAcceptClick = () => {
    setConfirmAction("accept");
    setShowConfirmModal(true);
  };

  const handleRejectClick = () => {
    setConfirmAction("reject");
    setShowConfirmModal(true);
  };

  const handleConfirmAction = async () => {
    if (confirmAction === 'accept') {
      const result = await acceptJob(data.id);
      if (result.success) {
        toast.success("รับงานเรียบร้อย!");
        onJobActionComplete();
        setShowConfirmModal(false);
      } else {
        toast.error(`เกิดข้อผิดพลาดในการรับงาน: ${result.error}`);
        setShowConfirmModal(false);
      }
    } else if (confirmAction === 'reject') {
      const result = await rejectJob(data.id);
      if (result.success) {
        toast.success("ปฏิเสธงานเรียบร้อย!");
        onJobActionComplete();
        setShowConfirmModal(false);
      } else {
        toast.error(`เกิดข้อผิดพลาดในการปฏิเสธงาน: ${result.error}`);
        setShowConfirmModal(false);
      }
    }
  }

  const handleCloseModal = () => {
    if (!loading) {
      setShowConfirmModal(false);
      setConfirmAction(null);
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
          <p
            className={`text-heading-5 ${
              !data.appointment_at
                ? "text-[var(--gray-700)]"
                : "text-[var(--blue-600)]"
            }`}
          >
            {formatAppointmentDate(data.appointment_at)}
          </p>
        </div>
      </div>

      <div className="grid [grid-template-columns:minmax(130px,auto)_1fr] gap-y-5 mt-5">
        <p className="text-[var(--gray-700)] text-heading-5">รายการ</p>
        <p>
          {data.service.sub_service} {data.quantity} {data.service.unit}
        </p>

        <p className="text-[var(--gray-700)] text-heading-5">รหัสคำสั่งซ่อม</p>
        <p>{data.service_request_code}</p>

        <p className="text-[var(--gray-700)] text-heading-5">ราคารวม</p>
        <p>{data.total_price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2, })} ฿</p>

        <p className="text-[var(--gray-700)] text-heading-5">สถานที่</p>
        <p>{data.full_address}</p>
      </div>

      <div className="md:flex md:flex-row md:justify-between mt-2 items-center content-center justify-center flex flex-col">
        <button
          onClick={() => setShowMap(true)}
          className="btn btn--ghost mb-7 md:pl-32 pl-5"
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
            onClick={handleRejectClick}
            className="btn btn--secondary md:w-[112px] w-[141px] h-[44px]"
            disabled={loading} 
          >
            ปฏิเสธ
          </button>
          <button
            onClick={handleAcceptClick}
            className="btn btn--primary md:w-[112px] w-[141px] h-[44px]"
            disabled={loading}
          >
            รับงาน
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

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={handleCloseModal}
        onConfirm={handleConfirmAction}
        title={confirmAction === 'accept' ? 'ยืนยันการรับงาน?' : 'ยืนยันการปฏิเสธงาน?'}
        message={
          confirmAction === 'accept' 
            ? `คุณสามารถให้บริการ "${data.service.name}" ในวันที่ ${formatAppointmentDate(data.appointment_at)}`
            : `คุณต้องการปฏิเสธงาน "${data.service.name}" ในวันที่ ${formatAppointmentDate(data.appointment_at)}`
        }
        
        confirmText={confirmAction === 'accept' ? 'รับงาน' : 'ปฏิเสธ'}
        cancelText="ยกเลิก"
        type={confirmAction || 'accept'}
        loading={loading}
      />
    </div>
  );
}

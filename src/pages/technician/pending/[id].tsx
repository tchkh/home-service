import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import MobileHeader from "@/components/shared/MobileHeader";
import { useSidebar } from "@/contexts/SidebarContext";
import axios from "axios";
import { formatThaiDatetime } from "@/utils/datetime";
import { MapPopup } from "@/components/MapPopup";
import { calculateStraightDistance } from "@/utils/distance";

interface JobDetail {
  id: string;
  user_id: string;
  category: string;
  category_color: string;
  service: string;
  sub_service: string;
  appointment_at: string;
  full_address: string;
  latitude: number;
  longitude: number;
  total_price: number;
  first_name: string;
  last_name: string;
  tel: string;
  accepted_at: string;
  service_id: number;
  status?: string;
  notes?: string;
  created_at?: string;
  technician_latitude: number;
  technician_longitude: number;
}

export default function JobDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [jobData, setJobData] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isSidebarOpen, toggleSidebar } = useSidebar();
  const [showMap, setShowMap] = useState(false);
  const [isClient, setIsClient] = useState(false);

  const fetchJobDetail = async (jobId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`/api/technician/pending/${jobId}`);
      setJobData(response.data);
    } catch (error) {
      console.error("Error fetching job detail:", error);
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        setError("ไม่พบรายการงานที่ต้องการ");
      } else {
        setError("เกิดข้อผิดพลาดในการโหลดข้อมูล");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id && typeof id === "string") {
      fetchJobDetail(id);
    }
    setIsClient(true);
  }, [id]);

  const handleBack = () => {
    router.push("/technician/pending"); // กลับไปหน้าตาราง
  };

  const formatPhoneNumber = (phone: string) => {
    // Format เบอร์โทรให้แสดงแบบ 080 000 1233
    return phone.replace(/(\d{3})(\d{3})(\d{4})/, "$1 $2 $3");
  };

  // คำนวณระยะทางเมื่อมีข้อมูลครบ
  const straightDistance = jobData
    ? calculateStraightDistance(
        jobData.technician_latitude,
        jobData.technician_longitude,
        jobData.latitude,
        jobData.longitude
      )
    : 0;

  if (loading) {
    return (
      <>
        <MobileHeader />
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-gray-500">กำลังโหลดข้อมูล...</div>
        </div>
      </>
    );
  }

  if (error || !jobData) {
    return (
      <>
        <MobileHeader />
        <div className="flex flex-col justify-center items-center min-h-screen gap-4">
          <div className="text-red-500">{error || "ไม่พบข้อมูล"}</div>
          <Button
            onClick={handleBack}
            className="bg-blue-600 hover:bg-blue-700"
          >
            กลับไปหน้าหลัก
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Mobile Header */}
      <MobileHeader />
      {/* Header */}
      <header className="relative mt-18 md:mt-0 flex flex-row justify-between items-center px-8 md:py-5 py-4 bg-[var(--white)] shadow-lg overflow-hidden">
        {/* Hide & Show sidebar */}
        <Button
          type="button"
          onClick={toggleSidebar}
          className="absolute top-7 -left-3 bg-[var(--blue-950)] hover:bg-[var(--blue-800)] active:bg-[var(--blue-900)] border-1 border-[var(--gray-200)] cursor-pointer hidden md:block"
        >
          {isSidebarOpen ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-chevron-left-icon lucide-chevron-left"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-chevron-right-icon lucide-chevron-right"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          )}
        </Button>

        <div className="flex flex-col w-full gap-4">
          <div className="flex items-center gap-1">
            <button onClick={handleBack}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="gray"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-chevron-left-icon lucide-chevron-left cursor-pointer"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
            <div>
              <p className="text-body-4 text-[var(--gray-700)]">
                รายการที่รอดำเนินการ
              </p>
              <h1 className="text-heading-2 text-2xl font-semibold">
                {jobData.service}
              </h1>
            </div>
          </div>
        </div>
      </header>
      {/* Content */}
      <main className="w-[90%] max-w-[95%] mx-auto px-5 py-5 bg-[var(--white)] border-1 border-[var(--gray-300)] rounded-[8px] shadow-lg overflow-hidden my-8">
        <h1 className="text-heading-2 mt-4">{jobData.service}</h1>
        <div className="grid [grid-template-columns:minmax(130px,auto)_1fr] md:gap-y-12 md:gap-x-20 gap-y-5 gap-x-2 mt-10">
          <p className="text-[var(--gray-700)] text-heading-5">หมวดหมู่</p>
          <p
            className="py-[4px] px-[10px] rounded-[8px] text-body-4"
            style={{ color: jobData.category_color }}
          >
            {jobData.category}
          </p>

          <p className="text-[var(--gray-700)] text-heading-5">รายการ</p>
          <p>{jobData.sub_service}</p>

          <p className="text-[var(--gray-700)] text-heading-5">
            วันเวลาดำเนินการ
          </p>
          <p>{formatThaiDatetime(jobData.appointment_at)}</p>

          <p className="text-[var(--gray-700)] text-heading-5">สถานที่</p>
          <div>
            <p>{jobData.full_address}</p>
            <button
              onClick={() => setShowMap(true)}
              className="btn btn--ghost mt-1"
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
          </div>

          <p className="text-[var(--gray-700)] text-heading-5">
            รหัสคำสั่งซ่อม
          </p>
          <p>AD04071205</p>

          <p className="text-[var(--gray-700)] text-heading-5">ราคารวม</p>
          <p>{jobData.total_price} ฿</p>

          <p className="text-[var(--gray-700)] text-heading-5">ผู้รับบริการ</p>
          <p>
            {jobData.first_name} {jobData.last_name}
          </p>

          <p className="text-[var(--gray-700)] text-heading-5">เบอร์ติดต่อ</p>
          <p>{formatPhoneNumber(jobData.tel)}</p>
        </div>

        {/* Map Popup Modal - แสดงเมื่ออยู่ใน client-side เท่านั้น */}
              {isClient && (
                <MapPopup
                  isOpen={showMap}
                  onClose={() => setShowMap(false)}
                  data={jobData}
                  technicianLocation={{
                    latitude: jobData.technician_latitude,
                    longitude: jobData.technician_longitude,
                  }}
                  straightDistance={straightDistance}
                />
              )}
      </main>
    </>
  );
}

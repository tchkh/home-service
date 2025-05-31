import MobileHeader from "@/components/shared/MobileHeader";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/contexts/SidebarContext";
import { useState, useEffect } from "react";
import axios from "axios";
import JobsTable from "@/components/shared/JobsTable";
import { useRouter } from "next/router";
import { TechnicianPendingProps } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function TechnicianPendingPage({
  initialData,
}: TechnicianPendingProps) {
  const { isSidebarOpen, toggleSidebar } = useSidebar();
  const [data, setData] = useState(initialData || {
    services: [],
    jobs: [],
    technician: { id: '', name: '', email: '' },
    hasJobs: false
  });
  const [selectedService, setSelectedService] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("accepted");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const fetchPendingData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedService !== "all") {
        params.append("service_id", selectedService);
      }
      if (sortBy !== "accepted") {
        params.append("sort_by", sortBy);
      }

      const response = await axios.get(`/api/technician/pending?${params}`);
      setData(response.data);

    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedService, sortBy]);

  const handleActionClick = (jobId: string) => {
    router.push(`/technician/pending/${jobId}`);
    console.log(jobId)
  };

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
        <div className="flex flex-col md:flex md:flex-row md:justify-between w-full gap-4">
          <h1 className="text-heading-2 text-2xl font-semibold">
            รายการที่รอดำเนินการ
          </h1>
          <input
            type="text"
            placeholder="ค้นหารายการคำสั่งซ่อม"
            className="h-[44px] border-1 border-[var(--gray-300)] rounded-[8px] py-[10px] px-[16px] md:w-[350px]"
          />
        </div>
      </header>

      {/* Content */}
      <main className="px-8 md:py-5 py-4">
        <div className="grid grid-cols-2 md:flex gap-4">
          <div className="flex flex-col md:flex md:flex-row gap-3">
            <p>บริการ</p>
            <Select value={selectedService} onValueChange={setSelectedService}>
              <SelectTrigger className="border-1 border-[var(--gray-300)] rounded-[8px] py-2.5 px-4 md:w-[224px] w-full cursor-pointer">
                <SelectValue placeholder="เลือกบริการ" />
              </SelectTrigger>
              <SelectContent className="bg-white border-0">
                <SelectItem value="all" className="cursor-pointer hover:bg-[var(--gray-100)]">ทั้งหมด</SelectItem>
                {data.services.map((service) => (
                  <SelectItem
                    key={service.service_id}
                    value={service.service_id.toString()}
                    className="cursor-pointer hover:bg-[var(--gray-100)]"
                  >
                    {service.service_title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col md:flex md:flex-row gap-3">
            <p>เรียงตาม</p>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="border-1 border-[var(--gray-300)] rounded-[8px] py-2.5 px-4 md:w-[224px] cursor-pointer">
                <SelectValue placeholder="เลือกการเรียง" />
              </SelectTrigger>
              <SelectContent className="bg-white border-0">
                <SelectItem value="appointment" className="cursor-pointer hover:bg-[var(--gray-100)]">
                  วันดำเนินการที่ใกล้ถึง
                </SelectItem>
                <SelectItem value="accepted" className="cursor-pointer hover:bg-[var(--gray-100)]">รายการล่าสุด</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </main>

      {/* Jobs Table Component */}
      <JobsTable
        jobs={data.jobs}
        loading={loading}
        hasJobs={data.hasJobs}
        message={data.message}
        onActionClick={handleActionClick}
      />
    </>
  );
}

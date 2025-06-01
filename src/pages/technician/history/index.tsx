import MobileHeader from "@/components/shared/MobileHeader";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useSidebar } from "@/contexts/SidebarContext";
import JobsTable from "@/components/shared/JobsTable";
import { useRouter } from "next/router";
import axios from "axios";
import { Search } from "lucide-react";
import { TechnicianHistoryProps } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function TechnicianHistoryPage({
  initialData,
}: TechnicianHistoryProps) {
  const { isSidebarOpen, toggleSidebar } = useSidebar();
  const [selectedService, setSelectedService] = useState<string>("all");
  const [data, setData] = useState(
    initialData || {
      services: [],
      jobs: [],
      technician: { id: "", name: "", email: "" },
      hasJobs: false,
    }
  );
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const fetchHistoryData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedService !== "all") {
        params.append("service_id", selectedService);
      }

      const response = await axios.get(`/api/technician/history?${params}`);
      setData(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistoryData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedService]);

  const handleActionClick = (jobId: string) => {
    router.push(`/technician/history/${jobId}`);
    console.log(jobId);
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
          <h1 className="text-heading-2 text-2xl font-semibold content-center">
            ประวัติการซ่อม
          </h1>
          <div className="relative w-full md:w-[350px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--gray-300)] w-5 h-5" />
            <input
              type="text"
              placeholder="ค้นหารายการคำสั่งซ่อม"
              className="h-[44px] w-full border border-[var(--gray-300)] rounded-[8px] py-[10px] pl-10 pr-[16px]"
            />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="px-8 md:py-5 py-4">
        <div className="flex flex-col md:flex md:flex-row gap-3">
          <p>บริการ</p>
          <Select value={selectedService} onValueChange={setSelectedService}>
            <SelectTrigger className="border-1 border-[var(--gray-300)] rounded-[8px] py-2.5 px-4 md:w-[224px] w-full cursor-pointer">
              <SelectValue placeholder="เลือกบริการ" />
            </SelectTrigger>
            <SelectContent className="bg-white border-0">
              <SelectItem
                value="all"
                className="cursor-pointer hover:bg-[var(--gray-100)]"
              >
                ทั้งหมด
              </SelectItem>
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

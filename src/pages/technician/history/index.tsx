import MobileHeader from "@/components/shared/MobileHeader";
import { useState, useEffect } from "react";
import JobsTable from "@/components/shared/JobsTable";
import { useRouter } from "next/router";
import axios from "axios";
import { Search } from "lucide-react";
import { TechnicianHistoryProps } from "@/types";
import ToggleSidebarComponent from "@/components/ToggleSidebarComponent";
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
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  const fetchHistoryData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedService !== "all") {
        params.append("service_id", selectedService);
      }
      if (searchTerm.trim() !== "") {
        params.append("search", searchTerm.trim());
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
    const timer = setTimeout(() => {
      fetchHistoryData();
    }, 500);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, selectedService]);

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
        <ToggleSidebarComponent />
        <div className="flex flex-col md:flex md:flex-row md:justify-between w-full gap-4">
          <h1 className="text-heading-2 text-2xl font-semibold content-center">
            ประวัติการซ่อม
          </h1>
          <div className="relative w-full md:w-[350px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--gray-300)] w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              placeholder="ค้นหารายการคำสั่งซ่อม"
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-[44px] w-full border border-[var(--gray-300)] rounded-[8px] py-[10px] pl-10 pr-[16px]"
            />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="px-8 md:py-5 py-4">
        <div className="flex flex-col md:flex md:flex-row gap-3 items-center">
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
        showActions={false}
      />
    </>
  );
}

import MobileHeader from "@/components/shared/MobileHeader";
import { useState, useEffect } from "react";
import axios from "axios";
import JobsTable from "@/components/shared/JobsTable";
import { useRouter } from "next/router";
import { TechnicianPendingProps } from "@/types";
import toast, { Toaster } from "react-hot-toast"; 
import ToggleSidebarComponent from "@/components/ToggleSidebarComponent";
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

  const [data, setData] = useState(
    initialData || {
      services: [],
      jobs: [],
      technician: { id: "", name: "", email: "" },
      hasJobs: false,
    }
  );
  const [selectedService, setSelectedService] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("accepted");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
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
      if (searchTerm.trim() !== "") {
        params.append("search", searchTerm.trim());
      }

      const response = await axios.get(`/api/technician/pending?${params}`);
      setData(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteJob = async (jobId: string) => {
    try {
      const response = await axios.post("/api/technician/complete-job", {
        serviceRequestId: jobId,
      });
      if (response.status === 200) {
        toast.success("ดำเนินงานสำเร็จ", {
          duration: 2000,
        });
        await fetchPendingData();

        return;
      }
    } catch (error) {
      console.error("Error completing job:", error);

      // แสดง error message ให้ user
      if (axios.isAxiosError(error)) {
        const message =
          error.response?.data?.error || "เกิดข้อผิดพลาดในการอัพเดทสถานะ";
        alert(message); // หรือใช้ toast notification
      }

      throw error; // ส่งต่อ error ให้ component handle
    }
  };
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPendingData();
    }, 500);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, selectedService, sortBy]);

  const handleActionClick = (jobId: string) => {
    router.push(`/technician/pending/${jobId}`);
    console.log(jobId);
  };

  return (
    <>
      {/* Mobile Header */}
      <MobileHeader />
      {/* Header */}
      <header className="relative mt-18 md:mt-0 flex flex-row justify-between items-center  md:h-24 px-8 md:py-5 py-4 bg-[var(--white)] border-b-1 border-[var(--gray-300)]">
        {/* Hide & Show sidebar */}
        <ToggleSidebarComponent />
        <div className="flex flex-col md:flex md:flex-row md:justify-between w-full gap-4">
          <h1 className="text-heading-2 text-2xl content-center">
            รายการที่รอดำเนินการ
          </h1>
          <input
            type="text"
            value={searchTerm}
            placeholder="ค้นหารายการคำสั่งซ่อม"
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-[44px] border-1 border-[var(--gray-300)] rounded-[8px] py-[10px] px-[16px] md:w-[350px]"
          />
        </div>
      </header>

      {/* Content */}
      <main className="px-8 md:py-5 py-4 ">
        <div className="grid grid-cols-2 md:flex gap-4">
          <div className="flex flex-col md:flex md:flex-row gap-3 items-center">
            <p>บริการ</p>
            <Select value={selectedService} onValueChange={setSelectedService}>
              <SelectTrigger className="border-1 border-[var(--gray-300)] bg-[var(--white)] rounded-[8px] py-2.5 px-4 md:w-[224px] w-full cursor-pointer">
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
          <div className="flex flex-col md:flex md:flex-row gap-3 items-center">
            <p>เรียงตาม</p>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="border-1 border-[var(--gray-300)] bg-[var(--white)] rounded-[8px] py-2.5 px-4 md:w-[224px] cursor-pointer">
                <SelectValue placeholder="เลือกการเรียง" />
              </SelectTrigger>
              <SelectContent className="bg-white border-0">
                <SelectItem
                  value="appointment"
                  className="cursor-pointer hover:bg-[var(--gray-100)]"
                >
                  วันดำเนินการที่ใกล้ถึง
                </SelectItem>
                <SelectItem
                  value="accepted"
                  className="cursor-pointer hover:bg-[var(--gray-100)]"
                >
                  รายการล่าสุด
                </SelectItem>
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
        showActions={true}
        onCompleteJob={handleCompleteJob}
      />

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
    </>
  );
}

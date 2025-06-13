import { GetServerSideProps } from "next";
import RepairCard from "@/components/RepairCard";
import { RepairCardProps } from "@/types/index";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import axios from "axios";

interface Props {
  repairs: RepairCardProps[];
}

const HistoryPage: React.FC<Props> = ({ repairs }) => {
  return (
    <main className="bg-[var(--bg)] w-full min-h-screen pb-10">
      {/* Header */}
      <Navbar />

      {/* Desktop Title */}
      <h1 className="hidden md:block text-center text-heading-2 text-white bg-[var(--blue-600)] py-4 mb-6">
        ประวัติการซ่อม
      </h1>

      <section className="flex flex-col md:flex-row md:justify-center md:gap-2">
      {/* Menu */}
      <section className="flex flex-row md:flex-col justify-around md:h-32 bg-[var(--white)] rounded-xl shadow p-4 mb-4 text-sm">
        <div className="text-[var(--gray-600)]">ข้อมูลผู้ใช้งาน</div>
        <div className="text-[var(--gray-600)]">รายการคำสั่งซ่อม</div>
        <div className="text-[var(--blue-600)] font-semibold">ประวัติการซ่อม</div>
      </section>

      {/* Mobile Title */}
      <h1 className="md:hidden text-center text-heading-2 text-white bg-[var(--blue-600)] rounded-md py-2 mx-4 mb-4">
        ประวัติการซ่อม
      </h1>

      {/* Repair List */}
      <section className="flex flex-col gap-5 md:w-7/10 px-4 mb-6">
      {repairs.length > 0 ? (
        repairs.map((item) => <RepairCard key={item.code} data={item} />)
      ) : (
        <section className="flex justify-center items-center h-[calc(100vh-200px)]">
          <p className="text-center text-[var(--gray-500)]">ไม่พบข้อมูลประวัติการซ่อม</p>
        </section>
      )}
      </section>
      </section>
      {/* Footer */}
      <Footer />
    </main>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const cookie = context.req.headers.cookie || '';
  // Absolute URL for SSR
  const protocol = context.req.headers['x-forwarded-proto'] || 'http';
  const host = context.req.headers.host;
  const baseUrl = `${protocol}://${host}`;
  console.log("[DEBUG] baseUrl: ", baseUrl);
  try {
    const response = await axios.get(`${baseUrl}/api/getHistoryData`, {
      headers: {
        Cookie: cookie,
      },
    });
    const data = response.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const repairs: RepairCardProps[] = data.map((item: any) => ({
      code: item.service_request_code,
      status: item.status?.status || "-",
      appointment_at: item.appointment_at || "--/--",
      technician_name: item.technician_assignment?.technician
        ? item.technician_assignment.technician.first_name + " " + item.technician_assignment.technician.last_name
        : "-",
      total_price: item.total_price,
      quantity: item.quantity,
      service_title: item.service?.title || "-",
      service_unit: item.service?.service_unit || "-",
    }));
    
    return {
      props: {
        repairs,
      },
    };
  } catch (error) {
    console.error("Error fetching repairs:", error);
    // ส่ง array ว่างถ้า error (เช่น 401/404)
    return {
      props: {
        repairs: [],
      },
    };
  }
};

export default HistoryPage;
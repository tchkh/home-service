import { RepairCardProps } from "@/types/index";
import { formatThaiDatetime } from "@/utils/datetime";
import { Calendar1Icon, CircleUserIcon } from "lucide-react";
interface Props {
  data: RepairCardProps;
}

const RepairCard: React.FC<Props> = ({ data }) => {
  const statusColor =
    data.status === "รอดำเนินการ"
      ? "bg-[var(--gray-200)] text-[var(--gray-900)]"
      : data.status === "กำลังดำเนินการ"
      ? "bg-[var(--yellow-100)] text-[var(--gray-900)]"
      : data.status === "ดำเนินการสำเร็จ"
      ? "bg-[var(--green-100)] text-[var(--green-900)]"
      : "bg-red-100 text-red-900";

  return (
    <article className="bg-[var(--white)] border border-[var(--gray-300)] rounded-md shadow p-4 md:p-5">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center">
        <h2 className="text-heading-4 text-[var(--black)] mb-2">
          คำสั่งการซ่อมรหัส : {data.code}
        </h2>

        <p className="mb-4 text-body-3 text-[var(--gray-700)]">
          สถานะ:{" "}
          <span
            className={`inline-block px-3 py-1 rounded-full text-body-3 ${statusColor}`}
          >
            {data.status}
          </span>
        </p>
      </div>

      <div className="flex flex-col md:flex-row md:justify-between md:items-start md:mb-2">
        <div className="flex flex-col">
          <p className="flex items-center gap-3 mb-1 text-body-3 text-[var(--gray-700)]">
            <Calendar1Icon className="w-[20px] h-[20px]" /> วันเวลานัดหมาย:{" "}
            {formatThaiDatetime(data.appointment_at)}
          </p>

          <p className="flex items-center gap-3 mb-2 text-body-3 text-[var(--gray-700)]">
            <CircleUserIcon className="w-[20px] h-[20px]" /> พนักงาน:{" "}
            {data.technician_name}
          </p>
        </div>

        <p className="mb-2 text-body-3 text-[var(--gray-700)]">
          <span className="mr-4">ราคารวม:</span>
          <span className="text-heading-5 text-[var(--black)]">
            {data.total_price
              ? Number(data.total_price).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })
              : "-"}{" "}
            ฿
          </span>
        </p>
      </div>

      <div className="flex flex-col md:flex-row md:justify-between md:items-center">
        <div className="flex flex-row md:flex-col text-body-3 text-[var(--gray-700)]">
          <span className="mr-6">รายการ:</span>
          <div className="flex md:items-center gap-2">
            <span className="text-[var(--black)]">&bull;</span>
            <span className="text-body-3 text-[var(--black)]">
              {data.service_title} {data.quantity} {data.service_unit}
            </span>
          </div>
        </div>

        {data.status !== "ดำเนินการสำเร็จ" && data.status !== "ยกเลิก" && (
          <button className="w-fit px-8 py-2 mt-4 md:mt-0 text-white text-heading-5 bg-[var(--blue-600)] rounded-md hover:bg-[var(--blue-700)] cursor-pointer">
            ดูรายละเอียด
          </button>
        )}
      </div>
    </article>
  );
};

export default RepairCard;

import EditIcon from "../icons/EditIcon";
import { JobsTableProps } from "@/types";
import { formatAppointmentDate } from "@/utils/datetime";


export default function JobsTable({
  jobs,
  loading,
  hasJobs,
  message,
  onActionClick,
  showActions = true,
  onCompleteJob,
}: JobsTableProps) {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-gray-500">กำลังโหลด...</div>
      </div>
    );
  }

  /* No Jobs Message */
  if (!hasJobs) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-gray-500 text-center">
          {message || "ยังไม่มีรายการที่รอดำเนินการในขณะนี้"}
        </div>
      </div>
    );
  }

  const handleActionClick = async (jobId: string) => {
    // ถ้ามี onCompleteJob ให้เรียกฟังก์ชันนั้น (สำหรับ pending page)
    if (onCompleteJob) {
      try {
        await onCompleteJob(jobId);
      } catch (error) {
        console.error('Error completing job:', error);
      }
    }
    // ถ้ามี onActionClick ให้เรียกฟังก์ชันนั้น (สำหรับ edit/view)
    else if (onActionClick) {
      onActionClick(jobId);
    }
  };
  /* Jobs Table */
  return (
    <div className="w-full mt-4 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 my-8">
      <div className="min-w-[1120px] shadow-sm border-1 rounded-[8px] border-gray-200 mx-8">
        <table className="w-full table-fixed">
          <thead className="bg-[var(--gray-100)] sticky top-0">
            <tr className="text-[var(--gray-700)] text-body-3">
              <th className="px-4 py-3 text-left">ชื่อบริการ</th>
              <th className="px-4 py-3 text-left">วันเวลาดำเนินการ</th>
              <th className="md:w-70 px-4 py-3 text-left">รหัสคำสั่งซ่อม</th>
              <th className="md:w-65 px-4 py-3 text-left">ราคารวม</th>
              {showActions && (
                <th className="md:w-40 px-4 py-3 text-center">Action</th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {jobs.map((job) => (
              <tr
                key={job.id}
                className="hover:bg-gray-50 transition-colors text-body-2 cursor-pointer md:h-[88px] h-[54px]"
                onClick={() => onActionClick?.(job.id)}
              >
                <td className="px-4 py-3 md:py-7">{job.service}</td>
                <td className="px-4 py-3 md:py-7">
                  {formatAppointmentDate(job.appointment_at)}
                </td>
                <td className="px-4 py-3 md:py-7">{job.service_request_code}</td>
                <td className="px-4 py-3 md:py-7">{job.total_price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2, })} ฿</td>
                {showActions && (
                <td className="px-4 py-3 md:py-7 text-center">
                  <button
                    className="p-2 text-blue-600 transition-colors cursor-pointer"
                    onClick={(e) => {
                        e.stopPropagation(); // ป้องกัน event bubbling
                        handleActionClick(job.id);
                      }}
                  >
                    <EditIcon className="w-[24px] h-[24px]" />
                  </button>
                </td>

                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

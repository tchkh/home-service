// pages/404.tsx
import Link from "next/link";
import { ArrowLeft } from "lucide-react"; // ถ้ามี Lucide หรือใช้ icon lib อื่น ๆ ก็ได้

export default function Custom404() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6 py-12 ">
      <div className="text-center ">
        <h1 className="text-[15rem] font-extrabold text-[var(--gray-900)] ">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-2">ไม่พบหน้านี้</h2>
        <p className="text-gray-500 mb-6">
          ขอโทษค่ะ หน้าที่คุณพยายามเข้าถึงไม่มีอยู่ในระบบ หรืออาจถูกย้ายไปแล้ว
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[var(--blue-600)] hover:[var(--blue-500)] rounded-[8px] transition"
        >
          <ArrowLeft size={16} />
          กลับหน้าแรก
        </Link>
      </div>
    </div>
  );
}

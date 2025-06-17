import React, { useState, useEffect } from "react";

import setDateTimeFormat from "@/hooks/setDateTimeFormat";
import { useRouter } from "next/router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft } from "@fortawesome/free-solid-svg-icons";
import ToggleSidebarComponent from "@/components/ToggleSidebarComponent";
import axios from "axios";
import { PomotionData } from "@/types/index";

export default function CategoryForm() {
   const router = useRouter();
   const promotionId = router.query.promotion;
   // เก็บ data
   const [promotionData, setPromotionData] = useState<PomotionData>({
      id: "",
      code: "",
      discount_type: "",
      discount_value: 0,
      usage_limit: 0,
      used_count: 0,
      start_date: null,
      end_date: null,
      created_at: undefined,
      updated_at: undefined,
   });

   useEffect(() => {
      const fetchCategory = async () => {
         console.log("promotion: ", promotionId);
         const data = await axios.get(`/api/admin/promotion`, {
            params: { id: promotionId },
         });
         setPromotionData(data.data[0]);
      };
      fetchCategory();
   }, [promotionId]);

   return (
      <div className="min-h-screen bg-[var(--gray-100)] w-full">
         {/* Header */}
         <ToggleSidebarComponent />
         <header className="relative bg-[var(--white)] px-10 py-6 mb-14 h-auto box-border ">
            {" "}
            <div className="flex items-center justify-between max-w-[1440px]">
               <div className="flex items-center space-x-7">
                  <button onClick={() => router.back()} className="btn">
                     <FontAwesomeIcon
                        icon={faAngleLeft}
                        className=" text-2xl text-[var(--gray-700)]"
                     />
                  </button>
                  <div>
                     <h1 className="text-body-4">หมวดหมู่</h1>
                     <h1 className="text-heading-2 ">บริการห้องครัว</h1>
                  </div>
               </div>

               <button
                  onClick={() =>
                     router.push(`/admin/promotion/${promotionId}/edit`)
                  }
                  className="btn btn--primary text-heading-5 px-9 py-2 text-[var(--blue-600)] w-[112px] h-[45px] rounded-[8px]"
               >
                  แก้ไข
               </button>
            </div>
         </header>
         {/* Main Content */}
         <main className="relative max-w-[1440px] h-fit mx-10 my-14 py-10 px-6 box-border bg-[var(--white)] flex flex-col items-start gap-y-5  shadow-sm">
            {/* Category Name Input */}
            <div className="w-full space-x-[24px] flex ">
               <h1 className="text-heading-5 w-[205px] text-[var(--gray-700)]">
                  Promotion Code
               </h1>
               <p className={`text-body-1 text-black text-[16px]`}>
                  {promotionData.code}
               </p>
            </div>

            <div className="w-full space-x-[24px] flex ">
               <h1 className="text-heading-5 w-[205px] text-[var(--gray-700)]">
                  ประเภท
               </h1>
               <p className="text-body-1 text-[16px]">
                  {promotionData.discount_type === "percentage"
                     ? "Percent"
                     : "Fixed"}
               </p>
            </div>

            <div className="w-full space-x-[24px] flex ">
               <h1 className="text-heading-5 w-[205px] text-[var(--gray-700)]">
                  ราคาที่ลด
               </h1>
               <p className={`text-body-1 text-[var(--red)] text-[16px]`}>
                  {promotionData.discount_value}
                  {promotionData.discount_type === "percentage" ? "%" : "฿"}
               </p>
            </div>

            <div className="w-full space-x-[24px] flex ">
               <h1 className="text-heading-5 w-[205px] text-[var(--gray-700)]">
                  โควต้าการใช้
               </h1>
               <p className={`text-body-1 text-black text-[16px]`}>
                  {promotionData.used_count}/{promotionData.usage_limit}
               </p>
            </div>

            <div className="w-full space-x-[24px] flex ">
               <h1 className="text-heading-5 w-[205px] text-[var(--gray-700)]">
                  วันเริ่ม
               </h1>
               <p className={`text-body-1 text-black text-[16px]`}>
                  {promotionData.start_date
                     ? setDateTimeFormat(new Date(promotionData.start_date))
                          .split("")
                          .slice(0, 10)
                          .join("")
                     : "N/A"}
               </p>
            </div>

            <div className="w-full space-x-[24px] flex ">
               <h1 className="text-heading-5 w-[205px] text-[var(--gray-700)]">
                  วันหมดอายุ
               </h1>
               <p className={`text-body-1 text-black text-[16px]`}>
                  {promotionData.end_date
                     ? setDateTimeFormat(new Date(promotionData.end_date))
                          .split("")
                          .slice(0, 10)
                          .join("")
                     : "N/A"}
               </p>
            </div>

            <hr className="text-[var(--gray-300)] w-full my-[40px]" />
            <div className="w-full space-x-[24px] flex ">
               <h1 className="text-heading-5 w-[205px] text-[var(--gray-700)]">
                  สร้างเมื่อ
               </h1>
               <p className={`text-body-1 text-black text-[16px]`}>
                  {promotionData?.created_at
                     ? setDateTimeFormat(new Date(promotionData.created_at))
                     : "N/A"}
               </p>
            </div>
            <div className="w-full space-x-[24px] flex ">
               <h1 className="text-heading-5 w-[205px] text-[var(--gray-700)]">
                  แก้ไขล่าสุด
               </h1>
               <p className={`text-body-1 text-black text-[16px]`}>
                  {promotionData.updated_at
                     ? setDateTimeFormat(new Date(promotionData.updated_at))
                     : "N/A"}
               </p>
            </div>
         </main>
      </div>
   );
}

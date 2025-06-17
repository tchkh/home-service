import React, { useState } from "react";
// import { ArrowLeft, Trash2 } from "lucide-react";
import { useRouter } from "next/router";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
   faAngleLeft,
   faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";
import ToggleSidebarComponent from "@/components/ToggleSidebarComponent";
import DragAndDropCategory from "@/components/admin/category/DragAndDropCategory";

export default function CategoryForm() {
   const router = useRouter();

   const [inputSearch, setInputSearch] = useState("");

   return (
      <div className="min-h-screen bg-[#f3f4f6]">
         {/* Header */}
         <header className="relative bg-white border-b border-gray-200 px-4 py-3">
            <ToggleSidebarComponent />
            <div className="flex items-center justify-between  mx-10">
               <section className="flex items-center space-x-4">
                  <button onClick={() => router.back()} className="btn">
                     <FontAwesomeIcon
                        icon={faAngleLeft}
                        className=" text-2xl text-[var(--gray-700)]"
                     />
                  </button>
                  <h1 className="text-lg font-semibold text-gray-900">
                     หมวดหมู่
                  </h1>
               </section>
               <section className="flex items-center space-x-3">
                  <label htmlFor="inputSearch" className="relative w-full ">
                     <span className="absolute left-4 top-1/2 transform -translate-y-1/2">
                        <FontAwesomeIcon
                           className="text-[var(--gray-300)]"
                           icon={faMagnifyingGlass}
                        />
                     </span>
                     <input
                        id="inputSearch"
                        type="text"
                        placeholder="ค้นหาหมวดหมู่..."
                        className=" text-body-2 pl-10 border-2 border-[var(--gray-300)] min-w-[240px] w-full h-[45px] rounded-lg  placeholder:text-[16px] placeholder:text-[var(--gray-700)] " // เพิ่ม padding ด้านซ้ายเพื่อให้มีพื้นที่สำหรับ icon
                        value={inputSearch}
                        onChange={(e) => setInputSearch(e.target.value)}
                        // onFocus={() => setShowBox(true)}
                     />
                  </label>
                  <button
                     onClick={() => router.push(`/admin/categories/create`)}
                     className="btn btn--primary text-heading-5 px-6 py-2 text-[var(--blue-600)] min-w-[165px] w-fit h-[45px] rounded-[8px]"
                  >
                     เพิ่มหมวดหมู่ +
                  </button>
               </section>
            </div>
         </header>

         <DragAndDropCategory search={inputSearch} setSearch={setInputSearch} />
      </div>
   );
}

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

// import axios from "axios";
// import { Card, CardContent } from "@/components/ui/card";
// import { CategoryData } from "@/types/index";

export default function CategoryForm() {
   const router = useRouter();
   // const [categoryName, setCategoryName] = useState("บริการห้องครัว");
   const [inputSearch, setInputSearch] = useState("");

   // console.log("dataCatag: ", dataCatag);

   // const [isEditing, setIsEditing] = useState(false);

   // Mock data for demonstration

   // const handleSave = () => {
   //    console.log("Saving category:", categoryName);
   //    setIsEditing(false);
   //    // Here you would typically save to your backend
   // };
   // // console.log("isEditing: ", isEditing);
   // const handleCancel = () => {
   //    console.log("Cancelling changes");
   //    setCategoryName(categoryData.name);
   //    setIsEditing(false);
   // };

   // // fetch ครั้งแรก
   // useEffect(() => {
   //    const firstGetDataService = async () => {
   //       try {
   //          // setLoading(true);
   //          const res = await axios.get(`/api/admin/category`);

   //          setDataCatag(res.data);
   //          // allCategory(res.data.service);
   //          // setLoading(false);
   //       } catch (error) {
   //          console.log("error: ", error);
   //       }
   //    };
   //    firstGetDataService();
   // }, []);
   // // fetch จากการค้นหา
   // useEffect(() => {
   //    setTimeout(() => {}, 600);
   //    const firstGetDataService = async () => {
   //       try {
   //          // setLoading(true);
   //          await axios.get(`/api/admin/category`, {
   //             params: {
   //                search: { inputSearch },
   //             },
   //          });
   //          // const res = await axios.get(`/api/service?${queryString}`);
   //          // setDataCard(res.data.service);
   //          // allCategory(res.data.service);
   //          // setMaxPrice(res.data.service);
   //          // setMaxLimit(res.data.count - 1);
   //          // setCurrentLimit(res.data.service.length - 1);
   //          // setLoading(false);
   //       } catch (error) {
   //          console.log("error: ", error);
   //       }
   //    };
   //    firstGetDataService();
   // }, [inputSearch]);

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

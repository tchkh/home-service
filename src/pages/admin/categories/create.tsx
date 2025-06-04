import React, { useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import ToggleSidebarComponent from "@/components/ToggleSidebarComponent";

interface CategoryData {
   name: string;
   color: string;
}

export default function CategoryForm() {
   const [categoryName, setCategoryName] = useState("");
   const [validateName, setValidateName] = useState(false);
   const [categoryColor, setCategoryColor] = useState("");
   const [validateColor, setValidateColor] = useState(false);
   //    const [isEditing, setIsEditing] = useState(false);

   const router = useRouter();

   const categoryData: CategoryData = {
      name: categoryName,
      color: categoryColor,
   };

   // validate
   const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
   const validateCreateData = () => {
      let resultVlidate = null;
      if (!categoryName) {
         resultVlidate = "error";
         setValidateName(true);
      }
      if (!categoryColor || !hexColorRegex.test(categoryColor)) {
         resultVlidate = "error";
         setValidateColor(true);
      }
      return resultVlidate;
   };

   // เมื่อกดสร้าง
   const handleSave = async () => {
      const checkData = validateCreateData();
      if (checkData === "error") {
         return null;
      }
      await axios.post(`/api/admin/category`, categoryData);
      // router.push("/admin/categories"); //หรือ router.back();
   };

   const handleColor = (e: React.ChangeEvent<HTMLInputElement>) => {
      setValidateColor(false);
      setCategoryColor(e.target.value);
   };

   return (
      <div className="min-h-screen bg-[var(--gray-100)]">
         {/* Header */}
         <header className="relative bg-[var(--white)] px-10 py-6 mb-14 h-auto box-border ">
            <ToggleSidebarComponent />
            <div className="flex items-center justify-between max-w-[1440px]">
               <h1 className="text-heading-2 ">เพิ่มหมวดหมู่</h1>
               <div className="flex items-center gap-x-6 ">
                  <button
                     onClick={() => router.back()}
                     className="btn btn--secondary text-heading-5  px-9 py-2 text-[var(--blue-600)] w-[112px] h-[45px]"
                  >
                     ยกเลิก
                  </button>
                  <button
                     onClick={handleSave}
                     className="btn btn--primary text-heading-5  px-9 py-2 text-[var(--white)] w-[112px] h-[45px]"
                  >
                     ยืนยัน
                  </button>
               </div>
            </div>
         </header>

         {/* Main Content */}
         <section className="max-w-[1440px] h-fit mx-10 my-14 py-10 px-6 box-border bg-[var(--white)] flex flex-col items-start gap-y-5  shadow-sm">
            {/* Category Name Input */}
            <div className="w-full space-x-[15%] relative ">
               <label
                  htmlFor="categoryName"
                  className="text-heading-5 text-[var(--gray-700)]"
               >
                  ชื่อหมวดหมู่<span className="text-red-500">*</span>
               </label>
               <input
                  id="categoryName"
                  value={categoryName}
                  onChange={(e) => {
                     setValidateName(false);
                     setCategoryName(e.target.value);
                  }}
                  className={`${
                     validateName
                        ? "border-2 border-red-500"
                        : "border border-[var(--gray-300)]"
                  } w-[40%] text-heading-5 text-[var(--gray-700)] px-3 py-2 rounded-[8px] focus:ring-2 focus:ring-blue-500 `}
                  placeholder="กรอกชื่อหมวดหมู่"
               />
               <p
                  className={`${
                     validateName ? "block" : "hidden"
                  } text-heading-5 text-red-500 absolute left-[1%] -bottom-[13px]`}
               >
                  กรุณาใส่ชื่่อหมวดหมู่*
               </p>
            </div>
            <div className="w-full flex flex-row items-center space-x-[22%] relative ">
               <label
                  htmlFor="changeColor"
                  className="text-heading-5 text-[var(--gray-700)]"
               >
                  สีหมวดหมู่<span className="text-red-500">*</span>
               </label>
               <div className="relative w-[34%]">
                  <input
                     id="changeColor"
                     type="color"
                     value={categoryColor}
                     onChange={handleColor}
                     className={`absolute -left-[65px] bottom-[6.5px]`}
                  />
                  <input
                     type="text"
                     value={categoryColor}
                     onChange={handleColor}
                     className={`${
                        validateColor
                           ? "border-2 border-red-500"
                           : "border border-[var(--gray-300)]"
                     } w-full text-heading-5 text-[var(--gray-700)] px-3 py-2  rounded-[8px] focus:ring-2 focus:ring-blue-500 `}
                     placeholder="ใส่ค่าสี hex #000000"
                  />
               </div>
               <p
                  className={`${
                     validateColor ? "absolute" : "hidden"
                  } text-heading-5 text-red-500  left-[1%] -bottom-[13px]`}
               >
                  กรุณาใส่สีหมวดหมู่*
               </p>
            </div>
         </section>
      </div>
   );
}

import React, { useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import ToggleSidebarComponent from "@/components/ToggleSidebarComponent";
import toast from "react-hot-toast"; // เพิ่ม import สำหรับ toast
import { PomotionData } from "@/types";

export default function CategoryForm() {
   const [createPromotion, setCreatePromotion] = useState<PomotionData>({
      code: "",
      discount_type: "",
      discount_value: null,
      usage_limit: 0,
      start_date: null,
      end_date: null,
   });
   // console.log(createPromotion);
   // const [categoryName, setCategoryName] = useState("");
   const [validateName, setValidateName] = useState(false);
   // const [categoryColor, setCategoryColor] = useState("");
   // const [validateColor, setValidateColor] = useState(false);
   //    const [isEditing, setIsEditing] = useState(false);

   const router = useRouter();

   // const categoryData: CategoryData = {
   //    name: categoryName,
   //    color: categoryColor,
   // };

   // validate
   // const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
   // const validateCreateData = () => {
   //    let resultVlidate = null;
   //    if (!categoryName) {
   //       resultVlidate = "error";
   //       setValidateName(true);
   //    }
   //    if (!categoryColor || !hexColorRegex.test(categoryColor)) {
   //       resultVlidate = "error";
   //       setValidateColor(true);
   //    }
   //    return resultVlidate;
   // };

   // เมื่อกดสร้าง
   const handleSave = async () => {
      // const checkData = validateCreateData();
      // if (checkData === "error") {
      //    return null;
      // }
      const res = await axios.post(`/api/admin/promotion`, createPromotion);
      console.log("res: ", res);
      if (res.status === 200) {
         // แสดง toast เมื่อเข้าสู่ระบบสำเร็จ
         toast.success("สร้างหมวดหมู่สำเร็จ...", {
            duration: 2000,
         });
         router.push("/admin/promotion"); //หรือ router.back();}
      } else {
         console.error("Error creating category:", res.data);
      }
   };

   return (
      <div className="min-h-screen bg-[var(--gray-100)] flex flex-col items-center w-100vw">
         {/* Header */}
         <header className="relative bg-[var(--white)] px-10 py-6 mb-14 h-auto box-border w-full flex justify-center  ">
            <ToggleSidebarComponent />
            <div className="flex items-center justify-between w-full max-w-[1440px]">
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
         <section className="max-w-[1440px] w-[90%] h-fit mx-10 my-14 py-10 px-6 box-border bg-[var(--white)] flex flex-col items-start gap-y-5  shadow-sm">
            {/* Category Name Input */}
            <div className="w-full space-x-[24px] relative flex">
               <label
                  htmlFor="categoryName"
                  className="text-heading-5 w-[205px] text-[var(--gray-700)]"
               >
                  Promotion Code<span className="text-red-500">*</span>
               </label>
               <input
                  id="categoryName"
                  value={createPromotion.code}
                  onChange={(e) => {
                     setValidateName(false);
                     setCreatePromotion((data) => ({
                        ...data,
                        code: e.target.value,
                     }));
                  }}
                  className={`${
                     validateName
                        ? "border-2 border-red-500"
                        : "border border-[var(--gray-300)]"
                  } w-[40%] text-heading-5 text-[var(--gray-700)] px-3 py-2 rounded-[8px] focus:ring-2 focus:ring-blue-500 `}
                  placeholder="กรอก Promotion Code"
               />
               <p
                  className={`${
                     validateName ? "block" : "hidden"
                  } text-heading-5 text-red-500 absolute left-[1%] -bottom-[13px]`}
               >
                  กรุณาใส่ Promotion Code*
               </p>
            </div>
            {/* โค้วต้าที่ใช้ */}
            <div className="w-full space-x-[24px] relative flex">
               <label
                  htmlFor="qouta"
                  className="text-heading-5 w-[205px] text-[var(--gray-700)]"
               >
                  โควต้าการใช้<span className="text-red-500">*</span>
               </label>
               <input
                  id="qouta"
                  type="number"
                  value={createPromotion.usage_limit}
                  onChange={(e) => {
                     setValidateName(false);
                     setCreatePromotion((data) => ({
                        ...data,
                        usage_limit: Number(e.target.value),
                     }));
                  }}
                  className={`${
                     validateName
                        ? "border-2 border-red-500"
                        : "border border-[var(--gray-300)]"
                  } w-[40%] text-heading-5 text-[var(--gray-700)] px-3 py-2 rounded-[8px] focus:ring-2 focus:ring-blue-500 `}
                  placeholder="กรอก Promotion Code"
               />
               <p
                  className={`${
                     validateName ? "block" : "hidden"
                  } text-heading-5 text-red-500 absolute left-[1%] -bottom-[13px]`}
               >
                  กรุณาใส่ โควต้าการใช้
               </p>
            </div>
            {/* ส่วนลด */}
            <div className="w-full space-x-[24px] relative flex">
               <label className="text-heading-5 w-[205px] text-[var(--gray-700)]">
                  ประเภท
               </label>
               <div className="flex flex-col items-center gap-6">
                  {/* <!-- Fixed --> */}
                  <label className="flex items-center gap-2">
                     <input
                        type="radio"
                        name="discountType"
                        value="fixed"
                        checked={createPromotion.discount_type === "fixed"}
                        onChange={(e) => {
                           const target = e.target as HTMLInputElement;
                           setCreatePromotion((data) => ({
                              ...data,
                              discount_type: target.value,
                           }));
                        }}
                        // className="peer/fixed hidden "
                     />
                     <span className="inline-flex items-center gap-2">
                        <span className="w-4 h-4  border-gray-400 peer-checked/fixed:bg-blue-600 peer-checked/fixed:border-transparent"></span>
                        Fixed
                        <input
                           type="number"
                           placeholder="฿"
                           value={
                              !createPromotion.discount_type
                                 ? ""
                                 : createPromotion.discount_type === "fixed"
                                 ? createPromotion.discount_value || ""
                                 : 0
                           }
                           disabled={createPromotion.discount_type !== "fixed"}
                           onChange={(e) => {
                              const target = e.target as HTMLInputElement;
                              setCreatePromotion((data) => ({
                                 ...data,
                                 discount_value: Number(target.value),
                              }));
                           }}
                           className="ml-2 w-24  border  disabled:bg-gray-100 peer-checked/fixed:enabled:bg-blue-600  border-[var(--gray-300)] text-heading-5 text-[var(--gray-700)] px-3 py-2 rounded-[8px] focus:ring-2 focus:ring-blue-500"
                        />
                     </span>
                  </label>

                  {/* <!-- Percent --> */}
                  <label className="flex items-center gap-2">
                     <input
                        type="radio"
                        name="discountType"
                        value="percentage"
                        checked={createPromotion.discount_type === "percentage"}
                        onChange={(e) => {
                           const target = e.target as HTMLInputElement;
                           setCreatePromotion((data) => ({
                              ...data,
                              discount_type: target.value,
                           }));
                        }}
                        // className="peer/percent hidden"
                     />
                     <span className="inline-flex items-center gap-2">
                        <span className="w-4 h-4  border-gray-400 peer-checked/percent:bg-blue-600 peer-checked/percent:border-transparent"></span>
                        Percent
                        <input
                           type="number"
                           placeholder="%"
                           value={
                              !createPromotion.discount_type
                                 ? ""
                                 : createPromotion.discount_type ===
                                   "percentage"
                                 ? createPromotion.discount_value || ""
                                 : 0
                           }
                           max="100"
                           disabled={
                              createPromotion.discount_type !== "percentage"
                           }
                           onChange={(e) => {
                              const target = e.target as HTMLInputElement;
                              setCreatePromotion((data) => ({
                                 ...data,
                                 discount_value: Number(target.value),
                              }));
                           }}
                           className="ml-2 w-24 border border-[var(--gray-300)] text-heading-5 text-[var(--gray-700)] px-3 py-2 rounded-[8px] focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-400"
                        />
                     </span>
                  </label>
               </div>
            </div>
            {/* วันที่เริ่ม */}
            <div className="w-full space-x-[24px] relative flex">
               <label
                  htmlFor="start_date"
                  className="text-heading-5 w-[205px] text-[var(--gray-700)]"
               >
                  วันที่เริ่มใช้<span className="text-red-500">*</span>
               </label>
               <input
                  id="start_date"
                  type="date"
                  value={
                     createPromotion.start_date
                        ? createPromotion.start_date.toISOString().split("T")[0]
                        : ""
                  }
                  onChange={(e) => {
                     setValidateName(false);
                     setCreatePromotion((data) => ({
                        ...data,
                        start_date: new Date(e.target.value), // ✅ แปลง string → Date
                     }));
                  }}
                  className={`${
                     validateName
                        ? "border-2 border-red-500"
                        : "border border-[var(--gray-300)]"
                  } w-[40%] text-heading-5 text-[var(--gray-700)] px-3 py-2 rounded-[8px] focus:ring-2 focus:ring-blue-500 `}
                  placeholder="กรอก วันที่เริ่มใช้  yyyy/mm/dd"
               />
               <p
                  className={`${
                     validateName ? "block" : "hidden"
                  } text-heading-5 text-red-500 absolute left-[1%] -bottom-[13px]`}
               >
                  กรุณาใส่ วันที่เริ่มใช้*
               </p>
            </div>
            {/* วันที่หมดอายุ */}
            <div className="w-full space-x-[24px] relative flex">
               <label
                  htmlFor="end_date"
                  className="text-heading-5 w-[205px] text-[var(--gray-700)]"
               >
                  วันที่หมดอายุ<span className="text-red-500">*</span>
               </label>
               <input
                  id="end_date"
                  type="date"
                  value={
                     createPromotion.end_date
                        ? createPromotion.end_date.toISOString().split("T")[0]
                        : ""
                  }
                  onChange={(e) => {
                     setValidateName(false);
                     setCreatePromotion((data) => ({
                        ...data,
                        end_date: new Date(e.target.value), // ✅ แปลง string → Date
                     }));
                  }}
                  className={`${
                     validateName
                        ? "border-2 border-red-500"
                        : "border border-[var(--gray-300)]"
                  } w-[40%] text-heading-5 text-[var(--gray-700)] px-3 py-2 rounded-[8px] focus:ring-2 focus:ring-blue-500 `}
                  placeholder="กรอก วันที่หมดอายุ  yyyy/mm/dd"
               />
               <p
                  className={`${
                     validateName ? "block" : "hidden"
                  } text-heading-5 text-red-500 absolute left-[1%] -bottom-[13px]`}
               >
                  กรุณาใส่ วันที่หมดอายุ*
               </p>
            </div>
         </section>
      </div>
   );
}

import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft } from "@fortawesome/free-solid-svg-icons";
import { Trash2 } from "lucide-react";
import ToggleSidebarComponent from "@/components/ToggleSidebarComponent";
import ReconfirmPage from "@/components/admin/ReconfirmPage";
import axios from "axios";
import { PomotionData } from "@/types/index";

export default function CategoryForm() {
   // interface CategoryData {
   //    name: string;
   //    color: string;
   // }
   const router = useRouter();
   const promotionId = router.query.promotion;

   // reset data
   // const [resetData, setResetData] = useState<CategoryData>({
   //    id: "",
   //    name: "",
   //    description: "",
   //    created_at: "",
   //    updated_at: "",
   //    color: "",
   //    order_num: 0,
   // });
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
   // console.log("promotionData: ", promotionData);
   // const [categoryName, setCategoryName] = useState("");
   const [validateName, setValidateName] = useState(false);
   // const [categoryColor, setCategoryColor] = useState("");
   // const [validateColor, setValidateColor] = useState(false);
   const [toggleUpdateConfirm, setToggleUpdateConfirm] = useState(false);
   const [toggleDeleteConfirm, setToggleDeleteConfirm] = useState(false);

   const actionUpdate = "แก้ไข Promotion";
   const actionDelete = "ลบ Promotion";
   const titleUpdate = `ยืนยันการ${actionUpdate}`;
   const titleDelete = `ยืนยันการ${actionDelete}`;

   // const handleName = (e: React.ChangeEvent<HTMLInputElement>) => {
   //    setValidateName(false);
   //    setPromotionData((data) => ({
   //       ...data,
   //       name: e.target.value,
   //    }));
   // };

   // const handleColor = (e: React.ChangeEvent<HTMLInputElement>) => {
   //    setValidateColor(false);
   //    setPromotionData((data) => ({
   //       ...data,
   //       color: e.target.value,
   //    }));
   // };

   // เมื่อกด Update Data หข้อมูล
   const handleUpdate = async () => {
      // validate
      // const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
      // const validateCreateData = () => {
      //    let resultVlidate = null;
      //    if (!promotionData.name) {
      //       resultVlidate = "error";
      //       setValidateName(true);
      //    }
      //    if (!promotionData.color || !hexColorRegex.test(promotionData.color)) {
      //       resultVlidate = "error";
      //       setValidateColor(true);
      //    }
      //    return resultVlidate;
      // };
      // const checkData = validateCreateData();
      // if (checkData === "error") {
      //    return null;
      // }

      // const categoryData = {
      //    id: promotionData.id,
      //    name: promotionData.name,
      //    color: promotionData.color,
      // };
      // console.log("categoryData: ", categoryData);
      const res = await axios.put(`/api/admin/promotion`, promotionData);
      if (res.status === 200) {
         alert("update data complete");
         router.back(); //router.push("/admin/promotionData");
      } else {
         console.error("Error creating category:", res.data);
      }
   };

   // set เวลาเพื่อแสดง
   const setDateTimeFormat = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      const amPm = date.getHours() >= 12 ? "PM" : "AM";
      return `${day}/${month}/${year} ${hours}:${minutes}${amPm}`;
   };

   const handleDelete = async () => {
      if (!promotionData.id) {
         alert("ไม่มี id ขออภัย");
         return null;
      }
      const { data } = await axios.delete(`/api/admin/promotion`, {
         params: {
            id: promotionData.id,
         },
      });
      // console.log("data: ", data);
      if (data.error) {
         console.log(data.error);
      }
      alert("delete data complete");
      router.push("/admin/promotion"); //หรือ router.back();
   };

   // ดึงข้อมูลจาก database
   useEffect(() => {
      const fetchCategory = async () => {
         // console.log("categoryId: ", promotionId);
         const data = await axios.get(`/api/admin/promotion`, {
            params: { id: promotionId },
         });
         // setResetData(data.data[0]);
         setPromotionData(data.data[0]);
      };
      fetchCategory();
   }, [promotionId]);

   return (
      <div className="min-h-screen w-full bg-[var(--gray-100)] flex flex-col items-center w-100vw">
         {/* Header */}
         {/* ReconfirmPage การ update */}
         <ReconfirmPage
            title={titleUpdate}
            subTitle={promotionData.code}
            action={actionUpdate}
            toggle={toggleUpdateConfirm}
            setTaggle={setToggleUpdateConfirm}
            actionFunction={() => handleUpdate()}
         />
         {/* ReconfirmPage การ delete */}
         <ReconfirmPage
            title={titleDelete}
            subTitle={promotionData.code}
            action={actionDelete}
            toggle={toggleDeleteConfirm}
            setTaggle={setToggleDeleteConfirm}
            actionFunction={() => handleDelete()}
         />
         <ToggleSidebarComponent />
         <header className="relative bg-[var(--white)] px-10 py-6  h-auto w-full flex justify-center box-border ">
            <div className="flex items-center justify-between  w-full max-w-[1440px]">
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

               <div className="flex items-center gap-x-6 ">
                  <button
                     onClick={() => router.back()}
                     className="btn btn--secondary text-heading-5  px-9 py-2 text-[var(--blue-600)] w-[112px] h-[45px]"
                  >
                     ยกเลิก
                  </button>
                  <button
                     onClick={() => setToggleUpdateConfirm(true)}
                     className="btn btn--primary text-heading-5  px-9 py-2 text-[var(--white)] w-[112px] h-[45px]"
                  >
                     ยืนยัน
                  </button>
               </div>
            </div>
         </header>

         {/* Main Content */}
         <main className="relative w-[90%] max-w-[1440px] h-fit mx-10 my-14 py-10 px-6 box-border bg-[var(--white)] flex flex-col items-start gap-y-5  shadow-sm">
            {/* Category Name Input */}
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
                  value={promotionData.code}
                  onChange={(e) => {
                     setValidateName(false);
                     setPromotionData((data) => ({
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
                  value={promotionData.usage_limit}
                  onChange={(e) => {
                     setValidateName(false);
                     setPromotionData((data) => ({
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
                        checked={promotionData.discount_type === "fixed"}
                        onChange={(e) => {
                           const target = e.target as HTMLInputElement;
                           setPromotionData((data) => ({
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
                              !promotionData.discount_type
                                 ? ""
                                 : promotionData.discount_type === "fixed"
                                 ? promotionData.discount_value || ""
                                 : 0
                           }
                           disabled={promotionData.discount_type !== "fixed"}
                           onChange={(e) => {
                              const target = e.target as HTMLInputElement;
                              setPromotionData((data) => ({
                                 ...data,
                                 discount_value: Number(target.value),
                              }));
                           }}
                           className="ml-2 w-24  border  disabled:bg-gray-100 peer-checked/fixed:enabled:bg-blue-600  border-[var(--gray-300)] text-heading-5 text-[var(--gray-700)] px-3 py-2 rounded-[8px] focus:ring-2 focus:ring-blue-500"
                        />
                     </span>
                  </label>

                  {/* <!-- Percent --> */}
                  <label className="flex items-center gap-2 ">
                     <input
                        type="radio"
                        name="discountType"
                        value="percentage"
                        checked={promotionData.discount_type === "percentage"}
                        onChange={(e) => {
                           const target = e.target as HTMLInputElement;
                           setPromotionData((data) => ({
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
                              !promotionData.discount_type
                                 ? ""
                                 : promotionData.discount_type === "percentage"
                                 ? promotionData.discount_value || ""
                                 : 0
                           }
                           max="100"
                           disabled={
                              promotionData.discount_type !== "percentage"
                           }
                           onChange={(e) => {
                              const target = e.target as HTMLInputElement;
                              setPromotionData((data) => ({
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
                     promotionData.start_date
                        ? new Date(promotionData.start_date)
                             .toISOString()
                             .split("T")[0]
                        : ""
                  }
                  onChange={(e) => {
                     setValidateName(false);
                     const target = e.target as HTMLInputElement;
                     setPromotionData((data) => ({
                        ...data,
                        start_date: target.value
                           ? new Date(target.value)
                           : null,
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
                     promotionData.end_date
                        ? new Date(promotionData.end_date)
                             .toISOString()
                             .split("T")[0]
                        : ""
                  }
                  onChange={(e) => {
                     setValidateName(false);
                     const target = e.target as HTMLInputElement;
                     setPromotionData((data) => ({
                        ...data,
                        end_date: target.value ? new Date(target.value) : null,
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

            <hr className="text-[var(--gray-300)] w-full my-[40px]" />
            <div className="w-full space-x-[24px] flex ">
               <h1 className="text-heading-5 w-[205px] text-[var(--gray-700)]">
                  สร้างเมื่อ
               </h1>
               <p className={`text-body-1 text-black text-[16px]`}>
                  {promotionData.created_at
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
            <button
               onClick={() => setToggleDeleteConfirm(true)}
               className="btn absolute right-0 -bottom-[48px] h-[24px] w-fit text-[16px] text-[var(--gray-600)] hover:text-[var(--red)]"
            >
               <Trash2 className="h-4 w-4" />
               <p className="underline underline-offset-2">{actionDelete}</p>
            </button>
         </main>
      </div>
   );
}

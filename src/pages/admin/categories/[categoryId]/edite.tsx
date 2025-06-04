import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import ToggleSidebarComponent from "@/components/ToggleSidebarComponent";
import CategoryStyle from "@/components/serviceComponent/CategoryStyle";
import axios from "axios";

interface CategoryData {
   id: string;
   name: string;
   description: string;
   created_at: string;
   updated_at: string;
   color: string;
   order_num: number;
}

export default function CategoryForm() {
   // interface CategoryData {
   //    name: string;
   //    color: string;
   // }
   const router = useRouter();
   const categoryId = router.query.categoryId;

   // เก็บ data
   const [dataCatag, setDataCatag] = useState<CategoryData>({
      id: "",
      name: "",
      description: "",
      created_at: "",
      updated_at: "",
      color: "",
      order_num: 0,
   });
   console.log("dataCatag: ", dataCatag);
   // const [categoryName, setCategoryName] = useState("");
   // const [validateName, setValidateName] = useState(false);
   // const [categoryColor, setCategoryColor] = useState("");
   // const [validateColor, setValidateColor] = useState(false);

   // const categoryData: CategoryData = {
   //    name: categoryName,
   //    color: categoryColor,
   // };

   // const handleColor = (e: React.ChangeEvent<HTMLInputElement>) => {
   //    setValidateColor(false);
   //    setCategoryColor(e.target.value);
   // };

   // เมื่อกดสร้าง
   // const handleSave = async () => {
   //    // validate
   //    const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
   //    const validateCreateData = () => {
   //       let resultVlidate = null;
   //       if (!categoryName) {
   //          resultVlidate = "error";
   //          setValidateName(true);
   //       }
   //       if (!categoryColor || !hexColorRegex.test(categoryColor)) {
   //          resultVlidate = "error";
   //          setValidateColor(true);
   //       }
   //       return resultVlidate;
   //    };
   //    const checkData = validateCreateData();
   //    if (checkData === "error") {
   //       return null;
   //    }
   //    await axios.post(`/api/admin/category`, categoryData);
   //    // router.push("/admin/categories"); //หรือ router.back();
   // };

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

   const deleteCategory = () => {};

   useEffect(() => {
      const fetchCategory = async () => {
         console.log("categoryId: ", categoryId);
         const data = await axios.get(`/api/admin/category`, {
            params: { id: categoryId },
         });
         setDataCatag(data.data[0]);
      };
      fetchCategory();
   }, [categoryId]);

   return (
      <div className="min-h-screen bg-[var(--gray-100)]">
         {/* Header */}
         <header className="relative bg-[var(--white)] px-10 py-6 mb-14 h-auto box-border ">
            <ToggleSidebarComponent />
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

               <div className="flex items-center gap-x-6 ">
                  <button
                     onClick={() => router.back()}
                     className="btn btn--secondary text-heading-5  px-9 py-2 text-[var(--blue-600)] w-[112px] h-[45px]"
                  >
                     ยกเลิก
                  </button>
                  <button
                     // onClick={handleSave}
                     className="btn btn--primary text-heading-5  px-9 py-2 text-[var(--white)] w-[112px] h-[45px]"
                  >
                     ยืนยัน
                  </button>
               </div>
            </div>
         </header>

         {/* Main Content */}
         <main className="relative max-w-[1440px] h-fit mx-10 my-14 py-10 px-6 box-border bg-[var(--white)] flex flex-col items-start gap-y-5  shadow-sm">
            {/* Category Name Input */}
            <div className="w-full space-x-[24px] flex ">
               <h1 className="text-heading-5 w-[205px] text-[var(--gray-700)]">
                  ชื่อหมวดหมู่
               </h1>
               <p className={`text-body-1 text-black text-[16px]`}>
                  {dataCatag.name}
               </p>
            </div>

            <div className="w-full space-x-[24px] flex ">
               <h1 className="text-heading-5 w-[205px] text-[var(--gray-700)]">
                  สีหมวดหมู่
               </h1>
               <CategoryStyle
                  text={dataCatag.color}
                  color={dataCatag.color}
                  className="text-body-1 text-[16px]"
               />
            </div>
            <hr className="text-[var(--gray-300)] w-full my-[40px]" />
            <div className="w-full space-x-[24px] flex ">
               <h1 className="text-heading-5 w-[205px] text-[var(--gray-700)]">
                  ชื่อหมวดหมู่
               </h1>
               <p className={`text-body-1 text-black text-[16px]`}>
                  {dataCatag?.created_at
                     ? setDateTimeFormat(new Date(dataCatag.created_at))
                     : "N/A"}
               </p>
            </div>
            <div className="w-full space-x-[24px] flex ">
               <h1 className="text-heading-5 w-[205px] text-[var(--gray-700)]">
                  ชื่อหมวดหมู่
               </h1>
               <p className={`text-body-1 text-black text-[16px]`}>
                  {dataCatag?.created_at
                     ? setDateTimeFormat(new Date(dataCatag.updated_at))
                     : "N/A"}
               </p>
            </div>
            <button
               onClick={deleteCategory}
               className="btn absolute right-0 -bottom-[48px]  h-[24px] w-fit text-[16px] text-[var(--gray-600)]"
            >
               <FontAwesomeIcon
                  icon={faTrashCan}
                  className="mr-2 text-[18px]"
               />
               <p className="underline underline-offset-2">ลบหมวดหมู่</p>
            </button>
         </main>
      </div>
   );
}

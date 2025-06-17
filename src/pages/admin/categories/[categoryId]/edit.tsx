import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft } from "@fortawesome/free-solid-svg-icons";
import { Trash2 } from "lucide-react";
import ToggleSidebarComponent from "@/components/ToggleSidebarComponent";
import ReconfirmPage from "@/components/admin/ReconfirmPage";
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
   const [dataCatag, setDataCatag] = useState<CategoryData>({
      id: "",
      name: "",
      description: "",
      created_at: "",
      updated_at: "",
      color: "",
      order_num: 0,
   });
   // console.log("dataCatag: ", dataCatag);
   // const [categoryName, setCategoryName] = useState("");
   const [validateName, setValidateName] = useState(false);
   // const [categoryColor, setCategoryColor] = useState("");
   const [validateColor, setValidateColor] = useState(false);
   const [toggleUpdateConfirm, setToggleUpdateConfirm] = useState(false);
   const [toggleDeleteConfirm, setToggleDeleteConfirm] = useState(false);

   const actionUpdate = "แก้ไขหมวดหมู่";
   const actionDelete = "ลบหมวดหมู่";
   const titleUpdate = `ยืนยันการ${actionUpdate}`;
   const titleDelete = `ยืนยันการ${actionDelete}`;
   const handleName = (e: React.ChangeEvent<HTMLInputElement>) => {
      setValidateName(false);
      setDataCatag((data) => ({
         ...data,
         name: e.target.value,
      }));
   };

   const handleColor = (e: React.ChangeEvent<HTMLInputElement>) => {
      setValidateColor(false);
      setDataCatag((data) => ({
         ...data,
         color: e.target.value,
      }));
   };

   // เมื่อกด Update Data หข้อมูล
   const handleUpdate = async () => {
      // validate
      const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
      const validateCreateData = () => {
         let resultVlidate = null;
         if (!dataCatag.name) {
            resultVlidate = "error";
            setValidateName(true);
         }
         if (!dataCatag.color || !hexColorRegex.test(dataCatag.color)) {
            resultVlidate = "error";
            setValidateColor(true);
         }
         return resultVlidate;
      };
      const checkData = validateCreateData();
      if (checkData === "error") {
         return null;
      }

      const categoryData = {
         id: dataCatag.id,
         name: dataCatag.name,
         color: dataCatag.color,
      };
      console.log("categoryData: ", categoryData);
      alert("update data complete");
      await axios.put(`/api/admin/category`, categoryData);
      router.push("/admin/categories"); //หรือ router.back();
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
      if (!dataCatag.id) {
         alert("ไม่มี id ขออภัย");
         return null;
      }
      const { data } = await axios.delete(`/api/admin/category`, {
         params: {
            id: dataCatag.id,
         },
      });
      console.log("data: ", data);
      if (data.error) {
         console.log(data.error);
      }
      alert("delete data complete");
      router.push("/admin/categories"); //หรือ router.back();
   };

   // ดึงข้อมูลจาก database
   useEffect(() => {
      const fetchCategory = async () => {
         console.log("categoryId: ", categoryId);
         const data = await axios.get(`/api/admin/category`, {
            params: { id: categoryId },
         });
         // setResetData(data.data[0]);
         setDataCatag(data.data[0]);
      };
      fetchCategory();
   }, [categoryId]);

   return (
      <div className="min-h-screen w-full bg-[var(--gray-100)] flex flex-col items-center w-100vw">
         {/* Header */}
         {/* ReconfirmPage การ update */}
         <ReconfirmPage
            title={titleUpdate}
            subTitle={dataCatag.name}
            action={actionUpdate}
            toggle={toggleUpdateConfirm}
            setTaggle={setToggleUpdateConfirm}
            actionFunction={() => handleUpdate()}
         />
         {/* ReconfirmPage การ delete */}
         <ReconfirmPage
            title={titleDelete}
            subTitle={dataCatag.name}
            action={actionDelete}
            toggle={toggleDeleteConfirm}
            setTaggle={setToggleDeleteConfirm}
            actionFunction={() => handleDelete()}
         />
         <ToggleSidebarComponent />
         <header className="relative bg-[var(--white)] px-10 py-6 mb-14 h-auto w-full flex justify-center box-border ">
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
            <div className="w-full space-x-[24px] flex ">
               <h1 className="text-heading-5 w-[205px] text-[var(--gray-700)]">
                  ชื่อหมวดหมู่
               </h1>
               <input
                  id="categoryName"
                  value={dataCatag.name}
                  onChange={handleName}
                  className={`${
                     validateName
                        ? "border-2 border-red-500"
                        : "border border-[var(--gray-300)]"
                  } w-[40%] text-heading-5 text-black px-3 py-2 rounded-[8px] focus:ring-2 focus:ring-blue-500 `}
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

            <div className="w-full space-x-[24px] flex ">
               <h1 className="text-heading-5 w-[205px] text-[var(--gray-700)]">
                  สีหมวดหมู่
               </h1>
               <div className="relative w-[40%] flex gap-x-2">
                  <input
                     type="text"
                     value={dataCatag.color}
                     onChange={handleColor}
                     className={`${
                        validateColor
                           ? "border-2 border-red-500"
                           : "border border-[var(--gray-300)]"
                     } w-full text-heading-5 text-[var(--gray-700)] px-3 py-2  rounded-[8px] focus:ring-2 focus:ring-blue-500 `}
                     placeholder="ใส่ค่าสี hex #000000"
                  />
                  <input
                     id="changeColor"
                     type="color"
                     value={dataCatag.color}
                     onChange={handleColor}
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
            <hr className="text-[var(--gray-300)] w-full my-[40px]" />
            <div className="w-full space-x-[24px] flex ">
               <h1 className="text-heading-5 w-[205px] text-[var(--gray-700)]">
                  สร้างเมื่อ
               </h1>
               <p className={`text-body-1 text-black text-[16px]`}>
                  {dataCatag?.created_at
                     ? setDateTimeFormat(new Date(dataCatag.created_at))
                     : "N/A"}
               </p>
            </div>
            <div className="w-full space-x-[24px] flex ">
               <h1 className="text-heading-5 w-[205px] text-[var(--gray-700)]">
                  แก้ไขล่าสุด
               </h1>
               <p className={`text-body-1 text-black text-[16px]`}>
                  {dataCatag?.created_at
                     ? setDateTimeFormat(new Date(dataCatag.updated_at))
                     : "N/A"}
               </p>
            </div>
            <button
               onClick={() => setToggleDeleteConfirm(true)}
               className="btn absolute right-0 -bottom-[48px]  h-[24px] w-fit text-[16px] text-[var(--gray-600)] hover:text-[var(--red)]"
            >
               <Trash2 className="h-4 w-4" />
               <p className="underline underline-offset-2">{actionDelete}</p>
            </button>
         </main>
      </div>
   );
}

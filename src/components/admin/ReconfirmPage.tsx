import React, { useRef, useEffect, Dispatch, SetStateAction } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleExclamation } from "@fortawesome/free-solid-svg-icons";

interface propVarible {
   title: string;
   subTitle: string;
   action: string;
   toggle: boolean;
   setTaggle: Dispatch<SetStateAction<boolean>>;
   actionFunction: () => void;
}
/* 
-นำไปไว้ในลำดับแรกของ component
-เงื่อนไข ต้องสร้าง useState เก็บ booleen ในไฟล์ที่เรัยกใช้ component

 title, หัวข้อใหญ่
   subTitle, หัวข้อย่อย
   action, ต้องการให้ปุ่มแสดงข้อควสามอะไร
   toggle, ต่า booleen useState
   setTaggle, set booleen useState
   actionFunction, เมื่อกดปุ่มต้องการให้ทำอะไร
*/
function ReconfirmPage({
   title,
   subTitle,
   action,
   toggle,
   setTaggle,
   actionFunction,
}: propVarible) {
   const togglePage = () => {
      setTaggle(false);
   };

   const boxRef = useRef<HTMLDivElement>(null); // สำหรับตรวจว่าคลิกนอกกล่องไหม

   // ตรวจจับการคลิกนอกกล่อง

   useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
         if (boxRef.current && !boxRef.current.contains(event.target as Node)) {
            setTaggle(false); // ถ้าคลิกนอกกล่อง input + box ให้ซ่อน
         }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
         document.removeEventListener("mousedown", handleClickOutside);
   }, [setTaggle]);

   return (
      <div
         className={`${
            toggle ? "flex" : "hidden"
         } z-200 fixed left-0 top-0 w-[100%] h-[100vh] bg-[#00000034]  items-center justify-center `}
      >
         <div
            ref={boxRef}
            className={`relative w-[360px] h-[270px] py-[36px] px-[36px] gap-2 bg-[var(--white)] flex flex-col items-center justify-center box-border rounded-[16px]`}
         >
            <div className="absolute right-0 top-0 w-[48px] h-[48px] flex items-center justify-center ">
               <button
                  className="btn text-[var(--gray-600)] text-[13px]"
                  onClick={togglePage}
               >
                  X
               </button>
            </div>
            <h1 className="text-[30px] text-[var(--red)]">
               <FontAwesomeIcon icon={faCircleExclamation} />
            </h1>
            <h1 className="text-heading-2 text-[var(--gray-950)] text-[20px]">
               {title}?
            </h1>
            <p className="text-body-2 h-fit w-full mb-6 overflow-visible text-clip text-[var(--gray-700)] text-center">
               คุณต้องการ{action} ‘{subTitle}’ ใช่หรือไม่
            </p>
            <div className="flex gap-4">
               <button
                  className="btn btn--primary  w-[112px] h-[44px]"
                  onClick={() => actionFunction()}
               >
                  {action}
               </button>
               <button
                  className="btn bg-white  border border-[var(--blue-600)] text-[var(--blue-600)]  w-[112px] h-[44px]"
                  onClick={togglePage}
               >
                  ยกเลิก
               </button>
            </div>
         </div>
      </div>
   );
}

export default ReconfirmPage;

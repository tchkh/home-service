import React, { Dispatch, SetStateAction } from "react";
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

   return (
      <div
         className={`${
            toggle ? "flex" : "hidden"
         } z-50 fixed w-[100%] h-[100vh] bg-[#00000034]  items-center justify-center `}
      >
         <section
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
         </section>
      </div>
   );
}

export default ReconfirmPage;

import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingServiceCard() {
   // max-w-[350px] max-h-[365px]  md:my-[48px] md:mx-[37px]my-6 mx-4
   return (
      <div
         className={`w-[90vw] md:w-[20vw]  max-w-[350px] h-[365px] rounded-[8px] flex flex-col justify-start bg-[var(--white)] shadow-sm `}
      >
         <Skeleton
            className={`w-full h-1/2 min-h-[80px] max-h-[200px] max-w-[500px] overflow-hidden mb-2 bg-[var(--gray-400)]`}
         />
         <div className="m-4  gap-y-2 flex flex-col justify-start ">
            <Skeleton
               className={`bg-[var(--gray-200)] rounded-[8px] grid place-items-center w-[50px] h-[26px] font-medium text-body-4`}
            ></Skeleton>

            <Skeleton className="mr-2 h-[20px] w-[80px] bg-[var(--gray-200)]"></Skeleton>

            <Skeleton
               className={`flex items-center h-[14px] ] mb-2 bg-[var(--gray-200)] overflow-hidden `}
            ></Skeleton>
         </div>
         <Skeleton className="mx-4 mb-[18px] w-[90px] h-[24px] bg-[var(--gray-200)]" />
      </div>
   );
}

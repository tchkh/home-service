import { useSidebar } from "@/contexts/SidebarContext";
import { Button } from "@/components/ui/button";

export default function ToggleSidebarComponent() {
   const { isSidebarOpen, toggleSidebar } = useSidebar();

   return (
      <Button
         type="button"
         onClick={toggleSidebar}
         // absolute z-100 top-7 -left-4
         className={`hidden md:flex  fixed top-7 ${
            isSidebarOpen ? "left-[224px]" : "-left-4"
         }  z-100  w-9 h-9 bg-[var(--blue-950)] hover:bg-[var(--blue-800)] active:bg-[var(--blue-900)] border-1 border-[var(--white)] shadow-[0_0_0_1px_var(--white)] rounded-full cursor-pointer `}
      >
         {isSidebarOpen ? (
            <svg
               xmlns="http://www.w3.org/2000/svg"
               width="24"
               height="24"
               viewBox="0 0 30 24"
               fill="none"
               stroke="var(--white)"
               strokeWidth="4"
               strokeLinecap="round"
               strokeLinejoin="round"
               className="lucide lucide-chevron-left-icon lucide-chevron-left"
            >
               <path d="m15 18-6-6 6-6" />
            </svg>
         ) : (
            <>
               <span>&quot;</span>
               <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 26 24"
                  fill="none"
                  stroke="var(--white)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-chevron-right-icon lucide-chevron-right"
               >
                  <path d="m9 18 6-6-6-6" />
               </svg>
            </>
         )}
      </Button>
   );
}

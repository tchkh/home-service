import { Menu } from "lucide-react";
import Image from "next/image";
import { useSidebar } from "@/contexts/SidebarContext";

function MobileHeader({ serviceRequestCount = 3 }) {
  const { toggleSidebar } = useSidebar();

  return (
    <div className="md:hidden bg-[var(--blue-950)] text-[var(--white)] px-4 py-3 flex items-center justify-between fixed top-0 left-0 right-0 z-40 w-full">
      <div className="flex justify-center items-center text-center conte py-2 px-3 rounded-lg bg-[var(--blue-100)]">
        <Image
          src="/asset/svgs/houseLogo.svg"
          width={32}
          height={32}
          alt="house icon"
          className="md:w-[32px] md:h-[32px]"
        />
        <span className="text-[var(--blue-600)] font-semibold text-lg">
          HomeServices
        </span>
      </div>

      <button
        onClick={toggleSidebar}
        className="p-2 hover:bg-blue-800 rounded-lg transition-colors relative cursor-pointer"
      >
        <Menu className="w-6 h-6" />
        {/* Notification Badge */}
        {serviceRequestCount > 0 && (
          <div className="absolute -top-1 -right-1 bg-red-500 text-[var(--white)] text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
            {serviceRequestCount > 99 ? "99+" : serviceRequestCount}
          </div>
        )}
      </button>
    </div>
  );
}

export default MobileHeader
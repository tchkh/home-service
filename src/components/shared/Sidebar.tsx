import React, { useEffect, useState } from "react";
import axios from "axios";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/contexts/SidebarContext";
import { useRouter } from "next/router";
import House from "../../../public/asset/svgs/houseLogo.svg";
import Logout from "../../../public/asset/svgs/logout.svg";
import { SidebarItemProps, SidebarProps } from "@/types";
import { useServiceRequestStore } from "@/utils/useServiceRequestStore";
import toast from "react-hot-toast";

const SidebarItem: React.FC<SidebarItemProps> = ({
  icon: Icon,
  label,
  href,
  onClick,
  count,
}) => {
  const router = useRouter();
  const isActive = router.pathname.startsWith(href);

  return (
    <a
      href={href}
      onClick={() => onClick && onClick()}
      className={cn(
        "flex items-center gap-4 px-7 py-4 my-0.25 text-md transition-colors relative",
        isActive
          ? "bg-[var(--blue-900)] text-[var(--white)] hover:bg-[var(--blue-800)] font-medium"
          : "text-white bg-[var(--blue-950)] hover:bg-[var(--blue-800)]"
      )}
    >
      <Icon className="h-5 w-5" />
      <span>{label}</span>
      {count !== undefined && count > 0 && (
        <div className="absolute right-4 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
          {count > 99 ? "99+" : count}
        </div>
      )}
    </a>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ className, items }) => {
  const {
    isSidebarOpen,
    isMobileSidebarClose,
    toggleMobileSidebar,
  } = useSidebar();
  const { serviceRequestCount } = useServiceRequestStore();
  const router = useRouter();

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = async () => {
    try {
      const res = await axios.post("/api/auth/logout");
      if (res.status === 200) {
        toast.success("ออกจากระบบสำเร็จ!", {
          duration: 2000,
        });
        // รอให้ toast แสดงแล้วค่อย redirect
        setTimeout(() => {
          if (router.pathname.startsWith("/technician")) {
            window.location.href = "/technician/login";
          } else if (router.pathname.startsWith("/admin")) {
            window.location.href = "/admin/login";
          } else {
            window.location.href = "/login";
          }
        }, 1500);
      }
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("เกิดข้อผิดพลาดในการออกจากระบบ");
    }
  };

  const isOpen = isMobile ? isMobileSidebarClose : isSidebarOpen;

  return (
    <div
      className={cn(
        "fixed top-0 h-screen w-60 max-w-60 flex flex-col transition-transform duration-300 ease-in-out z-50",
        isMobile ? "right-0" : "left-0",
        "bg-[var(--blue-950)]",
        className,
        isOpen ? "translate-x-0" : "translate-x-full md:-translate-x-full"
      )}
    >
      <div className="px-6 pt-6 hidden md:inline">
        <div className="flex justify-center items-center gap-2 py-2 px-2 bg-[var(--blue-100)] rounded-lg">
          <div className="rounded bg-[var(--blue-100)]">
            <svg width="24" height="24">
              <House />
            </svg>
          </div>
          <span className="text-[var(--blue-600)] text-heading-3">
            HomeServices
          </span>
        </div>
      </div>

      {isMobile && (
        <button
          className="text-[var(--blue-600)] text-heading-3 md:hidden justify-start flex mx-3 my-5 cursor-pointer"
          onClick={toggleMobileSidebar}
        >
          ✕
        </button>
      )}

      <div className="flex flex-col md:mt-10 flex-1">
        {items.map((item) => {
          const count =
            item.label === "คำขอบริการซ่อม" ? serviceRequestCount : undefined;
          return <SidebarItem key={item.label} {...item} count={count} />;
        })}
      </div>

      <div className="py-4">
        <SidebarItem
          icon={Logout}
          label="ออกจากระบบ"
          href="#"
          onClick={handleLogout}
        />
      </div>
    </div>
  );
};

export default Sidebar;

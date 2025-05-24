import React from "react";
import axios from "axios";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/contexts/SidebarContext"; // Import the hook
import { useRouter } from "next/router";
import House from "../../../public/asset/svgs/houseLogo.svg"
import Logout from "../../../public/asset/svgs/logout.svg"
import { SidebarItemProps, SidebarProps } from "@/types";

const SidebarItem: React.FC<SidebarItemProps> = ({
  icon: Icon,
  label,
  href,
  onClick,
}) => {
  const router = useRouter();
  const isActive = router.pathname.startsWith(href);

  return (
    <a
      href={href}
      onClick={() => onClick && onClick()}
      className={cn(
        "flex items-center gap-4 px-7 py-4 my-0.25 text-md transition-colors",
        isActive
          ? "bg-[var(--blue-900)] text-[var(--white)] hover:bg-[var(--blue-800)] font-medium"
          : "text-white bg-[var(--blue-950)] hover:bg-[var(--blue-800)]"
      )}
    >
      <Icon className="h-5 w-5" />
      <span>{label}</span>
    </a>
  );
};

const handleLogout = async () => {
  try {
    const res = await axios.post("/api/auth/logout");
    if (res.status === 200) {
      window.location.href = "/admin/login";
    }
  } catch (error) {
    console.error("Error logging out:", error);
  }
};

const Sidebar: React.FC<SidebarProps> = ({ className, items }) => {
  const { isSidebarOpen } = useSidebar();

  return (
    <div
      className={cn(
        "fixed top-0 bg-[var(--blue-950)] h-screen w-60 max-w-60 flex flex-col transition-transform duration-300 ease-in-out",
        className,
        isSidebarOpen ? "translate-x-0" : "-translate-x-full" // Control visibility with transform
      )}
    >
      <div className="px-6 pt-8">
        <div className="flex justify-center items-center gap-2 py-2 px-2 bg-[var(--blue-100)] rounded-lg">
          <div className="rounded bg-[var(--blue-100)]">
            <svg width="24" height="24">
              <House />
            </svg>
          </div>
          <span className="text-[var(--blue-600)] text-heading-3">HomeServices</span>
        </div>
      </div>

      <div className="flex flex-col mt-10 flex-1">
        {items.map((item) => (
          <SidebarItem key={item.label} {...item} />
        ))}
      </div>

      <div className="py-4">
        <SidebarItem icon={Logout} label="ออกจากระบบ" href="#" onClick={handleLogout} />
      </div>
    </div>
  );
};

export default Sidebar;
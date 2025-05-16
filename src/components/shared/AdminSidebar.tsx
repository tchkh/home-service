import React from "react";
import { 
  Home, 
  Users, 
  FileText, 
  LogOut 
} from "lucide-react";
import axios from "axios";
import { cn } from "@/lib/utils";

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  href?: string;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
}
const SidebarItem: React.FC<SidebarItemProps> = ({ 
  icon: Icon, 
  label, 
  active = false,
  href = "#",
  onClick
}) => {
  return (
    <a
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-4 py-3 text-sm transition-colors",
        active 
          ? "bg-[var(--blue-900)] text-[var(--white)] hover:bg-[var(--blue-800)] font-medium" 
          : "text-white bg-[var(--blue-950)] hover:bg-[var(--blue-800)]"
      )}
    >
      <Icon className="h-5 w-5" />
      <span>{label}</span>
    </a>
  );
};

interface SidebarProps {
  className?: string;
}

const handleLogout = async() => {
  try {
  const res = await axios.post("/api/auth/logout");
    if (res.status === 200) {
      window.location.href = "/";
    }
  } catch (error) {
    console.error("Error logging out:", error);
  }
}

const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  return (
    <div className={cn("bg-[var(--blue-950)] h-screen w-1/5 max-w-60 flex flex-col", className)}>
      <div className="p-4">
        <div className="flex justify-center items-center gap-2 py-3 px-4 bg-[var(--blue-100)] rounded-md">
          <div className="p-1 rounded bg-[var(--blue-100)]">
            <Home className="h-5 w-5 text-blue-600" />
          </div>
          <span className="text-[var(--blue-600)] text-sm">HomeServices</span>
        </div>
      </div>
      
      <div className="flex flex-col mt-6 flex-1">
        <SidebarItem icon={Home} label="หน้าหลัก" />
        <SidebarItem icon={Users} label="บริการ" active />
        <SidebarItem icon={FileText} label="Promotion Code" />
      </div>
      
      <div className="p-4 mt-auto">
        <SidebarItem icon={LogOut} label="ออกจากระบบ" onClick={handleLogout} />
      </div>
    </div>
  );
};

export default Sidebar;
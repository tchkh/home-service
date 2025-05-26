import { SidebarContextValue, SidebarProviderProps } from "@/types";
import React, {
  createContext,
  useState,
  useContext,
  useEffect,
} from "react";

// สร้าง Context Object
const SidebarContext = createContext<SidebarContextValue | undefined>(
  undefined
);

// สร้าง Custom Hook สำหรับใช้งาน Context
export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

const SIDEBAR_OPEN_KEY = "sidebarOpen";

// สร้าง Context Provider Component
export const SidebarProvider: React.FC<SidebarProviderProps> = ({
  children,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
    
  useEffect(() => {
    const storedValue = localStorage.getItem(SIDEBAR_OPEN_KEY);
    if (storedValue) {
      setIsSidebarOpen(JSON.parse(storedValue));
    }
  }, []);

  useEffect(() => {
    // บันทึกค่าลง localStorage ทุกครั้งที่ isSidebarOpen เปลี่ยน
    localStorage.setItem(SIDEBAR_OPEN_KEY, JSON.stringify(isSidebarOpen));
  }, [isSidebarOpen]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
    console.log("isSidebarOpen:", isSidebarOpen);
  };

  const openSidebar = () => {
    setIsSidebarOpen(true);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  // กำหนด Value ที่จะส่งผ่าน Context
  const value: SidebarContextValue = {
    isSidebarOpen,
    toggleSidebar,
    openSidebar,
    closeSidebar,
  };

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  );
};

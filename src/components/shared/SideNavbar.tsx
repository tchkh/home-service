import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { UserRound, ClipboardList, History } from "lucide-react";

export default function SideNavbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [activeButton, setActiveButton] = useState<string | null>(null);

  type MenuItem = {
    id: string;
    label: string[];
    icon: React.ElementType;
    route: string;
  };

  const menuItems: MenuItem[] = [
    {
      id: "user-info",
      label: ["ข้อมูล", "ผู้ใช้งาน"],
      icon: UserRound,
      route: "/user/profile",
    },
    {
      id: "repair-orders",
      label: ["รายการ", "คำสั่งซ่อม"],
      icon: ClipboardList,
      route: "/user/repair",
    },
    {
      id: "repair-history",
      label: ["ประวัติ", "การซ่อม"],
      icon: History,
      route: "/user/history",
    },
  ];

  // ตรวจสอบ path ปัจจุบันเพื่อกำหนด active button
  useEffect(() => {
    const currentItem = menuItems.find((item) => item.route === pathname);
    if (currentItem) {
      setActiveButton(currentItem.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const handleButtonClick = (item: MenuItem) => {
    // ถ้าคลิกปุ่มที่ active อยู่แล้ว ให้ return ไม่ทำอะไร
    if (activeButton === item.id) {
      return;
    }
    setActiveButton(item.id);
    router.push(item.route);
  };

  return (
    <div className="sticky top-13 z-10 shadow-md bg-[#F3F4F6] md:bg-transparent md:shadow-none">
      <div className="sticky md:top-25 h-fit z-10 mx-5 bg-[var(--white)] my-2 md:my-0 rounded-[8px]">
        <div
          className="px-4 py-2 border-1 border-[var(--gray-300)] rounded-[8px] flex flex-col gap-3
                  md:w-[253px] md:h-[253px] md:px-6 md:py-6 md:gap-6 md:shadow-lg"
        >
          <h1 className="content-center text-left text-[18px] text-[var(--gray-700)] md:text-[20px]">
            บัญชีผู้ใช้
          </h1>
          <hr className="text-[var(--gray-300)]" />
          <div className="grid grid-cols-3 gap-4 md:grid md:grid-cols-1 md:gap-6">
            {menuItems.map((item) => (
              <div key={item.id} className="flex flex-row gap-2 items-center">
                <item.icon
                  className={`w-6 h-6 ${
                    activeButton === item.id
                      ? "text-[var(--blue-700)]"
                      : "text-[var(--gray-500)] hover:text-[var(--blue-500)] cursor-pointer"
                  }`}
                />
                <button
                  onClick={() => handleButtonClick(item)}
                  disabled={activeButton === item.id}
                  className={`text-[14px] content-center md:text-[16px] transition-colors duration-200 text-start ${
                    activeButton === item.id
                      ? "text-[var(--blue-700)]"
                      : "text-[var(--gray-950)] hover:text-[var(--blue-500)] cursor-pointer"
                  }`}
                >
                  <span className="block md:hidden leading-tight">
                    {item.label.map((word, index) => (
                      <span key={index} className="block">
                        {word}
                      </span>
                    ))}
                  </span>
                  <span className="hidden md:block">{item.label}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

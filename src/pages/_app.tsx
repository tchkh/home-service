import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import Sidebar from "@/components/shared/Sidebar";
import Category from "../../public/asset/svgs/category.svg";
import Files from "../../public/asset/svgs/files.svg";
import Promo_code from "../../public/asset/svgs/promo-code.svg"
import Notification_regular from "../../public/asset/svgs/notification-regular.svg"
import List from "../../public/asset/svgs/list.svg";
import History from "../../public/asset/svgs/history.svg";
import Account from "../../public/asset/svgs/account.svg";
import { SidebarProvider, useSidebar } from "@/contexts/SidebarContext";
import { Prompt } from "next/font/google";
import { UserProvider } from "@/contexts/UserContext";
import 'leaflet/dist/leaflet.css';
import { AppContentProps, AppProvidersProps, SidebarItem } from "@/types";

const prompt = Prompt({
  subsets: ["latin", "thai"],
  weight: ["300", "400", "500", "600"],
});

const navbarPages = ["/login", "/register", "/serviceList"];
const footerPages = ["/", "/serviceList"];

const adminSidebarItems: SidebarItem[] = [
  {
    label: "หมวดหมู่",
    icon: Category,
    href: "/admin/categories",
  },
  {
    label: "บริการ",
    icon: Files,
    href: "/admin/services/service",
  },
  {
    label: "Promotion Code",
    icon: Promo_code,
    href: "/admin/promo-codes",
  },
];

const technicianSidebarItems: SidebarItem[] = [
  {
    label: "คำขอบริการซ่อม",
    icon: Notification_regular,
    href: "/technician/service-request",
  },
  {
    label: "รายการที่รอดำเนินการ",
    icon: List,
    href: "/technician/pending",
  },
  {
    label: "ประวัติการซ่อม",
    icon: History,
    href: "/technician/history",
  },
  {
    label: "ตั้งค่าบัญชีผู้ใช้",
    icon: Account,
    href: "/technician/account-settings",
  },
];

// Component ย่อยที่ใช้ Context
function AppContent({ Component, pageProps, router }: AppContentProps) {
  const { isSidebarOpen } = useSidebar();

  const showAdminSidebar = router.pathname.startsWith("/admin") && router.pathname !== "/admin/login";
  const showTechnicianSidebar = router.pathname.startsWith("/technician") && router.pathname !== "/technician/login";

  const contentMarginClass =
  (showAdminSidebar || showTechnicianSidebar) && isSidebarOpen ? "md:ml-60" : "ml-0";
  
  const showNavbar = navbarPages.includes(router.pathname);
  const showFooter = footerPages.includes(router.pathname);

  return (
    <main
      className={`${prompt.className} min-h-screen w-full max-w-[100%]`}
    >
      {showNavbar && <Navbar />}
      {showAdminSidebar && <Sidebar items={adminSidebarItems} />}
      {showTechnicianSidebar && <Sidebar items={technicianSidebarItems} />}
      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${contentMarginClass}`}
      >
        <Component {...pageProps} />
      </div>
      {showFooter && <Footer />}
    </main>
  );
}

function AppProviders({ children }: AppProvidersProps) {
  return (
    <UserProvider>
      <SidebarProvider>
        {children}
      </SidebarProvider>
    </UserProvider>
  );
}

export default function App({ Component, pageProps, router }: AppProps) {
  return (
    <AppProviders>
      <AppContent Component={Component} pageProps={pageProps} router={router} />
    </AppProviders>
  );
}

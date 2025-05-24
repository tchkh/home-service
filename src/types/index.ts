import { ReactNode } from 'react';
import { NextRouter } from 'next/router';

// App
export interface AppContentProps {
  Component: React.ComponentType<unknown>;
  pageProps: Record<string, unknown>;
  router: NextRouter;
}

// User interfaces
export interface User {
  id: number
  first_name: string
  last_name: string
  email: string
  tel: string
  image_url?: string
  created_at: string
  updated_at: string
}

// Admin interfaces
export interface Admin {
  id: number
  first_name: string
  last_name: string
  email: string
}

// service P'nut
export interface SubService {
  id?: number
  title: string
  price: string
  service_unit: string
}

export interface ServiceFormValues {
  title: string
  category: string
  image: string
  subervices: SubService[]
  created_at: string
  updated_at: string
}

// sidebar
export interface SidebarItem {
  label: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  href: string
}

export interface SidebarContextValue {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  openSidebar: () => void;
  closeSidebar: () => void;
}

export interface SidebarProviderProps {
  children: ReactNode;
}

export interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  href: string; // กำหนดให้ href เป็น required
  onClick?: () => void;
  className?: string
}

export interface SidebarProps {
  className?: string;
  items: SidebarItemProps[]; // รับ array ของ SidebarItemProps
}
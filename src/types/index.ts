import { ReactNode } from 'react';
import { NextRouter } from 'next/router';

// App
export interface AppContentProps {
  Component: React.ComponentType<unknown>;
  pageProps: Record<string, unknown>;
  router: NextRouter;
}

export interface AppProvidersProps {
  children: React.ReactNode;
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

export interface Service {
  id: string;
  title: string;
  category_id: number;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  order_num: number;
};

// service P'nut
export interface SubService {
  id?: number
  title: string
  price: string
  service_unit: string
}

export interface ServiceWithCategory extends Service {
  category_name: string;
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
  serviceRequestCount: number;
  setServiceRequestCount: (count: number) => void;
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
  count?: number;
}

export interface SidebarProps {
  className?: string;
  items: SidebarItemProps[]; // รับ array ของ SidebarItemProps
}

// service-request
export interface ServiceRequest {
  id: string;
  user_id: string;
  full_address: string;
  latitude: number;
  longitude: number;
  appointment_at: string;
  service: {
    name: string;
    sub_service: string;
    price: number;
    unit: string;
  };
}

export interface ServiceRequestNearby {
  id: string;
  user_id: string;
  full_address: string;
  address: string;
  province: string;
  sub_district: string;
  additional_info: string;
  latitude: number;
  longitude: number;
  total_price: number;
  appointment_at: string;
  service_title?: string;
  sub_service_title?: string;
  sub_service_price?: number;
  service_unit?: string;
}

export interface ServiceRequestCardProps {
  data: ServiceRequest;
  technicianLocation: { latitude: number; longitude: number; };
  straightDistance: number;
  onJobActionComplete: () => void; 
}

export interface MapProps {
  data: ServiceRequest;
  technicianLocation: { latitude: number; longitude: number; };
  straightDistance: number;
}

export interface Technician {
  id: string;
  name: string;
  email: string;
  latitude: number;
  longitude: number;
  address: string;
}

export interface CustomerRequest {
  id: string;
  user_id: string;
  full_address: string;
  address: string;
  province: string;
  sub_district: string;
  additional_info: string;
  latitude: number;
  longitude: number;
  total_price: number;
  appointment_at: string;
  service: {
    name: string;
    sub_service: string;
    price: number;
    unit: string;
  };
}
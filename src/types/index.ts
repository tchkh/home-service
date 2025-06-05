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
  sub_services: SubService[]
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

export interface MapPopupProps {
  isOpen: boolean;
  onClose: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  technicianLocation: any;
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

export interface TechnicianServiceSettings {
  id: string;
  is_active: boolean;
  services: {
    id: number;
    title: string;
  };
}

export interface AllServices {
  id: string;
  title: string;
}

export interface TechnicianData {
  id: string;
  first_name: string;
  last_name: string;
  tel: string;
  address: string;
  status: string;
  services_active: {
    service_id: number;
    is_active: boolean;
  }[];
  technician_services: TechnicianService[];
}

export interface ExtendedTechnicianData extends TechnicianData {
  techData: TechnicianData[];
  techServicesData: TechnicianServiceSettings[];
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

export interface Job {
  id: string;
  category: string;
  service: string;
  sub_service: string;
  appointment_at: string;
  address: string;
  total_price: number;
  first_name: string;
  last_name: string;
  tel: string;
}

export interface JobsTableProps {
  jobs: Job[];
  loading: boolean;
  hasJobs: boolean;
  message?: string;
  onActionClick?: (jobId: string) => void;
}

export interface JobDetail {
  id: string;
  user_id: string;
  category: string;
  category_color: string;
  service: string;
  sub_service: string;
  appointment_at: string;
  full_address: string;
  latitude: number;
  longitude: number;
  total_price: number;
  first_name: string;
  last_name: string;
  tel: string;
  accepted_at: string;
  service_id: number;
  status?: string;
  notes?: string;
  created_at?: string;
  technician_latitude: number;
  technician_longitude: number;
}

export interface TechnicianPendingProps {
  initialData: {
    services: Array<{ service_id: number; service_title: string }>;
    jobs: Array<{
      id: string;
      category: string;
      service: string;
      sub_service: string;
      appointment_at: string;
      address: string;
      total_price: number;
      first_name: string;
      last_name: string;
      tel: string;
    }>;
    technician: {
      id: string;
      name: string;
      email: string;
    };
    message?: string;
    hasJobs: boolean;
  };
}

export interface TechnicianHistoryProps {
  initialData: {
    services: Array<{ service_id: number; service_title: string }>;
    jobs: Array<{
      id: string;
      category: string;
      service: string;
      sub_service: string;
      appointment_at: string;
      address: string;
      total_price: number;
      first_name: string;
      last_name: string;
      tel: string;
      // review
      // comment
    }>;
    technician: {
      id: string;
      name: string;
      email: string;
    };
    message?: string;
    hasJobs: boolean;
  };
}

export interface JobHistoryDetailResponse {
  id: string;
  user_id: string;
  category: string;
  category_color: string;
  service: string;
  sub_service: string;
  appointment_at: string;
  full_address: string;
  latitude: number;
  longitude: number;
  total_price: number;
  first_name: string;
  last_name: string;
  tel: string;
  accepted_at: string;
  service_id: number;
  technician_latitude: number;
  technician_longitude: number;
  // เพิ่ม review and comment
}

export interface CompletedJob {
  id: string;
  user_id: string;
  category: string;
  service: string;
  sub_service: string;
  appointment_at: string;
  address: string;
  latitude: number;
  longitude: number;
  total_price: number;
  first_name: string;
  last_name: string;
  tel: string;
  service_id: number;
}

export interface TechnicianService {
  service_id: number;
  service_title: string;
}

export interface CompletedJobsResponse {
  services: TechnicianService[];
  jobs: CompletedJob[];
  technician: {
    id: string;
    name: string;
    email: string;
  };
  message?: string;
  hasJobs: boolean;
}
export interface ServiceDetail {
  id: number
  title: string
  price: number
  unit: string
  service_id: number
  service_title: string
}

export interface ServiceItem extends ServiceDetail {
  quantity: number
}

export interface CustomerInfo {
  name: string
  phone: string
  address: string
  date: string
  time: string
}

export interface PaymentInfo {
  method: string
  cardNumber?: string
  // other payment fields
}

export interface ServiceRequest {
  id?: number
  user_id: string
  sub_service_id: number
  address: string
  province: string
  district: string
  sub_district: string
  additional_info?: string | null
  latitude?: number | null
  longitude?: number | null
  appointment_at: string
  total_price: number
  quantity?: number
  payment_intent_id?: string | null
  payment_status?: string
  created_at?: string
  updated_at?: string
}

// Type for insert operations
export type ServiceRequestInsert = Omit<
  ServiceRequest,
  'id' | 'created_at' | 'updated_at'
>

// Type for update operations
export type ServiceRequestUpdate = Partial<ServiceRequestInsert>

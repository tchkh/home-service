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

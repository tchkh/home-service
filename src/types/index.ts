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

export interface UserInput {
  first_name: string
  last_name: string
  email: string
  password: string
  tel: string
  image_url?: string
}

export interface UserUpdateInput {
  first_name?: string
  last_name?: string
  email?: string
  password?: string
  tel?: string
  image_url?: string
}

// Admin interfaces
export interface Admin {
  id: number
  first_name: string
  last_name: string
  email: string
}

export interface AdminInput {
  first_name: string
  last_name: string
  email: string
  password: string
}

// Category interfaces
export interface Category {
  id: number
  name: string
  description: string
  created_at: string
  updated_at: string
}

export interface CategoryInput {
  name: string
  description: string
}

// Service interfaces
export interface Service {
  id: number
  title: string
  image_url: string
  created_at: string
  updated_at: string
  category_id: number
  category?: Category
}

export interface ServiceInput {
  title: string
  image_url: string
  category_id: number
}

// SubService interfaces
export interface SubService {
  id: number
  service_id: number
  title: string
  price: number
  service_unit: string
  service?: Service
}

export interface SubServiceInput {
  service_id: number
  title: string
  price: number
  service_unit: string
}

// Response interfaces
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

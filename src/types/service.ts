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

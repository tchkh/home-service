import { create } from 'zustand'
import { devtools, persist, createJSONStorage } from 'zustand/middleware'

interface SubService {
  id: number
  service_id: number
  service_title: string
  title: string
  price: number
  unit: string
}

interface CartItem extends SubService {
  quantity: number
}

interface CustomerInfo {
  serviceDate: Date | null
  serviceTime: string
  address: string
  province: string
  district: string
  subDistrict: string
  additionalInfo: string
  latitude?: number
  longitude?: number
}

interface PaymentInfo {
  method: 'promptpay' | 'creditcard'
  cardNumber: string
  cardName: string
  expiryDate: string
  cvv: string
  promoCode: string
}

interface BookingState {
  // Step management
  currentStep: 'items' | 'details' | 'payment'

  // Service data
  serviceId: string | null
  serviceName: string
  subServices: SubService[]
  cart: CartItem[]

  // Customer info
  customerInfo: CustomerInfo

  // Payment info
  paymentInfo: PaymentInfo

  // Actions
  setServiceId: (id: string) => void
  setServiceName: (name: string) => void
  setSubServices: (services: SubService[]) => void
  updateCartQuantity: (id: number, quantity: number) => void
  updateCustomerInfo: (info: Partial<CustomerInfo>) => void
  updatePaymentInfo: (info: Partial<PaymentInfo>) => void
  setCurrentStep: (step: BookingState['currentStep']) => void
  resetBooking: () => void
  canProceedToNext: () => boolean

  // Computed getters (เปลี่ยนจาก property เป็น function)
  getActiveCartItems: () => CartItem[]
  getTotalAmount: () => number
}

const initialCustomerInfo: CustomerInfo = {
  serviceDate: null,
  serviceTime: '',
  address: '',
  province: '',
  district: '',
  subDistrict: '',
  additionalInfo: '',
  latitude: undefined,
  longitude: undefined,
}

const initialPaymentInfo: PaymentInfo = {
  method: 'creditcard',
  cardNumber: '',
  cardName: '',
  expiryDate: '',
  cvv: '',
  promoCode: '',
}

export const useBookingStore = create<BookingState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        currentStep: 'items',
        serviceId: null,
        serviceName: '',
        subServices: [],
        cart: [],
        customerInfo: initialCustomerInfo,
        paymentInfo: initialPaymentInfo,

        // Actions
        setServiceId: id => set({ serviceId: id }),
        setServiceName: name => set({ serviceName: name }),
        setSubServices: services =>
          set({
            subServices: services,
            cart: services.map(service => ({ ...service, quantity: 0 })),
          }),
        updateCartQuantity: (id, quantity) =>
          set(state => ({
            ...state,
            cart: state.cart.map(item =>
              item.id === id
                ? { ...item, quantity: Math.max(0, quantity) }
                : item
            ),
          })),
        updateCustomerInfo: info =>
          set(state => ({
            customerInfo: { ...state.customerInfo, ...info },
          })),
        updatePaymentInfo: info =>
          set(state => ({
            paymentInfo: { ...state.paymentInfo, ...info },
          })),
        setCurrentStep: step => set({ currentStep: step }),
        resetBooking: () =>
          set({
            currentStep: 'items',
            serviceId: null,
            serviceName: '',
            subServices: [],
            cart: [],
            customerInfo: initialCustomerInfo,
            paymentInfo: initialPaymentInfo,
          }),
        getActiveCartItems: () => {
          const state = get()
          return state.cart.filter(item => item.quantity > 0)
        },
        getTotalAmount: () => {
          const state = get()
          return state.cart.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          )
        },
        canProceedToNext: () => {
          const state = get()
          const {
            serviceDate,
            serviceTime,
            address,
            province,
            district,
            subDistrict,
          } = state.customerInfo
          const { method, cardName } = state.paymentInfo

          switch (state.currentStep) {
            case 'items':
              return state.cart.some(item => item.quantity > 0)
            case 'details':
              return !!(
                serviceDate &&
                serviceTime &&
                address &&
                province &&
                district &&
                subDistrict
              )
            case 'payment':
              if (method === 'creditcard') {
                return !!(cardName && cardName.trim().length > 0)
              }
              return true
            default:
              return false
          }
        },
      }),
      {
        name: 'booking-storage',
        storage: createJSONStorage(() => sessionStorage),
      }
    )
  )
)

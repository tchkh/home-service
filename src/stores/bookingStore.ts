import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

interface SubService {
  id: number
  service_id: number
  service_title?: string | undefined
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

        // Computed getters as functions
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

          switch (state.currentStep) {
            case 'items':
              // แก้ไข: เช็คจาก cart โดยตรง
              const hasSelectedItems = state.cart.some(
                item => item.quantity > 0
              )
              console.log('canProceedToNext - items step:', {
                cart: state.cart,
                hasSelectedItems,
              })
              return hasSelectedItems

            case 'details':
              const {
                serviceDate,
                serviceTime,
                address,
                province,
                district,
                subDistrict,
              } = state.customerInfo
              return !!(
                serviceDate &&
                serviceTime &&
                address &&
                province &&
                district &&
                subDistrict
              )

            case 'payment':
              const { method, cardNumber, cardName, expiryDate, cvv } =
                state.paymentInfo
              if (method === 'creditcard') {
                return !!(
                  cardNumber &&
                  cardName &&
                  expiryDate &&
                  cvv &&
                  /^\d{13,19}$/.test(cardNumber.replace(/\s/g, '')) &&
                  /^(0[1-9]|1[0-2])\/?([0-9]{2})$/.test(expiryDate) &&
                  /^\d{3,4}$/.test(cvv)
                )
              }
              return true // PromptPay doesn't need validation

            default:
              return false
          }
        },
      }),
      {
        name: 'booking-storage',
        partialize: state => ({
          // Only persist necessary data
          serviceId: state.serviceId,
          serviceName: state.serviceName,
          cart: state.cart,
          customerInfo: state.customerInfo,
          currentStep: state.currentStep,
        }),
      }
    )
  )
)

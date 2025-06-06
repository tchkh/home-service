// store/useServiceRequestStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ServiceRequestState {
  serviceRequestCount: number;
  setServiceRequestCount: (count: number) => void;
  resetServiceRequestCount: () => void;
}

export const useServiceRequestStore = create<ServiceRequestState>()(
  persist(
    (set) => ({
      serviceRequestCount: 0,
      setServiceRequestCount: (count: number) => set({ serviceRequestCount: count }),
      resetServiceRequestCount: () => set({ serviceRequestCount: 0 }),
    }),
    {
      name: 'service-request-storage', // unique name for localStorage
      // Optional: customize which parts to persist
      partialize: (state) => ({ serviceRequestCount: state.serviceRequestCount }),
    }
  )
);
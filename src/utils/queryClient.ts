import { QueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error) => {
        // Type guard สำหรับ AxiosError
        if (error instanceof AxiosError) {
          // ไม่ retry ถ้าเจอ 404 Not Found
          if (error.response?.status === 404) return false

          // ไม่ retry ถ้าเป็น 4xx errors (client errors)
          if (
            error.response?.status &&
            error.response.status >= 400 &&
            error.response.status < 500
          ) {
            return false
          }
        }

        // ไม่ retry ถ้าลองครบ 3 ครั้งแล้ว
        if (failureCount >= 3) return false

        // กรณีอื่นๆ ให้ retry
        return true
      },
    },
    mutations: {
      retry: false, // mutations ปกติไม่ retry
    },
  },
})

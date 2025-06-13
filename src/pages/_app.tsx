import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import Navbar from '@/components/shared/Navbar'
import Footer from '@/components/shared/Footer'
import Sidebar from '@/components/shared/Sidebar'
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs'
import { SessionContextProvider } from '@supabase/auth-helpers-react'
import { useState } from 'react'
import Category from '../../public/asset/svgs/category.svg'
import Files from '../../public/asset/svgs/files.svg'
import Promo_code from '../../public/asset/svgs/promo-code.svg'
import Notification_regular from '../../public/asset/svgs/notification-regular.svg'
import List from '../../public/asset/svgs/list.svg'
import History from '../../public/asset/svgs/history.svg'
import Account from '../../public/asset/svgs/account.svg'
import { SidebarProvider, useSidebar } from '@/contexts/SidebarContext'
import { Prompt } from 'next/font/google'
import { UserProvider } from '@/contexts/UserContext'
import 'leaflet/dist/leaflet.css'
import { AppContentProps, SidebarItem } from '@/types'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from 'react-hot-toast'

const prompt = Prompt({
  subsets: ['latin', 'thai'],
  weight: ['300', '400', '500', '600'],
})

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
})

const navbarPages = [
  '/login',
  '/register',
  '/serviceList',
  '/service/[id]',
  '/user/profile',
]
const footerPages = ['/', '/serviceList', '/user/profile']

const adminSidebarItems: SidebarItem[] = [
  {
    label: 'หมวดหมู่',
    icon: Category,
    href: '/admin/categories',
  },
  {
    label: 'บริการ',
    icon: Files,
    href: '/admin/services',
  },
  {
    label: 'Promotion Code',
    icon: Promo_code,
    href: '/admin/promo-codes',
  },
]

const technicianSidebarItems: SidebarItem[] = [
  {
    label: 'คำขอบริการซ่อม',
    icon: Notification_regular,
    href: '/technician/service-request',
  },
  {
    label: 'รายการที่รอดำเนินการ',
    icon: List,
    href: '/technician/pending',
  },
  {
    label: 'ประวัติการซ่อม',
    icon: History,
    href: '/technician/history',
  },
  {
    label: 'ตั้งค่าบัญชีผู้ใช้',
    icon: Account,
    href: '/technician/account-setting',
  },
]

// Component ย่อยที่ใช้ Context
function AppContent({ Component, pageProps, router }: AppContentProps) {
  const { isSidebarOpen } = useSidebar()

  const showAdminSidebar =
    router.pathname.startsWith('/admin') && router.pathname !== '/admin/login'
  const showTechnicianSidebar =
    router.pathname.startsWith('/technician') &&
    router.pathname !== '/technician/login'

  const contentMarginClass =
    (showAdminSidebar || showTechnicianSidebar) && isSidebarOpen
      ? 'md:ml-60'
      : 'ml-0'

  const showNavbar = navbarPages.includes(router.pathname)
  const showFooter = footerPages.includes(router.pathname)

  return (
    <QueryClientProvider client={queryClient}>
      <main
        className={`${prompt.className} min-h-screen w-full max-w-[100%] bg-[var(--bg)]`}
      >
        {showNavbar && <Navbar />}
        {showAdminSidebar && <Sidebar items={adminSidebarItems} />}
        {showTechnicianSidebar && <Sidebar items={technicianSidebarItems} />}
        <div
          className={`flex-1 transition-all duration-300 ease-in-out ${contentMarginClass}`}
        >
          <Component {...pageProps} />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#fff',
                color: '#333',
                padding: '16px',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              },
              success: {
                duration: 2000,
                iconTheme: {
                  primary: '#4ade80',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 4000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
              loading: {
                iconTheme: {
                  primary: '#3b82f6',
                  secondary: '#fff',
                },
              },
            }}
          />
          <ReactQueryDevtools initialIsOpen={false} />
        </div>
        {showFooter && <Footer />}
      </main>
    </QueryClientProvider>
  )
}

export default function App({ Component, pageProps, router }: AppProps) {
  const [supabaseClient] = useState(() => createPagesBrowserClient())

  return (
    <SessionContextProvider
      supabaseClient={supabaseClient}
      initialSession={pageProps.initialSession}
    >
      <UserProvider>
        <SidebarProvider>
          <AppContent
            Component={Component}
            pageProps={pageProps}
            router={router}
          />
        </SidebarProvider>
      </UserProvider>
    </SessionContextProvider>
  )
}

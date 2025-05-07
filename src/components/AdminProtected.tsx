import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import supabase from '../lib/supabase'

export function AdminProtected({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAdmin = async () => {
      // ตรวจสอบว่ามีการล็อกอินอยู่หรือไม่
      const { data } = await supabase.auth.getSession()

      if (!data.session) {
        // ถ้าไม่มีการล็อกอิน ให้นำทางไปหน้า admin login
        router.push('/admin/login')
        return
      }

      // ตรวจสอบว่าเป็น admin หรือไม่
      const isAdmin = data.session.user?.user_metadata?.role === 'admin'

      if (!isAdmin) {
        // ถ้าไม่ใช่ admin ให้นำทางไปหน้า homepage
        await supabase.auth.signOut()
        router.push('/')
        return
      }

      setLoading(false)
    }

    checkAdmin()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        กำลังตรวจสอบสิทธิ์...
      </div>
    )
  }

  return <>{children}</>
}

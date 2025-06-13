import { useState } from 'react'
import { useRouter } from 'next/router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import supabase from '../lib/supabase'
import Link from 'next/link'
import axios, { AxiosError } from 'axios'
import { loginSchema, LoginFormInputs } from '../schemas/auth'
import toast from 'react-hot-toast' // เพิ่ม import สำหรับ toast
import { useUser } from '@/contexts/UserContext'
import LegalModal from '@/components/shared/LegalModal'
import { termsContent, privacyContent } from '../data/legal'
// สร้าง interface สำหรับ error response
interface ErrorResponse {
  error?: string
  message?: string
}

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showTermsModal, setShowTermsModal] = useState(false)
  const [showPrivacyModal, setShowPrivacyModal] = useState(false)
  const { refetchUser } = useUser()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormInputs) => {
    setIsLoading(true)
    setError(null)

    try {
      // 1. พยายามเข้าสู่ระบบโดยใช้ API login ปกติก่อน
      const res = await axios.post('/api/auth/login', {
        email: data.email,
        password: data.password,
      })

      if (res.status === 200) {
        // แสดง toast เมื่อเข้าสู่ระบบสำเร็จ
        toast.success('เข้าสู่ระบบสำเร็จ! กำลังนำทางไปหน้าหลัก...', {
          duration: 2000,
        })
        await refetchUser()
        // รอให้ toast แสดงแล้วค่อย redirect
        setTimeout(() => {
          router.push('/')
        }, 1500)
        return
      }
    } catch (error: unknown) {
      // Handle auth login API error
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ErrorResponse>
        const errorMessage =
          axiosError.response?.data?.error ??
          axiosError.response?.data?.message ??
          'เกิดข้อผิดพลาดในการเข้าสู่ระบบ กรุณาลองใหม่อีกครั้ง'
        
        toast.error(errorMessage)
        setError(errorMessage)
        setIsLoading(false)
        return
      }

      console.warn('การเข้าสู่ระบบปกติล้มเหลว กำลังลองใช้ระบบสำรอง', error)

      // 2. ถ้าการเข้าสู่ระบบปกติล้มเหลว ลองใช้ระบบสำรอง
      try {
        const fallbackResponse = await axios.post('/api/auth/fallback-login', {
          email: data.email,
          password: data.password,
        })

        const fallbackResult = fallbackResponse.data

        if (fallbackResponse.status === 200 && fallbackResult.success) {
          // เก็บข้อมูลการเข้าสู่ระบบใน cookie อย่างปลอดภัย
          const secure = window.location.protocol === 'https:' ? '; secure' : ''
          document.cookie = `fallback_token=${fallbackResult.token}; path=/; max-age=86400; samesite=strict${secure}`
          document.cookie = `user_id=${fallbackResult.user.id}; path=/; max-age=86400; samesite=strict${secure}`

          // แสดง toast เมื่อเข้าสู่ระบบสำเร็จ (ระบบสำรอง)
          toast.success('เข้าสู่ระบบสำเร็จ! กำลังนำทางไปหน้าหลัก...', {
            duration: 2000,
          })

          // รอให้ toast แสดงแล้วค่อย redirect
          setTimeout(() => {
            router.push('/').catch(() => {
              window.location.href = '/'
            })
          }, 1500)
          return
        } else {
          // แสดง error toast
          const errorMessage =
            fallbackResult.error ?? 'การเข้าสู่ระบบล้มเหลว กรุณาลองใหม่อีกครั้ง'
          toast.error(errorMessage)
          setError(errorMessage)
        }
      } catch (fallbackError: unknown) {
        // จัดการกรณีที่ API fallback-login มีปัญหา
        if (axios.isAxiosError(fallbackError)) {
          // Type guard เพื่อตรวจสอบว่าเป็น AxiosError
          const axiosError = fallbackError as AxiosError<ErrorResponse>
          const errorMessage =
            axiosError.response?.data?.error ??
            'เกิดข้อผิดพลาดในการเข้าสู่ระบบ กรุณาลองใหม่อีกครั้ง'

          toast.error(errorMessage)
          setError(errorMessage)
        } else {
          // กรณีที่เป็น error ชนิดอื่น
          const errorMessage =
            'เกิดข้อผิดพลาดในการเข้าสู่ระบบ กรุณาลองใหม่อีกครั้ง'
          toast.error(errorMessage)
          setError(errorMessage)
        }
      }
    } finally {
      setIsLoading(false)
    }
  }

  // ฟังก์ชันสำหรับเข้าสู่ระบบด้วย Facebook
  const handleFacebookLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      })

      if (error) {
        toast.error(error.message)
        setError(error.message)
      } else {
        // แสดง toast เมื่อเริ่มกระบวนการ login ด้วย Facebook
        toast.loading('กำลังเข้าสู่ระบบด้วย Facebook...', {
          duration: 3000,
        })
      }
    } catch {
      const errorMessage =
        'เกิดข้อผิดพลาดในการเข้าสู่ระบบด้วย Facebook กรุณาลองใหม่อีกครั้ง'
      toast.error(errorMessage)
      setError(errorMessage)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-gray-50 min-h-screen">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6 md:p-8">
        <h1 className="text-heading-1 text-center text-navy-900 mb-8">
          เข้าสู่ระบบ
        </h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-(--red) px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="block text-heading-5 text-(--gray-700)"
            >
              อีเมล<span className="text-(--red)">*</span>
            </label>
            <input
              type="email"
              id="email"
              placeholder="กรุณากรอกอีเมล"
              className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-(--blue-500)"
              {...register('email')}
            />
            {errors.email && (
              <p className="text-(--red) text-sm">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="block text-heading-5 text-(--gray-700)"
            >
              รหัสผ่าน<span className="text-(--red)">*</span>
            </label>
            <input
              type="password"
              id="password"
              placeholder="กรุณากรอกรหัสผ่าน"
              className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-(--blue-500)"
              {...register('password')}
            />
            {errors.password && (
              <p className="text-(--red) text-sm">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-(--blue-600) text-heading-5 text-(--white) py-3 px-4 rounded-md font-medium hover:bg-(--blue-700) focus:outline-none focus:ring-2 focus:ring-(--blue-500) focus:ring-offset-2 transition-colors cursor-pointer"
          >
            {isLoading ? 'กำลังดำเนินการ...' : 'เข้าสู่ระบบ'}
          </button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-(--gray-300)"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-(--white) text-body-3 text-(--gray-500)">
              หรือลงชื่อเข้าใช้ผ่าน
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleFacebookLogin}
          className="w-full flex items-center justify-center gap-2 bg-(--white) border border-(--gray-300) py-3 px-4 rounded-md font-medium text-heading-5 text-(--gray-700) hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-(--blue-500) focus:ring-offset-2 transition-colors mb-6 cursor-pointer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="#1877F2"
          >
            <path d="M12.001 2.002c-5.522 0-9.999 4.477-9.999 9.999 0 4.99 3.656 9.126 8.437 9.879v-6.988h-2.54v-2.891h2.54V9.798c0-2.508 1.493-3.891 3.776-3.891 1.094 0 2.24.195 2.24.195v2.459h-1.264c-1.24 0-1.628.772-1.628 1.563v1.875h2.771l-.443 2.891h-2.328v6.988C18.344 21.129 22 16.992 22 12.001c0-5.522-4.477-9.999-9.999-9.999z" />
          </svg>
          เข้าสู่ระบบด้วย Facebook
        </button>

        <div className="text-center text-body-2 text-(--gray-600)">
          <p>
            ยังไม่มีบัญชีผู้ใช้ HomeService?{' '}
            <Link
              href="/register"
              className="text-(--blue-600) hover:underline"
            >
              ลงทะเบียน
            </Link>
          </p>
        </div>
      </div>

      {/* Modals */}
      <LegalModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        title="ข้อตกลงและเงื่อนไข"
        content={termsContent}
      />

      <LegalModal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
        title="นโยบายความเป็นส่วนตัว"
        content={privacyContent}
      />
    </div>
  )
}

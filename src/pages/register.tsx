import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/router'
import { zodResolver } from '@hookform/resolvers/zod'
import { termsContent, privacyContent } from '../data/legal'
import Link from 'next/link'
import axios, { AxiosError } from 'axios'
import { registerSchema, RegisterFormInputs } from '../schemas/auth'
import LegalModal from '@/components/shared/LegalModal'
import toast from 'react-hot-toast'

// สร้าง interface สำหรับ error response
interface ErrorResponse {
  message?: string
  error?: string
}

export default function RegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showTermsModal, setShowTermsModal] = useState(false)
  const [showPrivacyModal, setShowPrivacyModal] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormInputs>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      acceptTerms: false,
    },
  })

  const onSubmit = async (data: RegisterFormInputs) => {
    setIsLoading(true)
    setError(null)

    try {
      const res = await axios.post('/api/auth/register', {
        name: data.fullName,
        email: data.email,
        password: data.password,
        tel: data.phone,
      })

      // ถ้าสำเร็จ แสดง toast และนำทางไปยังหน้า login
      if (res.status === 201) {
        // แสดง toast notification เมื่อลงทะเบียนสำเร็จ (แบบง่าย)
        toast.success('ลงทะเบียนสำเร็จ! กำลังนำทางไปหน้าเข้าสู่ระบบ...', {
          duration: 2000,
        })

        // รอให้ toast แสดงประมาณ 1.5 วินาที แล้วค่อย redirect
        setTimeout(() => {
          router.push('/login')
        }, 1500)

        return
      }
    } catch (error: unknown) {
      // ใช้ axios.isAxiosError เพื่อตรวจสอบว่าเป็น AxiosError
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ErrorResponse>
        const errorMessage =
          axiosError.response?.data?.message ||
          axiosError.response?.data?.error ||
          'เกิดข้อผิดพลาดในการลงทะเบียน กรุณาลองใหม่อีกครั้ง'

        // แสดง error toast (แบบง่าย)
        toast.error(errorMessage)

        setError(errorMessage)
      } else if (error instanceof Error) {
        // กรณีเป็น Error ทั่วไป
        const errorMessage = error.message || 'เกิดข้อผิดพลาดในการลงทะเบียน'

        toast.error(errorMessage)

        setError(errorMessage)
      } else {
        // กรณีเป็น error ที่ไม่รู้จัก
        const errorMessage = 'เกิดข้อผิดพลาดในการลงทะเบียน กรุณาลองใหม่อีกครั้ง'

        toast.error(errorMessage)

        setError(errorMessage)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-(--bg)">
        <div className="w-full max-w-md bg-(--white) rounded-lg shadow-md p-6 md:p-8">
          <h1 className="text-heading-1 text-center text-navy-900 mb-8">
            ลงทะเบียน
          </h1>

          {error && (
            <div className="bg-red-100 border border-red-400 text-(--red) px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <label
                htmlFor="fullName"
                className="block text-heading-5  text-(--gray-700)"
              >
                ชื่อ - นามสกุล<span className="text-(--red)">*</span>
              </label>
              <input
                type="text"
                id="fullName"
                placeholder="กรุณากรอกชื่อ นามสกุล"
                className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-(--blue-500)"
                {...register('fullName')}
              />
              {errors.fullName && (
                <p className="text-(--red) text-sm">
                  {errors.fullName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="phone"
                className="block text-heading-5  text-(--gray-700)"
              >
                เบอร์โทรศัพท์<span className="text-(--red)">*</span>
              </label>
              <input
                type="tel"
                id="phone"
                placeholder="กรุณากรอกเบอร์โทรศัพท์"
                className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-(--blue-500)"
                {...register('phone')}
              />
              {errors.phone && (
                <p className="text-(--red) text-sm">{errors.phone.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-heading-5  text-(--gray-700)"
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
                className="block text-heading-5  text-(--gray-700)"
              >
                รหัสผ่าน<span className="text-(--red)">*</span>
              </label>
              <input
                type="password"
                id="password"
                placeholder="กรุณากรอกรหัสผ่าน"
                className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                {...register('password')}
              />
              {errors.password && (
                <p className="text-(--red) text-sm">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="flex items-start mt-4">
              <div className="flex items-center h-5">
                <input
                  id="acceptTerms"
                  type="checkbox"
                  className="w-4 h-4 border border-(--gray-300) rounded bg-gray-50 focus:ring-3 focus:ring-(--blue-300)"
                  {...register('acceptTerms')}
                />
              </div>
              <div className="ml-3 text-sm">
                <label
                  htmlFor="acceptTerms"
                  className="text-body-3 text-(--gray-700)"
                >
                  ยอมรับ{' '}
                  <button
                    type="button"
                    className="text-(--blue-600) hover:underline focus:outline-none btn btn--ghost"
                    onClick={() => setShowTermsModal(true)}
                  >
                    ข้อตกลงและเงื่อนไข
                  </button>{' '}
                  และ{' '}
                  <button
                    type="button"
                    className="text-(--blue-600) hover:underline focus:outline-none btn btn--ghost"
                    onClick={() => setShowPrivacyModal(true)}
                  >
                    นโยบายความเป็นส่วนตัว
                  </button>
                </label>
                {errors.acceptTerms && (
                  <p className="text-(--red)">{errors.acceptTerms.message}</p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-(--blue-600) btn btn-primary text-heading-5 text-(--white) py-3 px-4 rounded-md  hover:bg-(--blue-700) focus:outline-none focus:ring-2 focus:ring-(--blue-500) focus:ring-offset-2 transition-colors"
            >
              {isLoading ? 'กำลังดำเนินการ...' : 'ลงทะเบียน'}
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
            className="w-full flex items-center justify-center gap-2 btn btn-secondary border border-(--blue-600) py-3 px-4 rounded-md text-heading-5 focus:outline-none focus:ring-2 focus:ring-(--blue-500) focus:ring-offset-2 transition-colors mb-4"
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

          <div className="text-center mt-6">
            <Link
              href="/login"
              className=" text-heading-5 text-(--blue-600) hover:underline"
            >
              กลับไปหน้าเข้าสู่ระบบ
            </Link>
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
    </>
  )
}

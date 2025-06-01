import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import Head from "next/head";
import axios from "axios";
import { useRouter } from "next/navigation";
import { loginSchema, LoginFormInputs } from "../../schemas/auth";


export default function TechnicianLoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormInputs) => {
    setIsLoading(true);
    setError(null);

    try {
      // ล็อกอินด้วย Supabase
      const response = await axios.post("/api/technician/login", {
        email: data.email,
        password: data.password,
      });

      // ถ้าสำเร็จ ทำการ redirect
      if (response.data.success) {
        router.push("/technician/service-request");
      }
    } catch (error: unknown) {
      // จัดการกับข้อผิดพลาด
      if (axios.isAxiosError(error)) {
        // ตรวจสอบว่าเป็น Axios error
        // ดึงข้อความ error จาก axios response
        if (error.response && error.response.data) {
          setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
        } else {
          setError("เกิดข้อผิดพลาดในการเชื่อมต่อ");
        }
      } else {
        // กรณีเป็น error ทั่วไป
        setError("เกิดข้อผิดพลาดในการเชื่อมต่อ");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>เข้าสู่ระบบช่างเทคนิค | HomeServices</title>
        <meta
          name="description"
          content="หน้าเข้าสู่ระบบสำหรับช่าง HomeServices"
        />
      </Head>

      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        {/* Logo */}
        <div className="mb-8 flex items-center justify-center">
          <div className="mr-2 relative w-10 h-10">
            <Image
              src="/asset/svgs/house.svg"
              alt="HomeServices Logo"
              width={70}
              height={71}
            />
          </div>
          <h1 className="text-blue-600 text-3xl font-bold">HomeServices</h1>
        </div>

        {/* Login Form */}
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">
            เข้าสู่ระบบช่างเทคนิค
          </h2>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email<span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                autoComplete="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password<span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                id="password"
                autoComplete="current-password"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-2 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors cursor-pointer"
            >
              {isLoading ? "กำลังดำเนินการ..." : "เข้าสู่ระบบ"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

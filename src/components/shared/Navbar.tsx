import { useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import Link from "next/link";
import { useUser } from "@/contexts/UserContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import toast, { Toaster } from "react-hot-toast";

function Navbar() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isActivate, setIsActivate] = useState(false);
  const { user, loading, refetchUser } = useUser();

  const handleLogin = () => router.push("/login");
  const handleRegister = () => router.push("/register");
  const handleLogout = async () => {
    const res = await axios("/api/auth/logout", {
      method: "POST",
    });
    if (res.status === 200) {
      toast.success("ออกจากระบบสำเร็จ!", {
        duration: 2000,
      });
      await refetchUser();
      window.location.href = "/";

    }
  };

  if (loading) return null; // หรือ Skeleton loader

  return (
    <nav className="sticky top-0 z-50 w-full bg-[color:var(--white)] shadow-sm h-[52px] md:h-[80px] content-center">
      <div className="px-5 md:px-50 py-3 flex items-center justify-between">
        <div className="flex items-center md:gap-20 gap-10">
          <Link
            className="text-[color:var(--blue-600)] flex items-center"
            href="/"
          >
            <Image
              src="/asset/svgs/houseLogo.svg"
              width={32}
              height={32}
              alt="house icon"
              className="md:w-[32px] md:h-[32px]"
            />
            <span className="text-[14px] md:text-[24px] font-medium">
              HomeServices
            </span>
          </Link>
          <Link className="md:text-heading-5 text-[14px]" href="/serviceList">
            บริการของเรา
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2">
              <span className="hidden md:inline text-body-3 text-[color:var(--gray-700)]">
                {user?.first_name} {user?.last_name}
              </span>
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger className="cursor-pointer">
                  {user?.image_url ? (
                    <div className="w-[32px] h-[32px] md:w-[40px] md:h-[40px] rounded-full overflow-hidden">
                      <Image
                        src={user.image_url}
                        width={32}
                        height={32}
                        alt="avatar"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-[32px] h-[32px] md:w-[40px] md:h-[40px] bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-gray-600">
                        {user?.first_name?.charAt(0)}
                        {user?.last_name?.charAt(0)}
                      </span>
                    </div>
                  )}
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-[color:var(--white)] border-0 w-[164px]">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer hover:bg-[color:var(--gray-100)] hover:text-[color:var(--gray-950)] text-body-3 text-[color:var(--gray-800)]"
                    onClick={() => router.push("/user/profile")}
                  >
                    <Image
                      src="/asset/svgs/account.svg"
                      width={16}
                      height={16}
                      alt="account icon"
                    />
                    ข้อมูลผู้ใช้งาน
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer hover:bg-[color:var(--gray-100)] hover:text-[color:var(--gray-950)] text-body-3 text-[color:var(--gray-800)]"
                    onClick={() => router.push("/order-list")}
                  >
                    <Image
                      src="/asset/svgs/list.svg"
                      width={16}
                      height={16}
                      alt="list icon"
                    />
                    รายการคำสั่งซ่อม
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer hover:bg-[color:var(--gray-100)] hover:text-[color:var(--gray-950)] text-body-3 text-[color:var(--gray-800)]"
                    onClick={() => router.push("/history")}
                  >
                    <Image
                      src="/asset/svgs/history.svg"
                      width={16}
                      height={16}
                      alt="history icon"
                    />
                    ประวัติการซ่อม
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer hover:bg-[color:var(--gray-100)] hover:text-[color:var(--gray-950)] text-body-3 text-[color:var(--gray-800)]"
                    onClick={handleLogout}
                  >
                    <Image
                      src="/asset/svgs/logout.svg"
                      width={16}
                      height={16}
                      alt="logout icon"
                    />
                    ออกจากระบบ
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <button
                className={`btn btn--icon ${isActivate ? "activate" : ""} w-[40px] h-[40px]`}
                onClick={() => setIsActivate(!isActivate)}
                aria-pressed={isActivate}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="size-4"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 2a6 6 0 0 0-6 6c0 1.887-.454 3.665-1.257 5.234a.75.75 0 0 0 .515 1.076 32.91 32.91 0 0 0 3.256.508 3.5 3.5 0 0 0 6.972 0 32.903 32.903 0 0 0 3.256-.508.75.75 0 0 0 .515-1.076A11.448 11.448 0 0 1 16 8a6 6 0 0 0-6-6ZM8.05 14.943a33.54 33.54 0 0 0 3.9 0 2 2 0 0 1-3.9 0Z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={handleLogin}
                className="btn btn--secondary px-[16px] py-[8px] text-[14px] md:px-[24px] md:text-[16px]"
              >
                เข้าสู่ระบบ
              </button>
              <button
                onClick={handleRegister}
                className="btn btn--primary px-[16px] py-[8px] text-[14px] md:px-[24px] md:text-[16px]"
              >
                ลงทะเบียน
              </button>
            </>
          )}
        </div>

        {/* Mobile Menu button */}
        <div className="md:hidden flex items-center">
          {user ? (
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger className="cursor-pointer">
                {/* แยกการแสดงรูปโปรไฟล์กับการแสดงปุ่ม Notification */}
                <div className="flex gap-2 items-center"> {/* เพิ่ม items-center เพื่อจัดแนวให้สวยงาม */}
                  {user?.image_url ? (
                    <div className="w-[32px] h-[32px] rounded-full overflow-hidden">
                      <Image
                        src={user.image_url}
                        width={32}
                        height={32}
                        alt="avatar"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-[32px] h-[32px] bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-gray-600">
                        {user?.first_name?.charAt(0)}
                        {user?.last_name?.charAt(0)}
                      </span>
                    </div>
                  )}
                  {/* ย้ายปุ่ม Notification ออกมานอกเงื่อนไข user?.image_url แต่ยังคงอยู่ในเงื่อนไข user? */}
                  <div
                    className={`btn btn--icon ${isActivate ? "activate" : ""} w-[32px] h-[32px]`}
                    onClick={() => setIsActivate(!isActivate)}
                    aria-pressed={isActivate}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="size-4"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 2a6 6 0 0 0-6 6c0 1.887-.454 3.665-1.257 5.234a.75.75 0 0 0 .515 1.076 32.91 32.91 0 0 0 3.256.508 3.5 3.5 0 0 0 6.972 0 32.903 32.903 0 0 0 3.256-.508.75.75 0 0 0 .515-1.076A11.448 11.448 0 0 1 16 8a6 6 0 0 0-6-6ZM8.05 14.943a33.54 33.54 0 0 0 3.9 0 2 2 0 0 1-3.9 0Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-[color:var(--white)] border-0 w-[164px]">
                <DropdownMenuLabel className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    My Account
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer hover:bg-[color:var(--gray-100)] hover:text-[color:var(--gray-950)] text-body-3 text-[color:var(--gray-800)]"
                  onClick={() => router.push("/user/profile")}
                >
                  <Image
                    src="/asset/svgs/account.svg"
                    width={16}
                    height={16}
                    alt="account icon"
                  />
                  ข้อมูลผู้ใช้งาน
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer hover:bg-[color:var(--gray-100)] hover:text-[color:var(--gray-950)] text-body-3 text-[color:var(--gray-800)]"
                  onClick={() => router.push("/order-list")}
                >
                  <Image
                    src="/asset/svgs/list.svg"
                    width={16}
                    height={16}
                    alt="list icon"
                  />
                  รายการคำสั่งซ่อม
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer hover:bg-[color:var(--gray-100)] hover:text-[color:var(--gray-950)] text-body-3 text-[color:var(--gray-800)]"
                  onClick={() => router.push("/history")}
                >
                  <Image
                    src="/asset/svgs/history.svg"
                    width={16}
                    height={16}
                    alt="history icon"
                  />
                  ประวัติการซ่อม
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer hover:bg-[color:var(--gray-100)] hover:text-[color:var(--gray-950)] text-body-3 text-[color:var(--gray-800)]"
                  onClick={handleLogout}
                >
                  <Image
                    src="/asset/svgs/logout.svg"
                    width={16}
                    height={16}
                    alt="logout icon"
                  />
                  ออกจากระบบ
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <button
              className="md:hidden flex item-center"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Image
                src="/asset/svgs/menu.svg"
                width={16}
                height={16}
                alt="menu icon"
              />
            </button>
          )}
        </div>
      </div>

      {/* Mobile Menu for Non-Logged In Users */}
      {isMenuOpen && !user && (
        <div className="md:hidden bg-[color:var(--white)]">
          <div className="container mx-auto px-4 py-2 flex flex-col space-y-3">
            <button
              onClick={handleLogin}
              className="btn btn--secondary py-[8px]"
            >
              เข้าสู่ระบบ
            </button>
            <button
              onClick={handleRegister}
              className="btn btn--primary py-[8px]"
            >
              ลงทะเบียน
            </button>
          </div>
        </div>
      )}
      {/* เพิ่ม Toaster component ที่นี่เพื่อให้ toast สามารถแสดงผลได้ */}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#363636",
            color: "#fff",
          },
          success: {
            duration: 2000,
            iconTheme: {
              primary: "#4ade80",
              secondary: "#fff",
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fff",
            },
          },
          loading: {
            iconTheme: {
              primary: "#3b82f6",
              secondary: "#fff",
            },
          },
        }}
      />
    </nav>
  );
}

export default Navbar;

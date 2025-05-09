import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import type { User } from "@/types";


import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function Navbar() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isActivate, setIsActivate] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);

  const handleLogin = () => router.push("/login");
  const handleRegister = () => router.push("/register");

  const handleLogout = () => {
    // Clear localStorage token
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const projectRef = new URL(supabaseUrl).host.split(".")[0]
    localStorage.removeItem(`sb-${projectRef}-auth-token`);
    setUser(null);
    router.push('/');
  };

  useEffect(() => {
    const getUserProfile = async () => {
      // 1. อ่านจาก localStorage แล้ว parse JSON
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
      const projectRef = new URL(supabaseUrl).host.split(".")[0]
      const sessionString = localStorage.getItem(`sb-${projectRef}-auth-token`)
      if (!sessionString) {
        setLoading(false); 
        return;
      }
  
      try {
        const session = JSON.parse(sessionString)
        const accessToken = session.access_token
  
        // 2. ส่ง token ไปที่ API
        const response = await axios.get("/api/profile", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })

        setUser(response.data)
      } catch (err) {
        console.error("Failed to fetch user:", err)
      } finally {
        setLoading(false);
      }
    }
    getUserProfile()
  }, [])
  return (
    <nav className="sticky top-0 z-50 w-full bg-[color:var(--white)] shadow-sm">
      <div className="container mx-auto px-[5%] py-3 flex items-center justify-between">
        <div className="flex items-center md:gap-20 gap-6">
          <a
            href="/"
            className="text-[color:var(--blue-600)] flex items-center"
          >
            <img
              src="/asset/svgs/houseLogo.svg"
              alt="house icon"
              className="md:w-[32px] md:h-[32px]"
            />
            <span className="text-[14px] md:text-[24px] font-medium">
              HomeServices
            </span>
          </a>
          <a 
            href="/service"
            className="md:text-heading-5 text-[14px]"
            >บริการของเรา</a>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-3">
          {loading ? null : user ? (
            <div className="flex items-center gap-3">
              <span className="hidden md:inline text-body-3 text-[color:var(--gray-700)]">
                {user?.first_name} {user?.last_name}
              </span>
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger>
                  {user?.image_url ? (
                    <img
                      src={user.image_url}
                      alt="avatar"
                      className="w-[32px] h-[32px] rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-[32px] h-[32px] bg-gray-300 rounded-full flex items-center justify-center">
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
                    <img src="/asset/svgs/account.svg" alt="account icon" />
                    ข้อมูลผู้ใช้งาน
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer hover:bg-[color:var(--gray-100)] hover:text-[color:var(--gray-950)] text-body-3 text-[color:var(--gray-800)]"
                    onClick={() => router.push("/service/repair")}
                  >
                    <img src="/asset/svgs/list.svg" alt="list icon" />
                    รายการคำสั่งซ่อม
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer hover:bg-[color:var(--gray-100)] hover:text-[color:var(--gray-950)] text-body-3 text-[color:var(--gray-800)]"
                    onClick={() => router.push("/service/history")}
                  >
                    <img src="/asset/svgs/history.svg" alt="history icon" />
                    ประวัติการซ่อม
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer hover:bg-[color:var(--gray-100)] hover:text-[color:var(--gray-950)] text-body-3 text-[color:var(--gray-800)]"
                    onClick={handleLogout}
                  >
                    <img src="/asset/svgs/logout.svg" alt="logout icon" />
                    ออกจากระบบ
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <button
                className={`btn btn--icon ${isActivate ? "activate" : ""}`}
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
          {loading ? null : user ? (
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger>
                {user?.image_url ? (
                  <div className="flex gap-2">
                  <img
                    src={user.image_url}
                    alt="avatar"
                    className="w-[32px] h-[32px] rounded-full object-cover"
                  />
                  <div
                className={`btn btn--icon ${isActivate ? "activate" : ""}`}
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
                ) : (
                  <div className="w-[32px] h-[32px] bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-gray-600">
                      {user?.first_name?.charAt(0)}
                      {user?.last_name?.charAt(0)}
                    </span>
                  </div>
                )}
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-[color:var(--white)] border-0 w-[164px]">
                <DropdownMenuLabel className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {user?.first_name} {user?.last_name}
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer hover:bg-[color:var(--gray-100)] hover:text-[color:var(--gray-950)] text-body-3 text-[color:var(--gray-800)]"
                  onClick={() => router.push("/user/profile")}
                >
                  <img src="/asset/svgs/account.svg" alt="account icon" />
                  ข้อมูลผู้ใช้งาน
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer hover:bg-[color:var(--gray-100)] hover:text-[color:var(--gray-950)] text-body-3 text-[color:var(--gray-800)]"
                  onClick={() => router.push("/service/repair")}
                >
                  <img src="/asset/svgs/list.svg" alt="list icon" />
                  รายการคำสั่งซ่อม
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer hover:bg-[color:var(--gray-100)] hover:text-[color:var(--gray-950)] text-body-3 text-[color:var(--gray-800)]"
                  onClick={() => router.push("/service/history")}
                >
                  <img src="/asset/svgs/history.svg" alt="history icon" />
                  ประวัติการซ่อม
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer hover:bg-[color:var(--gray-100)] hover:text-[color:var(--gray-950)] text-body-3 text-[color:var(--gray-800)]"
                  onClick={handleLogout}
                >
                  <img src="/asset/svgs/logout.svg" alt="logout icon" />
                  ออกจากระบบ
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <button
              className="md:hidden flex item-center"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <img src="/asset/svgs/menu.svg" alt="menu icon" />
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
    </nav>
  );
}

export default Navbar;
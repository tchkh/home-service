import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import axios from 'axios'
import type { UserWithAddress } from '@/types'

interface UserContextType {
  user: UserWithAddress | null
  loading: boolean
  setUser: (user: UserWithAddress | null) => void
  refetchUser: () => Promise<void>
  updateUser: (updates: Partial<UserWithAddress>) => void
}

const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
  setUser: () => {},
  refetchUser: async () => {},
  updateUser: () => {},
})

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserWithAddress | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchUser = async () => {
    setLoading(true)
    try {
      const res = await axios.get('/api/user/profile')
      if (res.status === 200) {
        setUser(res.data.user)
      } else {
        setUser(null)
      }
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  // --- ฟังก์ชันใหม่: สำหรับอัปเดตข้อมูล user บางส่วน ---
  const updateUser = useCallback((updates: Partial<UserWithAddress>) => {
    setUser(prevUser => {
      // หากไม่มี user เก่าอยู่ ให้คืนค่า null หรือ throw error ตาม logic ของคุณ
      if (!prevUser) return null;
      // คืนค่า user object ใหม่ โดยใช้ spread operator เพื่อรวมข้อมูลเก่ากับข้อมูลที่อัปเดต
      return { ...prevUser, ...updates };
    });
  }, []);

  useEffect(() => {
    fetchUser()
  }, [])

  return (
    <UserContext.Provider value={{ user, loading, setUser, refetchUser: fetchUser, updateUser }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => useContext(UserContext)
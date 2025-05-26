import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import { useEffect, useState } from 'react'

export const useAuth = () => {
  const session = useSession()
  const supabase = useSupabaseClient()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(false)
  }, [session])

  return {
    session,
    user: session?.user || null,
    userId: session?.user?.id || null,
    loading,
    supabase,
  }
}
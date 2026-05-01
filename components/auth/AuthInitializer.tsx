'use client'

import { useEffect } from 'react'
import { supabase } from '../../lib/supabase/client'
import { supabaseData } from '../../lib/supabase/data'
import { useAuthStore } from '../../lib/store/authStore'

export default function AuthInitializer() {
  const { setUser, setLoading } = useAuthStore()

  useEffect(() => {
    setLoading(true)
    supabaseData.auth
      .me()
      .then((user) => setUser(user))
      .catch(() => setUser(null))

    const { data } = supabase.auth.onAuthStateChange(() => {
      supabaseData.auth
        .me()
        .then((user) => setUser(user))
        .catch(() => setUser(null))
    })

    return () => data.subscription.unsubscribe()
  }, [setUser, setLoading])

  return null
}

'use client'

import { useEffect } from 'react'
import api from '../../lib/api'
import { useAuthStore } from '../../lib/store/authStore'
import type { UserDTO } from '../../types'

export default function AuthInitializer() {
  const { setUser, setLoading } = useAuthStore()

  useEffect(() => {
    setLoading(true)
    api
      .get<{ data: UserDTO }>('/api/auth/me')
      .then((res) => setUser(res.data.data))
      .catch(() => setUser(null))
  }, [setUser, setLoading])

  return null
}

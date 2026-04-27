'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { ReactNode } from 'react'
import { useAuthStore } from '../../lib/store/authStore'
import { PageSpinner } from '../ui/Spinner'

export default function AdminGuard({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (!user) router.replace('/auth/login')
      else if (user.role !== 'ADMIN') router.replace('/dashboard')
    }
  }, [user, isLoading, router])

  if (isLoading) return <PageSpinner />
  if (!user || user.role !== 'ADMIN') return null
  return <>{children}</>
}

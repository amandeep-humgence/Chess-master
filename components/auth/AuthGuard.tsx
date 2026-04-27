'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { ReactNode } from 'react'
import { useAuthStore } from '../../lib/store/authStore'
import { PageSpinner } from '../ui/Spinner'

export default function AuthGuard({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/auth/login')
    }
  }, [user, isLoading, router])

  if (isLoading) return <PageSpinner />
  if (!user) return null
  return <>{children}</>
}

import type { ReactNode } from 'react'
import AuthGuard from '../../components/auth/AuthGuard'
import DashboardLayout from '../../components/layout/DashboardLayout'

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <DashboardLayout>{children}</DashboardLayout>
    </AuthGuard>
  )
}

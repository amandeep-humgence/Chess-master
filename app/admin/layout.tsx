import type { ReactNode } from 'react'
import AdminGuard from '../../components/auth/AdminGuard'
import AdminLayout from '../../components/layout/AdminLayout'

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <AdminGuard>
      <AdminLayout>{children}</AdminLayout>
    </AdminGuard>
  )
}

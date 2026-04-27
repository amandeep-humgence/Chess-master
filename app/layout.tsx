'use client'

import './globals.css'
import type { ReactNode } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '../lib/queryClient'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import AuthInitializer from '../components/auth/AuthInitializer'
import TopLoader from '../components/ui/TopLoader'

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-slate-950 text-slate-100">
        <QueryClientProvider client={queryClient}>
          <TopLoader />
          <AuthInitializer />
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </QueryClientProvider>
      </body>
    </html>
  )
}

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import {
  BarChart3, Users, Trophy, CreditCard, FileText, MessageSquare, Newspaper,
} from 'lucide-react'
import { cn } from '../../lib/utils'

const links = [
  { href: '/admin', label: 'Dashboard', icon: BarChart3, exact: true },
  { href: '/admin/tournaments', label: 'Tournaments', icon: Trophy },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/registrations', label: 'Registrations', icon: FileText },
  { href: '/admin/payments', label: 'Payments', icon: CreditCard },
  { href: '/admin/posts', label: 'Posts', icon: Newspaper },
  { href: '/admin/contacts', label: 'Messages', icon: MessageSquare },
]

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-6 md:flex-row">
        <aside className="w-full md:w-56 flex-shrink-0">
          <div className="rounded-xl border border-amber-500/20 bg-slate-800/60 p-3">
            <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-amber-500/60">
              Admin Panel
            </p>
            {links.map(({ href, label, icon: Icon, exact }) => {
              const active = exact ? pathname === href : pathname.startsWith(href)
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors mb-0.5',
                    active
                      ? 'bg-amber-500/20 text-amber-400 font-medium'
                      : 'text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                  )}
                >
                  <Icon size={16} />
                  {label}
                </Link>
              )
            })}
          </div>
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  )
}

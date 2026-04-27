'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import { LayoutDashboard, User, Trophy, Rss } from 'lucide-react'
import { cn } from '../../lib/utils'

const links = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/profile', label: 'Profile', icon: User },
  { href: '/dashboard/tournaments', label: 'My Tournaments', icon: Trophy },
  { href: '/feed', label: 'Social Feed', icon: Rss },
]

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-6 md:flex-row">
        {/* Sidebar */}
        <aside className="w-full md:w-56 flex-shrink-0">
          <nav className="rounded-xl border border-slate-700/50 bg-slate-800/60 p-3">
            {links.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors mb-0.5',
                  pathname === href
                    ? 'bg-amber-500/20 text-amber-400 font-medium'
                    : 'text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                )}
              >
                <Icon size={16} />
                {label}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  )
}

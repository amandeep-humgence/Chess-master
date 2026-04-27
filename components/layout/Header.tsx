'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { Crown, Menu, X, User, LogOut, LayoutDashboard, Shield } from 'lucide-react'
import { useAuthStore } from '../../lib/store/authStore'
import api from '../../lib/api'
import Avatar from '../ui/Avatar'
import { cn } from '../../lib/utils'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/tournaments', label: 'Tournaments' },
  { href: '/feed', label: 'Feed' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

export default function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, clearUser } = useAuthStore()
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const handleLogout = async () => {
    await api.post('/api/auth/logout')
    clearUser()
    router.push('/')
  }

  const profileName = user?.profile
    ? `${user.profile.firstName} ${user.profile.lastName}`
    : user?.email || ''

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-900/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-amber-400 hover:text-amber-300">
          <Crown size={24} className="fill-amber-500" />
          <span className="text-lg font-bold tracking-tight">ChessMaster</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'text-sm transition-colors',
                pathname === link.href
                  ? 'text-amber-400 font-medium'
                  : 'text-slate-400 hover:text-slate-200'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Auth section */}
        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-slate-300 hover:bg-slate-800 transition-colors"
              >
                <Avatar src={user.profile?.avatar} alt={profileName} size="sm" />
                <span className="max-w-[120px] truncate">{user.profile?.firstName || user.email}</span>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-1 w-48 rounded-xl border border-slate-700 bg-slate-800 shadow-xl py-1 z-50">
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <LayoutDashboard size={15} /> Dashboard
                  </Link>
                  <Link
                    href="/dashboard/profile"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <User size={15} /> Profile
                  </Link>
                  {user.role === 'ADMIN' && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-amber-400 hover:bg-slate-700"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <Shield size={15} /> Admin Panel
                    </Link>
                  )}
                  <hr className="my-1 border-slate-700" />
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-slate-700"
                  >
                    <LogOut size={15} /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="text-sm text-slate-400 hover:text-slate-200 transition-colors"
              >
                Login
              </Link>
              <Link
                href="/auth/register"
                className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-amber-400 transition-colors"
              >
                Register
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t border-slate-800 bg-slate-900 px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'text-sm',
                  pathname === link.href ? 'text-amber-400 font-medium' : 'text-slate-400'
                )}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <hr className="border-slate-800" />
            {user ? (
              <>
                <Link href="/dashboard" className="text-sm text-slate-400" onClick={() => setMenuOpen(false)}>Dashboard</Link>
                <button onClick={handleLogout} className="text-left text-sm text-red-400">Logout</button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="text-sm text-slate-400" onClick={() => setMenuOpen(false)}>Login</Link>
                <Link href="/auth/register" className="text-sm text-amber-400" onClick={() => setMenuOpen(false)}>Register</Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}

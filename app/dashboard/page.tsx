'use client'

import { useQuery } from '@tanstack/react-query'
import { Trophy, CreditCard, User, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import api from '../../lib/api'
import { useAuthStore } from '../../lib/store/authStore'
import { Badge } from '../../components/ui/Badge'
import StatsCard from '../../components/admin/StatsCard'
import { formatDate, formatCurrency } from '../../lib/utils'
import type { RegistrationDTO } from '../../types'

export default function DashboardPage() {
  const { user } = useAuthStore()

  const { data: registrations } = useQuery<RegistrationDTO[]>({
    queryKey: ['my-registrations'],
    queryFn: async () => {
      const res = await api.get<{ data: RegistrationDTO[] }>('/api/tournaments/registrations/mine')
      return res.data.data
    },
    enabled: !!user,
  })

  const name = user?.profile
    ? `${user.profile.firstName} ${user.profile.lastName}`
    : user?.email || 'Player'

  const confirmed = registrations?.filter((r) => r.status === 'CONFIRMED').length ?? 0
  const pending = registrations?.filter((r) => r.status === 'PENDING').length ?? 0

  return (
    <div>
      {/* Welcome */}
      <div className="mb-6 rounded-xl border border-amber-500/20 bg-gradient-to-r from-amber-500/10 to-transparent p-5">
        <h1 className="text-xl font-bold text-slate-100">
          Welcome back, {user?.profile?.firstName || 'Player'}! ♟️
        </h1>
        <p className="mt-1 text-sm text-slate-500">Here&apos;s your tournament overview.</p>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatsCard icon={CheckCircle} title="Confirmed" value={confirmed} color="green" />
        <StatsCard icon={Trophy} title="Total Entered" value={registrations?.length ?? 0} color="amber" />
        <StatsCard icon={User} title="Rating" value={user?.profile?.chessRating ?? '—'} color="blue" subtitle="Chess rating" />
      </div>

      {/* Recent registrations */}
      <div className="rounded-xl border border-slate-700/50 bg-slate-800/60">
        <div className="flex items-center justify-between p-5 border-b border-slate-700/50">
          <h2 className="font-semibold text-slate-200">My Tournaments</h2>
          <Link href="/dashboard/tournaments" className="text-xs text-amber-400 hover:text-amber-300">View all</Link>
        </div>
        {registrations?.length ? (
          <div className="divide-y divide-slate-700/50">
            {registrations.slice(0, 5).map((reg) => (
              <div key={reg.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-medium text-slate-300">
                    {(reg.tournament as { title?: string })?.title ?? 'Tournament'}
                  </p>
                  <p className="text-xs text-slate-500">
                    {reg.tournament?.startDate ? formatDate(reg.tournament.startDate) : ''}
                  </p>
                </div>
                <Badge status={reg.status} type="registration" />
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <Trophy size={28} className="mx-auto mb-2 text-slate-600" />
            <p className="text-sm text-slate-500">No tournaments yet.</p>
            <Link href="/tournaments" className="mt-2 inline-block text-sm text-amber-400 hover:text-amber-300">
              Browse tournaments
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

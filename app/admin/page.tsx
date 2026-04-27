'use client'

import { useQuery } from '@tanstack/react-query'
import { Users, Trophy, CreditCard, FileText, TrendingUp, Play } from 'lucide-react'
import api from '../../lib/api'
import StatsCard from '../../components/admin/StatsCard'
import { PageSpinner } from '../../components/ui/Spinner'
import { formatCurrency } from '../../lib/utils'
import type { DashboardStats } from '../../types'

export default function AdminDashboardPage() {
  const { data, isLoading } = useQuery<DashboardStats>({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const res = await api.get<{ data: DashboardStats }>('/api/admin/stats')
      return res.data.data
    },
  })

  if (isLoading) return <PageSpinner />

  return (
    <div>
      <h1 className="mb-6 text-xl font-bold text-slate-100">Admin Dashboard</h1>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 mb-6">
        <StatsCard icon={Users} title="Total Users" value={data?.totalUsers ?? 0} color="blue" />
        <StatsCard icon={Trophy} title="Tournaments" value={data?.totalTournaments ?? 0} color="amber" />
        <StatsCard icon={FileText} title="Registrations" value={data?.totalRegistrations ?? 0} color="purple" />
        <StatsCard icon={CreditCard} title="Revenue" value={formatCurrency(data?.totalRevenue ?? 0)} color="green" />
        <StatsCard icon={TrendingUp} title="Upcoming" value={data?.upcomingTournaments ?? 0} color="blue" subtitle="Tournaments" />
        <StatsCard icon={Play} title="Live Now" value={data?.activeTournaments ?? 0} color="green" subtitle="Tournaments" />
      </div>
    </div>
  )
}

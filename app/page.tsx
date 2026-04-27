'use client'

import Link from 'next/link'
import { Crown, Trophy, Users, Shield, ChevronRight, Calendar } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import api from '../lib/api'
import TournamentCard from '../components/tournament/TournamentCard'
import type { TournamentDTO } from '../types'

function StatPill({ icon: Icon, label, value }: { icon: typeof Crown; label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-xl border border-slate-700/50 bg-slate-800/60 px-6 py-4">
      <Icon size={20} className="text-amber-400" />
      <span className="text-2xl font-bold text-slate-100">{value}</span>
      <span className="text-xs text-slate-500">{label}</span>
    </div>
  )
}

export default function HomePage() {
  const { data } = useQuery<TournamentDTO[]>({
    queryKey: ['tournaments', 'UPCOMING'],
    queryFn: async () => {
      const res = await api.get<{ data: TournamentDTO[] }>('/api/tournaments?status=UPCOMING')
      return res.data.data.slice(0, 3)
    },
  })

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/20 py-24 px-4 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(240,180,41,0.12),transparent)]" />
        <div className="relative mx-auto max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-sm text-amber-400">
            <Crown size={14} className="fill-amber-400" />
            Chess Tournament Platform
          </div>
          <h1 className="mb-5 text-5xl font-extrabold tracking-tight text-slate-100 sm:text-6xl">
            Compete. Connect.{' '}
            <span className="bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
              Conquer.
            </span>
          </h1>
          <p className="mb-8 text-lg text-slate-400 max-w-xl mx-auto">
            Join competitive chess tournaments, track your progress, and connect with players across India.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/tournaments" className="flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-3 text-sm font-semibold text-slate-900 hover:bg-amber-400 transition-colors">
              Browse Tournaments <ChevronRight size={16} />
            </Link>
            <Link href="/auth/register" className="rounded-xl border border-slate-600 px-6 py-3 text-sm font-medium text-slate-300 hover:border-amber-500 hover:text-amber-400 transition-colors">
              Create Account
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-10 px-4">
        <div className="mx-auto max-w-3xl grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatPill icon={Trophy} label="Tournaments" value="50+" />
          <StatPill icon={Users} label="Players" value="500+" />
          <StatPill icon={Crown} label="Prize Pool" value="₹10L+" />
          <StatPill icon={Shield} label="Secure Payments" value="100%" />
        </div>
      </section>

      {/* Upcoming tournaments */}
      <section className="py-10 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-100">
              <Calendar size={20} className="text-amber-400" />
              <h2 className="text-xl font-bold">Upcoming Tournaments</h2>
            </div>
            <Link href="/tournaments" className="text-sm text-amber-400 hover:text-amber-300 flex items-center gap-1">
              View all <ChevronRight size={14} />
            </Link>
          </div>
          {data && data.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {data.map((t) => <TournamentCard key={t.id} tournament={t} />)}
            </div>
          ) : (
            <div className="rounded-xl border border-slate-700/50 bg-slate-800/40 py-16 text-center text-slate-500">
              No upcoming tournaments yet. Check back soon!
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-gradient-to-r from-amber-900/20 to-amber-800/10 border-y border-amber-900/20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-slate-100 mb-4">Ready to play?</h2>
          <p className="text-slate-400 mb-6">
            Register today to join tournaments, earn prizes, and connect with the chess community.
          </p>
          <Link href="/auth/register" className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-8 py-3 text-sm font-semibold text-slate-900 hover:bg-amber-400 transition-colors">
            Get Started Free <ChevronRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  )
}

'use client'

import { use, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { Calendar, MapPin, Users, Trophy, IndianRupee, ArrowLeft, CheckCircle } from 'lucide-react'
import api from '../../../lib/api'
import { Badge } from '../../../components/ui/Badge'
import Button from '../../../components/ui/Button'
import { PageSpinner } from '../../../components/ui/Spinner'
import RazorpayCheckout from '../../../components/tournament/RazorpayCheckout'
import { formatDateTime, formatCurrency } from '../../../lib/utils'
import { useAuthStore } from '../../../lib/store/authStore'
import type { TournamentDTO, RegistrationDTO } from '../../../types'
import Link from 'next/link'

export default function TournamentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { user } = useAuthStore()
  const router = useRouter()
  const qc = useQueryClient()
  const [payError, setPayError] = useState('')
  const [registered, setRegistered] = useState(false)

  const { data: tournament, isLoading } = useQuery<TournamentDTO>({
    queryKey: ['tournament', id],
    queryFn: async () => {
      const res = await api.get<{ data: TournamentDTO }>(`/api/tournaments/${id}`)
      return res.data.data
    },
  })

  const { data: userReg } = useQuery<RegistrationDTO | null>({
    queryKey: ['my-registration', id],
    queryFn: async () => {
      if (!user) return null
      const res = await api.get<{ data: RegistrationDTO[] }>('/api/users/me/profile')
      return null
    },
    enabled: !!user,
  })

  if (isLoading) return <PageSpinner />
  if (!tournament) return <div className="p-8 text-center text-slate-500">Tournament not found.</div>

  const isFull = tournament.currentPlayers >= tournament.maxPlayers
  const canRegister = user && tournament.status === 'UPCOMING' && !isFull && !registered

  const handleSuccess = () => {
    setRegistered(true)
    qc.invalidateQueries({ queryKey: ['tournament', id] })
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <Link href="/tournaments" className="mb-6 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-300 transition-colors">
        <ArrowLeft size={15} /> Back to Tournaments
      </Link>

      <div className="rounded-xl border border-slate-700/50 bg-slate-800/60 p-6 sm:p-8">
        {/* Title */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-100 sm:text-3xl">{tournament.title}</h1>
            <p className="mt-2 text-slate-400">{tournament.description}</p>
          </div>
          <Badge status={tournament.status as import('../../../types').TournamentStatus} type="tournament" className="flex-shrink-0" />
        </div>

        {/* Details grid */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <InfoRow icon={Calendar} label="Dates" value={`${formatDateTime(tournament.startDate)} → ${formatDateTime(tournament.endDate)}`} />
          <InfoRow icon={MapPin} label="Location" value={tournament.location} />
          <InfoRow icon={Users} label="Players" value={`${tournament.currentPlayers} / ${tournament.maxPlayers} registered`} />
          <InfoRow icon={Trophy} label="Prize Pool" value={formatCurrency(tournament.prizePool)} />
          <InfoRow icon={IndianRupee} label="Entry Fee" value={formatCurrency(tournament.entryFee)} />
        </div>

        {/* Registration CTA */}
        <div className="border-t border-slate-700/50 pt-6">
          {registered ? (
            <div className="flex items-center gap-3 rounded-xl border border-green-500/30 bg-green-500/10 px-5 py-4 text-green-400">
              <CheckCircle size={20} />
              <div>
                <p className="font-medium">Registration Confirmed!</p>
                <p className="text-sm text-green-400/70">You&apos;re registered for this tournament.</p>
              </div>
            </div>
          ) : !user ? (
            <div className="text-center">
              <p className="mb-3 text-slate-400">Please sign in to register for this tournament.</p>
              <Button onClick={() => router.push('/auth/login')} size="lg" className="mx-auto">
                Sign In to Register
              </Button>
            </div>
          ) : isFull ? (
            <p className="text-center text-red-400">This tournament is full.</p>
          ) : tournament.status !== 'UPCOMING' ? (
            <p className="text-center text-slate-500">Registration is closed.</p>
          ) : canRegister ? (
            <div>
              {payError && (
                <p className="mb-3 rounded-lg bg-red-500/20 border border-red-500/30 px-4 py-2 text-sm text-red-400 text-center">
                  {payError}
                </p>
              )}
              <RazorpayCheckout
                tournament={tournament}
                userEmail={user.email}
                onSuccess={handleSuccess}
                onError={setPayError}
              />
              <p className="mt-2 text-center text-xs text-slate-500">
                Secure payment powered by Razorpay
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof Calendar; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex-shrink-0 rounded-lg bg-amber-500/10 p-2">
        <Icon size={15} className="text-amber-400" />
      </div>
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-sm text-slate-300">{value}</p>
      </div>
    </div>
  )
}

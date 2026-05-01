'use client'

import { useQuery } from '@tanstack/react-query'
import { Trophy, Calendar, MapPin } from 'lucide-react'
import Link from 'next/link'
import { supabaseData } from '../../../lib/supabase/data'
import { Badge } from '../../../components/ui/Badge'
import { PageSpinner } from '../../../components/ui/Spinner'
import { formatDate } from '../../../lib/utils'
import type { RegistrationDTO } from '../../../types'

export default function MyTournamentsPage() {
  const { data, isLoading } = useQuery<RegistrationDTO[]>({
    queryKey: ['my-registrations'],
    queryFn: () => supabaseData.registrations.mine(),
  })

  if (isLoading) return <PageSpinner />

  return (
    <div>
      <h1 className="mb-6 text-xl font-bold text-slate-100">My Tournaments</h1>

      {!data?.length ? (
        <div className="rounded-xl border border-slate-700/50 bg-slate-800/40 py-16 text-center">
          <Trophy size={32} className="mx-auto mb-3 text-slate-600" />
          <p className="text-slate-500 mb-3">You haven&apos;t registered for any tournaments yet.</p>
          <Link href="/tournaments" className="text-sm text-amber-400 hover:text-amber-300">
            Browse available tournaments →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((reg) => {
            const t = reg.tournament
            return (
              <div key={reg.id} className="rounded-xl border border-slate-700/50 bg-slate-800/60 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link href={`/tournaments/${reg.tournamentId}`} className="font-medium text-slate-200 hover:text-amber-400 transition-colors">
                      {(t as { title?: string })?.title ?? 'Tournament'}
                    </Link>
                    <div className="mt-1 flex flex-wrap gap-3 text-xs text-slate-500">
                      {t?.startDate && (
                        <span className="flex items-center gap-1">
                          <Calendar size={11} /> {formatDate(t.startDate)}
                        </span>
                      )}
                      {(t as { location?: string })?.location && (
                        <span className="flex items-center gap-1">
                          <MapPin size={11} /> {(t as { location?: string }).location}
                        </span>
                      )}
                    </div>
                  </div>
                  <Badge status={reg.status} type="registration" />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

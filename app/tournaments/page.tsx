'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Trophy } from 'lucide-react'
import { supabaseData } from '../../lib/supabase/data'
import TournamentCard from '../../components/tournament/TournamentCard'
import StatusFilter from '../../components/tournament/StatusFilter'
import { PageSpinner } from '../../components/ui/Spinner'
import type { TournamentDTO } from '../../types'

type Filter = 'ALL' | 'UPCOMING' | 'RUNNING' | 'PAST'

export default function TournamentsPage() {
  const [filter, setFilter] = useState<Filter>('ALL')

  const { data, isLoading } = useQuery<TournamentDTO[]>({
    queryKey: ['tournaments', filter],
    queryFn: async () => {
      return supabaseData.tournaments.list(filter !== 'ALL' ? filter : undefined)
    },
  })

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Trophy size={22} className="text-amber-400" />
          <h1 className="text-2xl font-bold text-slate-100">Tournaments</h1>
        </div>
        <StatusFilter active={filter} onChange={setFilter} />
      </div>

      {isLoading ? (
        <PageSpinner />
      ) : !data?.length ? (
        <div className="rounded-xl border border-slate-700/50 bg-slate-800/40 py-20 text-center">
          <Trophy size={36} className="mx-auto mb-3 text-slate-600" />
          <p className="text-slate-500">No tournaments found for this filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((t) => (
            <TournamentCard key={t.id} tournament={t} />
          ))}
        </div>
      )}
    </div>
  )
}

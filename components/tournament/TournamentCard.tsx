import Link from 'next/link'
import { Calendar, MapPin, Users, Trophy, IndianRupee } from 'lucide-react'
import { Badge } from '../ui/Badge'
import { formatDate, formatCurrency } from '../../lib/utils'
import type { TournamentDTO } from '../../types'

interface TournamentCardProps {
  tournament: TournamentDTO
}

export default function TournamentCard({ tournament }: TournamentCardProps) {
  const spotsLeft = tournament.maxPlayers - tournament.currentPlayers
  const isFull = spotsLeft <= 0

  return (
    <Link href={`/tournaments/${tournament.id}`}>
      <div className="group rounded-xl border border-slate-700/50 bg-slate-800/60 p-5 transition-all duration-200 hover:border-amber-500/40 hover:shadow-lg hover:shadow-amber-900/10 cursor-pointer h-full flex flex-col">
        <div className="mb-3 flex items-start justify-between gap-2">
          <h3 className="font-semibold text-slate-100 group-hover:text-amber-400 transition-colors line-clamp-2 leading-tight">
            {tournament.title}
          </h3>
          <Badge status={tournament.status as import('../../types').TournamentStatus} type="tournament" className="flex-shrink-0" />
        </div>

        <p className="mb-4 text-sm text-slate-500 line-clamp-2 flex-1">{tournament.description}</p>

        <div className="space-y-2 text-sm text-slate-400">
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-amber-500/60" />
            <span>{formatDate(tournament.startDate)} — {formatDate(tournament.endDate)}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={14} className="text-amber-500/60" />
            <span className="truncate">{tournament.location}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users size={14} className="text-amber-500/60" />
              <span className={isFull ? 'text-red-400' : ''}>
                {isFull ? 'Full' : `${spotsLeft} spots left`}
              </span>
            </div>
            <div className="flex items-center gap-1 text-amber-400 font-medium">
              <IndianRupee size={13} />
              <span>{tournament.entryFee.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-slate-700/50 pt-3">
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <Trophy size={12} className="text-amber-500/60" />
            <span>Prize: {formatCurrency(tournament.prizePool)}</span>
          </div>
          <span className="text-xs text-amber-500 group-hover:text-amber-400 font-medium">
            View Details →
          </span>
        </div>
      </div>
    </Link>
  )
}

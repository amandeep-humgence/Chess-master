import { cn } from '../../lib/utils'
import type { TournamentStatus, PaymentStatus, RegistrationStatus } from '../../types'

const tournamentColors: Record<TournamentStatus, string> = {
  UPCOMING: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  RUNNING: 'bg-green-500/20 text-green-300 border-green-500/30',
  PAST: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  CANCELLED: 'bg-red-500/20 text-red-300 border-red-500/30',
}

const paymentColors: Record<PaymentStatus, string> = {
  CREATED: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  PAID: 'bg-green-500/20 text-green-300 border-green-500/30',
  FAILED: 'bg-red-500/20 text-red-300 border-red-500/30',
}

const registrationColors: Record<RegistrationStatus, string> = {
  PENDING: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  CONFIRMED: 'bg-green-500/20 text-green-300 border-green-500/30',
  CANCELLED: 'bg-red-500/20 text-red-300 border-red-500/30',
}

interface BadgeProps {
  status: TournamentStatus | PaymentStatus | RegistrationStatus | string
  type?: 'tournament' | 'payment' | 'registration'
  className?: string
}

export function Badge({ status, type = 'tournament', className }: BadgeProps) {
  let colorClass = 'bg-slate-500/20 text-slate-300 border-slate-500/30'

  if (type === 'tournament') {
    colorClass = tournamentColors[status as TournamentStatus] || colorClass
  } else if (type === 'payment') {
    colorClass = paymentColors[status as PaymentStatus] || colorClass
  } else if (type === 'registration') {
    colorClass = registrationColors[status as RegistrationStatus] || colorClass
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        colorClass,
        className
      )}
    >
      {status}
    </span>
  )
}

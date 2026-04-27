import type { LucideIcon } from 'lucide-react'
import { cn } from '../../lib/utils'

interface StatsCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  color?: 'amber' | 'blue' | 'green' | 'purple' | 'red'
  subtitle?: string
}

const colors = {
  amber: 'bg-amber-500/20 text-amber-400',
  blue: 'bg-blue-500/20 text-blue-400',
  green: 'bg-green-500/20 text-green-400',
  purple: 'bg-purple-500/20 text-purple-400',
  red: 'bg-red-500/20 text-red-400',
}

export default function StatsCard({ title, value, icon: Icon, color = 'amber', subtitle }: StatsCardProps) {
  return (
    <div className="rounded-xl border border-slate-700/50 bg-slate-800/60 p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <p className="mt-1 text-2xl font-bold text-slate-100">{value}</p>
          {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
        </div>
        <div className={cn('rounded-xl p-3', colors[color])}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  )
}

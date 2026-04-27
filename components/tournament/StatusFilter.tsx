'use client'

import { cn } from '../../lib/utils'

type Filter = 'ALL' | 'UPCOMING' | 'RUNNING' | 'PAST'

interface StatusFilterProps {
  active: Filter
  onChange: (filter: Filter) => void
}

const filters: { value: Filter; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: 'UPCOMING', label: 'Upcoming' },
  { value: 'RUNNING', label: 'Live' },
  { value: 'PAST', label: 'Past' },
]

export default function StatusFilter({ active, onChange }: StatusFilterProps) {
  return (
    <div className="flex gap-1 rounded-xl border border-slate-700 bg-slate-800/60 p-1 w-fit">
      {filters.map((f) => (
        <button
          key={f.value}
          onClick={() => onChange(f.value)}
          className={cn(
            'rounded-lg px-4 py-1.5 text-sm transition-colors font-medium',
            active === f.value
              ? 'bg-amber-500 text-slate-900'
              : 'text-slate-400 hover:text-slate-200'
          )}
        >
          {f.label}
        </button>
      ))}
    </div>
  )
}

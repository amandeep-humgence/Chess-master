function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-700/50 bg-slate-800/40 p-5 animate-pulse">
      <div className="mb-3 h-4 w-1/3 rounded bg-slate-700" />
      <div className="mb-2 h-6 w-3/4 rounded bg-slate-700" />
      <div className="mb-4 h-3 w-full rounded bg-slate-700/60" />
      <div className="flex gap-2">
        <div className="h-5 w-20 rounded-full bg-slate-700/60" />
        <div className="h-5 w-16 rounded-full bg-slate-700/60" />
      </div>
      <div className="mt-4 h-9 w-full rounded-xl bg-slate-700/40" />
    </div>
  )
}

export default function TournamentsLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-6 h-7 w-48 animate-pulse rounded bg-slate-700" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
      </div>
    </div>
  )
}

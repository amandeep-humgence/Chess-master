export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 animate-pulse space-y-6">
      <div className="h-8 w-40 rounded bg-slate-700" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-slate-700/50 bg-slate-800/40 p-4 space-y-2">
            <div className="h-4 w-4 rounded bg-slate-700" />
            <div className="h-6 w-12 rounded bg-slate-700" />
            <div className="h-3 w-20 rounded bg-slate-700/60" />
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-slate-700/50 bg-slate-800/40 p-5 space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-14 rounded-xl bg-slate-700/40" />
        ))}
      </div>
    </div>
  )
}

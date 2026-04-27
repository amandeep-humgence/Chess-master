export default function AboutLoading() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 animate-pulse space-y-6">
      <div className="h-9 w-1/2 rounded bg-slate-700 mx-auto" />
      <div className="h-4 w-3/4 rounded bg-slate-700/60 mx-auto" />
      <div className="h-4 w-2/3 rounded bg-slate-700/60 mx-auto" />
      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-slate-700/50 bg-slate-800/40 p-6 space-y-3">
            <div className="h-8 w-8 rounded bg-slate-700 mx-auto" />
            <div className="h-4 w-24 rounded bg-slate-700 mx-auto" />
            <div className="h-3 w-full rounded bg-slate-700/60" />
          </div>
        ))}
      </div>
    </div>
  )
}

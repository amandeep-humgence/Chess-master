export default function RootLoading() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4">
      <div className="relative h-14 w-14">
        <div className="absolute inset-0 rounded-full border-4 border-slate-700" />
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-amber-400 border-t-transparent" />
        <div className="absolute inset-[10px] flex items-center justify-center text-amber-400 font-bold text-lg">
          ♟
        </div>
      </div>
      <p className="text-sm text-slate-500 animate-pulse">Loading…</p>
    </div>
  )
}

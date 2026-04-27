function PostSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-700/50 bg-slate-800/40 p-5 animate-pulse">
      <div className="mb-4 flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-slate-700" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-32 rounded bg-slate-700" />
          <div className="h-3 w-20 rounded bg-slate-700/60" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 w-full rounded bg-slate-700/60" />
        <div className="h-3 w-5/6 rounded bg-slate-700/60" />
        <div className="h-3 w-4/6 rounded bg-slate-700/60" />
      </div>
      <div className="mt-4 flex gap-4">
        <div className="h-4 w-12 rounded bg-slate-700/40" />
        <div className="h-4 w-16 rounded bg-slate-700/40" />
      </div>
    </div>
  )
}

export default function FeedLoading() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 space-y-4">
      <div className="mb-6 h-7 w-36 animate-pulse rounded bg-slate-700" />
      {Array.from({ length: 4 }).map((_, i) => <PostSkeleton key={i} />)}
    </div>
  )
}

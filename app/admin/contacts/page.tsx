'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CheckCheck } from 'lucide-react'
import { supabaseData } from '../../../lib/supabase/data'
import { formatDate } from '../../../lib/utils'
import { PageSpinner } from '../../../components/ui/Spinner'
import Pagination from '../../../components/ui/Pagination'
import type { ContactMessageDTO, PaginatedResponse } from '../../../types'

export default function AdminContactsPage() {
  const [page, setPage] = useState(1)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery<PaginatedResponse<ContactMessageDTO>>({
    queryKey: ['admin-contacts', page],
    queryFn: () => supabaseData.contacts.list(page, 20),
  })

  const markRead = useMutation({
    mutationFn: (id: string) => supabaseData.contacts.markRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-contacts'] }),
  })

  if (isLoading) return <PageSpinner />

  return (
    <div>
      <h1 className="mb-6 text-xl font-bold text-slate-100">Contact Messages</h1>

      <div className="space-y-3">
        {data?.data.map((msg) => (
          <div
            key={msg.id}
            className={`rounded-xl border p-4 ${msg.isRead ? 'border-slate-700/50 bg-slate-800/40' : 'border-amber-500/30 bg-amber-500/5'}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-slate-200 text-sm">{msg.name}</span>
                  <span className="text-xs text-slate-500">{msg.email}</span>
                  {!msg.isRead && (
                    <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs text-amber-400">New</span>
                  )}
                </div>
                <p className="text-sm font-medium text-slate-300">{msg.subject}</p>
                <p className="mt-1 text-sm text-slate-500">{msg.message}</p>
                <p className="mt-2 text-xs text-slate-600">{formatDate(msg.createdAt)}</p>
              </div>
              {!msg.isRead && (
                <button
                  onClick={() => markRead.mutate(msg.id)}
                  className="flex-shrink-0 rounded-lg p-2 text-slate-500 hover:bg-slate-700 hover:text-slate-300 transition-colors"
                  title="Mark as read"
                >
                  <CheckCheck size={15} />
                </button>
              )}
            </div>
          </div>
        ))}
        {!data?.data.length && (
          <p className="py-10 text-center text-slate-500">No messages yet.</p>
        )}
      </div>
      <Pagination page={page} totalPages={data?.totalPages ?? 1} onPageChange={setPage} />
    </div>
  )
}

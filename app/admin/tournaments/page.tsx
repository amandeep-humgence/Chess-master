'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { supabaseData } from '../../../lib/supabase/data'
import Button from '../../../components/ui/Button'
import Modal from '../../../components/ui/Modal'
import TournamentForm from '../../../components/tournament/TournamentForm'
import { Badge } from '../../../components/ui/Badge'
import { formatDate, formatCurrency } from '../../../lib/utils'
import type { TournamentDTO, CreateTournamentPayload } from '../../../types'

export default function AdminTournamentsPage() {
  const qc = useQueryClient()
  const [createOpen, setCreateOpen] = useState(false)
  const [editing, setEditing] = useState<TournamentDTO | null>(null)

  const { data: tournaments, isLoading } = useQuery<TournamentDTO[]>({
    queryKey: ['admin-tournaments'],
    queryFn: () => supabaseData.tournaments.list(),
  })

  const createMutation = useMutation({
    mutationFn: (data: CreateTournamentPayload) => supabaseData.tournaments.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-tournaments'] }); setCreateOpen(false) },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateTournamentPayload> }) =>
      supabaseData.tournaments.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-tournaments'] }); setEditing(null) },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => supabaseData.tournaments.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-tournaments'] }),
  })

  const handleDelete = (id: string) => {
    if (confirm('Delete this tournament?')) deleteMutation.mutate(id)
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-100">Tournaments</h1>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Plus size={15} /> Create
        </Button>
      </div>

      <div className="rounded-xl border border-slate-700/50 bg-slate-800/60 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700 text-xs uppercase tracking-wider text-slate-500">
              <th className="px-4 py-3 text-left">Title</th>
              <th className="px-4 py-3 text-left">Dates</th>
              <th className="px-4 py-3 text-left">Fee</th>
              <th className="px-4 py-3 text-left">Players</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6} className="py-10 text-center text-slate-500">Loading…</td></tr>
            ) : tournaments?.map((t) => (
              <tr key={t.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                <td className="px-4 py-3 text-sm text-slate-300 max-w-[200px] truncate">{t.title}</td>
                <td className="px-4 py-3 text-xs text-slate-500">{formatDate(t.startDate)}</td>
                <td className="px-4 py-3 text-sm text-slate-400">{formatCurrency(t.entryFee)}</td>
                <td className="px-4 py-3 text-sm text-slate-400">{t.currentPlayers}/{t.maxPlayers}</td>
                <td className="px-4 py-3"><Badge status={t.status as import('../../../types').TournamentStatus} type="tournament" /></td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setEditing(t)} className="rounded p-1.5 text-slate-500 hover:bg-slate-700 hover:text-slate-300 transition-colors">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => handleDelete(t.id)} className="rounded p-1.5 text-slate-500 hover:bg-red-900/30 hover:text-red-400 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create Tournament" size="lg">
        <TournamentForm
          onSubmit={async (data) => { await createMutation.mutateAsync(data as CreateTournamentPayload) }}
          onCancel={() => setCreateOpen(false)}
        />
      </Modal>

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit Tournament" size="lg">
        {editing && (
          <TournamentForm
            initial={editing}
            onSubmit={async (data) => { await updateMutation.mutateAsync({ id: editing.id, data }) }}
            onCancel={() => setEditing(null)}
          />
        )}
      </Modal>
    </div>
  )
}

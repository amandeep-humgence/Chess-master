'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Trash2 } from 'lucide-react'
import api from '../../../lib/api'
import { formatDate } from '../../../lib/utils'
import { PageSpinner } from '../../../components/ui/Spinner'
import Pagination from '../../../components/ui/Pagination'
import type { PostDTO } from '../../../types'

interface AdminPostsResult {
  data: PostDTO[]
  page: number
  limit: number
}

export default function AdminPostsPage() {
  const [page, setPage] = useState(1)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery<AdminPostsResult>({
    queryKey: ['admin-posts', page],
    queryFn: async () => {
      const res = await api.get<{ data: AdminPostsResult }>(`/api/admin/posts?page=${page}&limit=20`)
      return res.data.data
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/admin/posts/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-posts'] }),
  })

  if (isLoading) return <PageSpinner />

  return (
    <div>
      <h1 className="mb-6 text-xl font-bold text-slate-100">Moderate Posts</h1>

      <div className="rounded-xl border border-slate-700/50 bg-slate-800/60 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700 text-xs uppercase tracking-wider text-slate-500">
              <th className="px-4 py-3 text-left">Author</th>
              <th className="px-4 py-3 text-left">Content</th>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {data?.data.map((post) => {
              const name = post.author?.profile
                ? `${post.author.profile.firstName} ${post.author.profile.lastName}`
                : '—'
              return (
                <tr key={post.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                  <td className="px-4 py-3 text-sm text-slate-300">{name}</td>
                  <td className="px-4 py-3 text-sm text-slate-400 max-w-xs truncate">{post.content}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">{formatDate(post.createdAt)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium ${post.isDeleted ? 'text-red-400' : 'text-green-400'}`}>
                      {post.isDeleted ? 'Removed' : 'Active'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {!post.isDeleted && (
                      <button
                        onClick={() => confirm('Remove this post?') && deleteMutation.mutate(post.id)}
                        className="rounded p-1.5 text-slate-500 hover:bg-red-900/30 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <Pagination page={page} totalPages={10} onPageChange={setPage} />
      </div>
    </div>
  )
}

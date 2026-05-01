'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { MessageCircle, Send } from 'lucide-react'
import { supabaseData } from '../../lib/supabase/data'
import Avatar from '../ui/Avatar'
import { timeAgo } from '../../lib/utils'
import { useAuthStore } from '../../lib/store/authStore'
import type { CommentDTO } from '../../types'
import { useRouter } from 'next/navigation'

export default function CommentSection({ postId, commentsCount }: { postId: string; commentsCount: number }) {
  const { user } = useAuthStore()
  const router = useRouter()
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')

  const { data: comments, isLoading } = useQuery<CommentDTO[]>({
    queryKey: ['comments', postId],
    queryFn: () => supabaseData.posts.comments(postId),
    enabled: open,
  })

  const addComment = useMutation({
    mutationFn: (content: string) => supabaseData.posts.addComment(postId, content),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['comments', postId] })
      setText('')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) { router.push('/auth/login'); return }
    if (text.trim()) addComment.mutate(text.trim())
  }

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 transition-colors"
      >
        <MessageCircle size={16} />
        <span>{commentsCount}</span>
      </button>

      {open && (
        <div className="mt-3 border-t border-slate-700/50 pt-3">
          {isLoading ? (
            <p className="text-xs text-slate-500 text-center py-2">Loading comments…</p>
          ) : (
            <div className="space-y-3 mb-3 max-h-48 overflow-y-auto">
              {comments?.map((c) => {
                const name = c.author?.profile
                  ? `${c.author.profile.firstName} ${c.author.profile.lastName}`
                  : 'User'
                return (
                  <div key={c.id} className="flex gap-2">
                    <Avatar src={c.author?.profile?.avatar} alt={name} size="xs" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs font-medium text-slate-300">{name}</span>
                        <span className="text-xs text-slate-600">{timeAgo(c.createdAt)}</span>
                      </div>
                      <p className="text-sm text-slate-400">{c.content}</p>
                    </div>
                  </div>
                )
              })}
              {!comments?.length && (
                <p className="text-xs text-slate-600 text-center">No comments yet.</p>
              )}
            </div>
          )}

          {user && (
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Add a comment…"
                className="flex-1 rounded-lg border border-slate-600 bg-slate-700 px-3 py-1.5 text-sm text-slate-100 placeholder-slate-500 focus:border-amber-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!text.trim() || addComment.isPending}
                className="p-2 text-amber-500 hover:text-amber-400 disabled:opacity-50 transition-colors"
              >
                <Send size={15} />
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  )
}

'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Trash2, MoreHorizontal } from 'lucide-react'
import { useState } from 'react'
import Avatar from '../ui/Avatar'
import LikeButton from './LikeButton'
import CommentSection from './CommentSection'
import { timeAgo, getImageUrl } from '../../lib/utils'
import { useAuthStore } from '../../lib/store/authStore'
import { supabaseData } from '../../lib/supabase/data'
import type { PostDTO } from '../../types'

interface PostCardProps {
  post: PostDTO
  onDeleted?: (id: string) => void
}

export default function PostCard({ post, onDeleted }: PostCardProps) {
  const { user } = useAuthStore()
  const [menuOpen, setMenuOpen] = useState(false)
  const authorName = post.author?.profile
    ? `${post.author.profile.firstName} ${post.author.profile.lastName}`
    : post.author?.email || 'Unknown'

  const canDelete = user && (user.id === post.userId || user.role === 'ADMIN')

  const handleDelete = async () => {
    if (!confirm('Delete this post?')) return
    await supabaseData.posts.remove(post.id)
    onDeleted?.(post.id)
    setMenuOpen(false)
  }

  return (
    <div className="rounded-xl border border-slate-700/50 bg-slate-800/60">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pb-3">
        <Link href={`/users/${post.userId}`} className="flex items-center gap-3 hover:opacity-80">
          <Avatar src={post.author?.profile?.avatar} alt={authorName} size="sm" />
          <div>
            <p className="text-sm font-medium text-slate-200">{authorName}</p>
            <p className="text-xs text-slate-500">{timeAgo(post.createdAt)}</p>
          </div>
        </Link>
        {canDelete && (
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-700 hover:text-slate-300"
            >
              <MoreHorizontal size={16} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-1 w-36 rounded-xl border border-slate-700 bg-slate-800 shadow-xl py-1 z-10">
                <button
                  onClick={handleDelete}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-slate-700"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="px-4 pb-3">
        <p className="text-sm text-slate-300 whitespace-pre-wrap">{post.content}</p>
      </div>

      {/* Image */}
      {post.imageUrl && (
        <div className="relative w-full aspect-video bg-slate-900">
          <Image
            src={getImageUrl(post.imageUrl)}
            alt="Post image"
            fill
            className="object-cover"
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 px-4 py-3 border-t border-slate-700/50">
        <LikeButton
          postId={post.id}
          liked={post.isLikedByMe ?? false}
          count={post.likesCount}
        />
        <CommentSection postId={post.id} commentsCount={post.commentsCount} />
      </div>
    </div>
  )
}

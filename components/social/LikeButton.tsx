'use client'

import { useState } from 'react'
import { Heart } from 'lucide-react'
import api from '../../lib/api'
import { cn } from '../../lib/utils'
import { useAuthStore } from '../../lib/store/authStore'
import { useRouter } from 'next/navigation'

interface LikeButtonProps {
  postId: string
  liked: boolean
  count: number
  onToggle?: (liked: boolean) => void
}

export default function LikeButton({ postId, liked: initialLiked, count: initialCount, onToggle }: LikeButtonProps) {
  const { user } = useAuthStore()
  const router = useRouter()
  const [liked, setLiked] = useState(initialLiked)
  const [count, setCount] = useState(initialCount)
  const [pending, setPending] = useState(false)

  const handleClick = async () => {
    if (!user) { router.push('/auth/login'); return }
    if (pending) return
    setPending(true)
    try {
      await api.post(`/api/posts/${postId}/like`)
      const next = !liked
      setLiked(next)
      setCount((c) => next ? c + 1 : c - 1)
      onToggle?.(next)
    } finally {
      setPending(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      className={cn(
        'flex items-center gap-1.5 text-sm transition-colors',
        liked ? 'text-red-400' : 'text-slate-500 hover:text-red-400'
      )}
    >
      <Heart
        size={16}
        className={cn('transition-transform', liked && 'fill-red-400', pending && 'scale-90')}
      />
      <span>{count}</span>
    </button>
  )
}

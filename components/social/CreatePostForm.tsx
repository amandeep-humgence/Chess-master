'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { Image as ImageIcon, X, Send } from 'lucide-react'
import Avatar from '../ui/Avatar'
import Button from '../ui/Button'
import { supabaseData } from '../../lib/supabase/data'
import { useAuthStore } from '../../lib/store/authStore'
import type { PostDTO } from '../../types'

interface Props {
  onCreated: (post: PostDTO) => void
}

export default function CreatePostForm({ onCreated }: Props) {
  const { user } = useAuthStore()
  const [content, setContent] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setPreview(URL.createObjectURL(file))
  }

  const removeImage = () => {
    setImageFile(null)
    setPreview(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() && !imageFile) return
    setLoading(true)
    try {
      const post = await supabaseData.posts.create(content.trim(), imageFile)
      onCreated(post)
      setContent('')
      removeImage()
    } finally {
      setLoading(false)
    }
  }

  const name = user?.profile
    ? `${user.profile.firstName} ${user.profile.lastName}`
    : user?.email || ''

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-slate-700/50 bg-slate-800/60 p-4">
      <div className="flex gap-3">
        <Avatar src={user?.profile?.avatar} alt={name} size="sm" />
        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share a chess moment, tip, or achievement…"
            rows={3}
            className="w-full resize-none rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />

          {preview && (
            <div className="relative mt-2 w-32 h-24 rounded-lg overflow-hidden">
              <Image src={preview} alt="Preview" fill unoptimized className="object-cover" />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-1 right-1 rounded-full bg-black/60 p-0.5 text-white hover:bg-black/80"
              >
                <X size={12} />
              </button>
            </div>
          )}

          <div className="flex items-center justify-between mt-3">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-amber-400 transition-colors"
            >
              <ImageIcon size={16} />
              <span>Photo</span>
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
            <Button type="submit" size="sm" loading={loading} disabled={!content.trim() && !imageFile}>
              <Send size={14} />
              Post
            </Button>
          </div>
        </div>
      </div>
    </form>
  )
}

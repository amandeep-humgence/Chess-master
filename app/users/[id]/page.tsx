'use client'

import { use } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Crown } from 'lucide-react'
import { supabaseData } from '../../../lib/supabase/data'
import Avatar from '../../../components/ui/Avatar'
import PostCard from '../../../components/social/PostCard'
import { PageSpinner } from '../../../components/ui/Spinner'
import type { UserDTO, PostDTO } from '../../../types'

export default function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  const { data: user, isLoading } = useQuery<UserDTO>({
    queryKey: ['user-profile', id],
    queryFn: () => supabaseData.users.getById(id),
  })

  const { data: posts } = useQuery<PostDTO[]>({
    queryKey: ['user-posts', id],
    queryFn: () => supabaseData.posts.byUser(id),
    enabled: !!user,
  })

  if (isLoading) return <PageSpinner />
  if (!user) return <div className="p-8 text-center text-slate-500">User not found.</div>

  const name = user.profile
    ? `${user.profile.firstName} ${user.profile.lastName}`
    : user.email

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      {/* Profile card */}
      <div className="mb-8 rounded-xl border border-slate-700/50 bg-slate-800/60 p-6">
        <div className="flex items-center gap-4">
          <Avatar src={user.profile?.avatar} alt={name} size="xl" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-100">{name}</h1>
              {user.role === 'ADMIN' && (
                <span className="flex items-center gap-1 text-xs text-amber-400">
                  <Crown size={12} className="fill-amber-400" /> Admin
                </span>
              )}
            </div>
            {user.profile?.bio && <p className="mt-1 text-sm text-slate-400">{user.profile.bio}</p>}
            {user.profile?.chessRating && (
              <p className="mt-1 text-sm text-slate-500">Rating: {user.profile.chessRating}</p>
            )}
          </div>
        </div>
      </div>

      {/* Posts */}
      <h2 className="mb-4 text-base font-semibold text-slate-300">Posts</h2>
      {posts?.length ? (
        <div className="space-y-4">
          {posts.map((post) => <PostCard key={post.id} post={post} />)}
        </div>
      ) : (
        <p className="text-center text-slate-500 py-8">No posts yet.</p>
      )}
    </div>
  )
}

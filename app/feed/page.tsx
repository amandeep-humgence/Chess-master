'use client'

import { useState } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { Rss } from 'lucide-react'
import { supabaseData } from '../../lib/supabase/data'
import { useAuthStore } from '../../lib/store/authStore'
import PostCard from '../../components/social/PostCard'
import CreatePostForm from '../../components/social/CreatePostForm'
import Button from '../../components/ui/Button'
import { PageSpinner } from '../../components/ui/Spinner'
import type { PostDTO, PaginatedResponse } from '../../types'

export default function FeedPage() {
  const { user } = useAuthStore()

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery<PaginatedResponse<PostDTO>>({
    queryKey: ['feed'],
    queryFn: async ({ pageParam }) => {
      return supabaseData.posts.feed(Number(pageParam), 10)
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
  })

  const [localPosts, setLocalPosts] = useState<PostDTO[]>([])

  const allPosts = [
    ...localPosts,
    ...(data?.pages.flatMap((p) => p.data) ?? []),
  ].filter((p, i, arr) => arr.findIndex((x) => x.id === p.id) === i)

  const handleCreated = (post: PostDTO) => {
    setLocalPosts((prev) => [post, ...prev])
  }

  const handleDeleted = (id: string) => {
    setLocalPosts((prev) => prev.filter((p) => p.id !== id))
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center gap-2">
        <Rss size={20} className="text-amber-400" />
        <h1 className="text-xl font-bold text-slate-100">Social Feed</h1>
      </div>

      {/* Create post */}
      {user && (
        <div className="mb-5">
          <CreatePostForm onCreated={handleCreated} />
        </div>
      )}

      {/* Posts */}
      {isLoading ? (
        <PageSpinner />
      ) : allPosts.length === 0 ? (
        <div className="py-16 text-center text-slate-500">
          No posts yet. Be the first to share!
        </div>
      ) : (
        <div className="space-y-4">
          {allPosts.map((post) => (
            <PostCard key={post.id} post={post} onDeleted={handleDeleted} />
          ))}
          {hasNextPage && (
            <Button
              variant="ghost"
              className="w-full"
              loading={isFetchingNextPage}
              onClick={() => fetchNextPage()}
            >
              Load more
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

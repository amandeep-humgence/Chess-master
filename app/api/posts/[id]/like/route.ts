export const dynamic = 'force-dynamic'

import { postDb } from '@/lib/db/post'
import { requireAuth } from '@/lib/auth-server'
import { successResponse, errorResponse, handleError } from '@/lib/api-helpers'

export async function POST(_req: Request, ctx: RouteContext<'/api/posts/[id]/like'>) {
  try {
    const session = await requireAuth()
    const { id } = await ctx.params
    const post = await postDb.findById(id)
    if (!post || post.isDeleted) return errorResponse('Post not found', 404)

    const existing = await postDb.findLike(session.id, id)
    if (existing) {
      await postDb.removeLike(session.id, id)
      return successResponse({ liked: false })
    } else {
      await postDb.addLike(session.id, id)
      return successResponse({ liked: true })
    }
  } catch (err) {
    return handleError(err)
  }
}

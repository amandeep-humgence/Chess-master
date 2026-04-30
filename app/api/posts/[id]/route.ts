export const dynamic = 'force-dynamic'

import { postDb } from '@/lib/db/post'
import { requireAuth } from '@/lib/auth-server'
import { successResponse, errorResponse, handleError } from '@/lib/api-helpers'

export async function DELETE(_req: Request, ctx: RouteContext<'/api/posts/[id]'>) {
  try {
    const session = await requireAuth()
    const { id } = await ctx.params
    const post = await postDb.findById(id)
    if (!post) return errorResponse('Post not found', 404)

    const isAdmin = session.role === 'ADMIN'
    if (!isAdmin && post.userId !== session.id) {
      return errorResponse('Forbidden — you can only delete your own posts', 403)
    }

    await postDb.softDelete(id)
    return successResponse(null, 'Post deleted')
  } catch (err) {
    return handleError(err)
  }
}

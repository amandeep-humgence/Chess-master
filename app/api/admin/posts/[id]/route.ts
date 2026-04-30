import { postDb } from '@/lib/db/post'
import { requireAdmin } from '@/lib/auth-server'
import { successResponse, errorResponse, handleError } from '@/lib/api-helpers'

export async function DELETE(_req: Request, ctx: RouteContext<'/api/admin/posts/[id]'>) {
  try {
    await requireAdmin()
    const { id } = await ctx.params
    const post = await postDb.findById(id)
    if (!post) return errorResponse('Post not found', 404)
    await postDb.softDelete(id)
    return successResponse(null, 'Post removed')
  } catch (err) {
    return handleError(err)
  }
}

import { postDb } from '@/lib/db/post'
import { requireAuth } from '@/lib/auth-server'
import { successResponse, errorResponse, handleError } from '@/lib/api-helpers'
import { createCommentSchema } from '@/lib/validators/post'

export async function GET(_req: Request, ctx: RouteContext<'/api/posts/[id]/comments'>) {
  try {
    const { id } = await ctx.params
    const comments = await postDb.findComments(id)
    return successResponse(comments)
  } catch (err) {
    return handleError(err)
  }
}

export async function POST(request: Request, ctx: RouteContext<'/api/posts/[id]/comments'>) {
  try {
    const session = await requireAuth()
    const { id } = await ctx.params
    const body = await request.json()

    const result = createCommentSchema.safeParse(body)
    if (!result.success) {
      const messages = result.error.errors.map((e) => e.message).join(', ')
      return errorResponse(`Validation failed: ${messages}`, 422)
    }

    const post = await postDb.findById(id)
    if (!post || post.isDeleted) return errorResponse('Post not found', 404)

    const [comment] = await postDb.createComment({
      userId: session.id,
      postId: id,
      content: result.data.content,
    })
    return successResponse(comment, 'Comment added', 201)
  } catch (err) {
    return handleError(err)
  }
}

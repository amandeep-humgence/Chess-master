export const dynamic = 'force-dynamic'

import { postDb } from '@/lib/db/post'
import { successResponse, errorResponse } from '@/lib/api-helpers'

export async function GET(_req: Request, ctx: RouteContext<'/api/users/[id]/posts'>) {
  try {
    const { id } = await ctx.params
    const posts = await postDb.findByUser(id)
    return successResponse(posts)
  } catch (err) {
    return errorResponse((err as Error).message)
  }
}

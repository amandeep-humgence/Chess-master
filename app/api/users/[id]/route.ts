export const dynamic = 'force-dynamic'

import { userDb } from '@/lib/db/user'
import { successResponse, errorResponse } from '@/lib/api-helpers'

export async function GET(_req: Request, ctx: RouteContext<'/api/users/[id]'>) {
  try {
    const { id } = await ctx.params
    const user = await userDb.findById(id)
    if (!user) return errorResponse('User not found', 404)
    const { password: _p, ...safeUser } = user
    return successResponse(safeUser)
  } catch (err) {
    return errorResponse((err as Error).message)
  }
}

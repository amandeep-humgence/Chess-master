export const dynamic = 'force-dynamic'

import { contactDb } from '@/lib/db/contact'
import { requireAdmin } from '@/lib/auth-server'
import { successResponse, handleError } from '@/lib/api-helpers'

export async function PATCH(_req: Request, ctx: RouteContext<'/api/admin/contacts/[id]/read'>) {
  try {
    await requireAdmin()
    const { id } = await ctx.params
    await contactDb.markRead(id)
    return successResponse(null, 'Marked as read')
  } catch (err) {
    return handleError(err)
  }
}

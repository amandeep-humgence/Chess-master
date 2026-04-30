import { registrationDb } from '@/lib/db/registration'
import { requireAdmin } from '@/lib/auth-server'
import { successResponse, handleError } from '@/lib/api-helpers'

export async function GET(_req: Request, ctx: RouteContext<'/api/tournaments/[id]/registrations'>) {
  try {
    await requireAdmin()
    const { id } = await ctx.params
    const registrations = await registrationDb.findByTournament(id)
    return successResponse(registrations)
  } catch (err) {
    return handleError(err)
  }
}

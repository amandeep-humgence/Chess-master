import { tournamentDb } from '@/lib/db/tournament'
import { requireAdmin } from '@/lib/auth-server'
import { successResponse, errorResponse, handleError } from '@/lib/api-helpers'
import { updateTournamentSchema } from '@/lib/validators/tournament'

export async function GET(_req: Request, ctx: RouteContext<'/api/tournaments/[id]'>) {
  try {
    const { id } = await ctx.params
    const tournament = await tournamentDb.findById(id)
    if (!tournament) return errorResponse('Tournament not found', 404)
    return successResponse(tournament)
  } catch (err) {
    return handleError(err)
  }
}

export async function PUT(request: Request, ctx: RouteContext<'/api/tournaments/[id]'>) {
  try {
    await requireAdmin()
    const { id } = await ctx.params
    const existing = await tournamentDb.findById(id)
    if (!existing) return errorResponse('Tournament not found', 404)

    const body = await request.json()
    const result = updateTournamentSchema.safeParse(body)
    if (!result.success) {
      const messages = result.error.errors.map((e) => e.message).join(', ')
      return errorResponse(`Validation failed: ${messages}`, 422)
    }

    const { startDate, endDate, ...rest } = result.data
    const updateData = {
      ...rest,
      ...(startDate && { startDate: new Date(startDate) }),
      ...(endDate && { endDate: new Date(endDate) }),
    }
    const tournament = await tournamentDb.update(id, updateData)
    return successResponse(tournament, 'Tournament updated')
  } catch (err) {
    return handleError(err)
  }
}

export async function DELETE(_req: Request, ctx: RouteContext<'/api/tournaments/[id]'>) {
  try {
    await requireAdmin()
    const { id } = await ctx.params
    const existing = await tournamentDb.findById(id)
    if (!existing) return errorResponse('Tournament not found', 404)
    await tournamentDb.delete(id)
    return successResponse(null, 'Tournament deleted')
  } catch (err) {
    return handleError(err)
  }
}

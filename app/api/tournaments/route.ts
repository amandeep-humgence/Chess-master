import type { NextRequest } from 'next/server'
import { tournamentDb } from '@/lib/db/tournament'
import { requireAdmin } from '@/lib/auth-server'
import { successResponse, errorResponse, handleError } from '@/lib/api-helpers'
import { createTournamentSchema } from '@/lib/validators/tournament'

export async function GET(request: NextRequest) {
  try {
    const status = request.nextUrl.searchParams.get('status') ?? undefined
    const tournaments = await tournamentDb.findAll(status)
    return successResponse(tournaments)
  } catch (err) {
    return handleError(err)
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAdmin()
    const body = await request.json()
    const result = createTournamentSchema.safeParse(body)
    if (!result.success) {
      const messages = result.error.errors.map((e) => e.message).join(', ')
      return errorResponse(`Validation failed: ${messages}`, 422)
    }

    const { startDate, endDate, ...rest } = result.data
    const tournament = await tournamentDb.create({
      ...rest,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      createdBy: session.id,
    })
    return successResponse(tournament, 'Tournament created', 201)
  } catch (err) {
    return handleError(err)
  }
}

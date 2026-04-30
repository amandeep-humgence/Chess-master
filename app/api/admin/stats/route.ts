export const dynamic = 'force-dynamic'

import { userDb } from '@/lib/db/user'
import { tournamentDb } from '@/lib/db/tournament'
import { registrationDb } from '@/lib/db/registration'
import { paymentDb } from '@/lib/db/payment'
import { requireAdmin } from '@/lib/auth-server'
import { successResponse, handleError } from '@/lib/api-helpers'

export async function GET() {
  try {
    await requireAdmin()
    const [
      totalUsers,
      totalTournaments,
      totalRegistrations,
      totalRevenue,
      upcomingTournaments,
      activeTournaments,
    ] = await Promise.all([
      userDb.countAll(),
      tournamentDb.count(),
      registrationDb.countAll(),
      paymentDb.totalRevenue(),
      tournamentDb.countByStatus('UPCOMING'),
      tournamentDb.countByStatus('RUNNING'),
    ])

    return successResponse({
      totalUsers,
      totalTournaments,
      totalRegistrations,
      totalRevenue,
      upcomingTournaments,
      activeTournaments,
    })
  } catch (err) {
    return handleError(err)
  }
}

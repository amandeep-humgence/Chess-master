export const dynamic = 'force-dynamic'

import { userDb } from '@/lib/db/user'
import { requireAuth } from '@/lib/auth-server'
import { successResponse, handleError } from '@/lib/api-helpers'

export async function GET() {
  try {
    const session = await requireAuth()
    const user = await userDb.findById(session.id)
    if (!user) return handleError(new Error('User not found'))
    const { password: _p, ...safeUser } = user
    return successResponse(safeUser)
  } catch (err) {
    return handleError(err)
  }
}

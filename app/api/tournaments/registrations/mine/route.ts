import { registrationDb } from '@/lib/db/registration'
import { requireAuth } from '@/lib/auth-server'
import { successResponse, handleError } from '@/lib/api-helpers'

export async function GET() {
  try {
    const session = await requireAuth()
    const registrations = await registrationDb.findByUser(session.id)
    return successResponse(registrations)
  } catch (err) {
    return handleError(err)
  }
}

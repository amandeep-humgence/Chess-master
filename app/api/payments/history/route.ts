import { paymentDb } from '@/lib/db/payment'
import { requireAuth } from '@/lib/auth-server'
import { successResponse, handleError } from '@/lib/api-helpers'

export async function GET() {
  try {
    const session = await requireAuth()
    const history = await paymentDb.findUserHistory(session.id)
    return successResponse(history)
  } catch (err) {
    return handleError(err)
  }
}

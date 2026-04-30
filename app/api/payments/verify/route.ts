import { paymentDb } from '@/lib/db/payment'
import { registrationDb } from '@/lib/db/registration'
import { tournamentDb } from '@/lib/db/tournament'
import { verifyRazorpaySignature } from '@/lib/razorpay'
import { requireAuth } from '@/lib/auth-server'
import { successResponse, errorResponse, handleError } from '@/lib/api-helpers'

export async function POST(request: Request) {
  try {
    const session = await requireAuth()
    const body = await request.json()
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, tournamentId } = body

    const isValid = verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature)
    if (!isValid) return errorResponse('Payment verification failed — invalid signature', 400)

    const payment = await paymentDb.findByRazorpayOrderId(razorpayOrderId)
    if (!payment) return errorResponse('Payment record not found', 404)
    if (payment.userId !== session.id) return errorResponse('Unauthorized payment verification', 403)

    await paymentDb.updateStatus(payment.id, {
      status: 'PAID',
      razorpayPaymentId,
      razorpaySignature,
    })

    const existing = await registrationDb.findByUserAndTournament(session.id, tournamentId)
    if (existing) {
      await registrationDb.updateStatus(existing.id, 'CONFIRMED', payment.id)
    } else {
      await registrationDb.create({
        userId: session.id,
        tournamentId,
        paymentId: payment.id,
        status: 'CONFIRMED',
      })
    }

    await tournamentDb.incrementCurrentPlayers(tournamentId)
    return successResponse({ message: 'Registration confirmed' }, 'Payment verified and registration confirmed')
  } catch (err) {
    return handleError(err)
  }
}

import { tournamentDb } from '@/lib/db/tournament'
import { registrationDb } from '@/lib/db/registration'
import { paymentDb } from '@/lib/db/payment'
import { razorpay } from '@/lib/razorpay'
import { requireAuth } from '@/lib/auth-server'
import { successResponse, errorResponse, handleError } from '@/lib/api-helpers'

export async function POST(request: Request) {
  try {
    const session = await requireAuth()
    const body = await request.json()
    const { tournamentId } = body

    if (!tournamentId) return errorResponse('tournamentId is required', 400)

    const tournament = await tournamentDb.findById(tournamentId)
    if (!tournament) return errorResponse('Tournament not found', 404)
    if (tournament.status !== 'UPCOMING' && tournament.status !== 'RUNNING') {
      return errorResponse('Tournament is not accepting registrations', 400)
    }
    if (tournament.currentPlayers >= tournament.maxPlayers) {
      return errorResponse('Tournament is full', 400)
    }

    const existing = await registrationDb.findByUserAndTournament(session.id, tournamentId)
    if (existing && existing.status === 'CONFIRMED') {
      return errorResponse('You are already registered for this tournament', 400)
    }

    const amountInPaise = Math.round(tournament.entryFee * 100)
    const order = (await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `chess_${tournamentId.slice(0, 8)}_${Date.now()}`,
      payment_capture: true,
    })) as { id: string }

    const payment = await paymentDb.create({
      userId: session.id,
      tournamentId,
      amount: tournament.entryFee,
      razorpayOrderId: order.id,
    })

    return successResponse(
      {
        orderId: order.id,
        amount: amountInPaise,
        currency: 'INR',
        keyId: process.env.RAZORPAY_KEY_ID,
        paymentId: payment.id,
      },
      'Order created',
      201
    )
  } catch (err) {
    return handleError(err)
  }
}

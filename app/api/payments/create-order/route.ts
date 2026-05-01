export const dynamic = 'force-dynamic'

import { getRazorpay } from '@/lib/razorpay'
import { createSupabaseAdminClient, createSupabaseRouteClient } from '@/lib/supabase/server'
import { successResponse, errorResponse, handleError } from '@/lib/api-helpers'

export async function POST(request: Request) {
  try {
    const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
    if (!token) return errorResponse('Unauthorized', 401)

    const authed = createSupabaseRouteClient(token)
    const admin = createSupabaseAdminClient()
    const { data: authData, error: authError } = await authed.auth.getUser()
    if (authError || !authData.user) return errorResponse('Unauthorized', 401)

    const body = await request.json()
    const { tournamentId } = body

    if (!tournamentId) return errorResponse('tournamentId is required', 400)

    const { data: tournament, error: tournamentError } = await admin
      .from('tournaments')
      .select('*')
      .eq('id', tournamentId)
      .single()
    if (tournamentError) return errorResponse(tournamentError.message, 400)
    if (!tournament) return errorResponse('Tournament not found', 404)
    if (tournament.status !== 'UPCOMING' && tournament.status !== 'RUNNING') {
      return errorResponse('Tournament is not accepting registrations', 400)
    }
    if (tournament.currentPlayers >= tournament.maxPlayers) {
      return errorResponse('Tournament is full', 400)
    }

    const { data: existing } = await admin
      .from('tournament_registrations')
      .select('*')
      .eq('userId', authData.user.id)
      .eq('tournamentId', tournamentId)
      .maybeSingle()
    if (existing && existing.status === 'CONFIRMED') {
      return errorResponse('You are already registered for this tournament', 400)
    }

    const amountInPaise = Math.round(tournament.entryFee * 100)
    const order = (await getRazorpay().orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `chess_${tournamentId.slice(0, 8)}_${Date.now()}`,
      payment_capture: true,
    })) as { id: string }

    const { data: payment, error: paymentError } = await admin.from('payments').insert({
      userId: authData.user.id,
      tournamentId,
      amount: tournament.entryFee,
      razorpayOrderId: order.id,
    }).select('*').single()
    if (paymentError) return errorResponse(paymentError.message, 400)

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

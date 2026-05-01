export const dynamic = 'force-dynamic'

import { verifyRazorpaySignature } from '@/lib/razorpay'
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
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, tournamentId } = body

    const isValid = verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature)
    if (!isValid) return errorResponse('Payment verification failed — invalid signature', 400)

    const { data: payment, error: paymentFindError } = await admin
      .from('payments')
      .select('*')
      .eq('razorpayOrderId', razorpayOrderId)
      .single()
    if (paymentFindError) return errorResponse(paymentFindError.message, 400)
    if (!payment) return errorResponse('Payment record not found', 404)
    if (payment.userId !== authData.user.id) return errorResponse('Unauthorized payment verification', 403)

    const { error: paymentUpdateError } = await admin.from('payments').update({
      status: 'PAID',
      razorpayPaymentId,
      razorpaySignature,
    }).eq('id', payment.id)
    if (paymentUpdateError) return errorResponse(paymentUpdateError.message, 400)

    const { data: existing } = await admin
      .from('tournament_registrations')
      .select('*')
      .eq('userId', authData.user.id)
      .eq('tournamentId', tournamentId)
      .maybeSingle()
    if (existing) {
      const { error } = await admin
        .from('tournament_registrations')
        .update({ status: 'CONFIRMED', paymentId: payment.id })
        .eq('id', existing.id)
      if (error) return errorResponse(error.message, 400)
    } else {
      const { error } = await admin.from('tournament_registrations').insert({
        userId: authData.user.id,
        tournamentId,
        paymentId: payment.id,
        status: 'CONFIRMED',
      })
      if (error) return errorResponse(error.message, 400)
    }

    const { data: tournament } = await admin.from('tournaments').select('currentPlayers').eq('id', tournamentId).single()
    const { error: tournamentError } = await admin
      .from('tournaments')
      .update({ currentPlayers: Number(tournament?.currentPlayers ?? 0) + 1 })
      .eq('id', tournamentId)
    if (tournamentError) return errorResponse(tournamentError.message, 400)

    return successResponse({ message: 'Registration confirmed' }, 'Payment verified and registration confirmed')
  } catch (err) {
    return handleError(err)
  }
}

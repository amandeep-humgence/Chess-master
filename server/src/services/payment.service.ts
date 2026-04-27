import { razorpay } from '../config/razorpay'
import { config } from '../config/env'
import { paymentRepository } from '../repositories/payment.repository'
import { registrationRepository } from '../repositories/registration.repository'
import { tournamentRepository } from '../repositories/tournament.repository'
import { verifyRazorpaySignature, verifyWebhookSignature } from '../utils/razorpayVerify'
import type { VerifyPaymentPayload } from '../types'

export const paymentService = {
  async createOrder(userId: string, tournamentId: string) {
    const tournament = await tournamentRepository.findById(tournamentId)
    if (!tournament) throw new Error('Tournament not found')
    if (tournament.status !== 'UPCOMING' && tournament.status !== 'RUNNING') {
      throw new Error('Tournament is not accepting registrations')
    }
    if (tournament.currentPlayers >= tournament.maxPlayers) {
      throw new Error('Tournament is full')
    }

    const existing = await registrationRepository.findByUserAndTournament(userId, tournamentId)
    if (existing && existing.status === 'CONFIRMED') {
      throw new Error('You are already registered for this tournament')
    }

    // Amount in paise (INR smallest unit)
    const amountInPaise = Math.round(tournament.entryFee * 100)

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `chess_${tournamentId.slice(0, 8)}_${Date.now()}`,
    })

    const payment = await paymentRepository.create({
      userId,
      tournamentId,
      amount: tournament.entryFee,
      razorpayOrderId: order.id,
    })

    return {
      orderId: order.id,
      amount: amountInPaise,
      currency: 'INR',
      keyId: config.razorpay.keyId,
      paymentId: payment.id,
    }
  },

  async verifyPayment(payload: VerifyPaymentPayload, userId: string) {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, tournamentId } = payload

    const isValid = verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature)
    if (!isValid) throw new Error('Payment verification failed — invalid signature')

    const payment = await paymentRepository.findByRazorpayOrderId(razorpayOrderId)
    if (!payment) throw new Error('Payment record not found')
    if (payment.userId !== userId) throw new Error('Unauthorized payment verification')

    // Mark payment as paid
    await paymentRepository.updateStatus(payment.id, {
      status: 'PAID',
      razorpayPaymentId,
      razorpaySignature,
    })

    // Confirm or create registration
    const existing = await registrationRepository.findByUserAndTournament(userId, tournamentId)
    if (existing) {
      await registrationRepository.updateStatus(existing.id, 'CONFIRMED', payment.id)
    } else {
      await registrationRepository.create({
        userId,
        tournamentId,
        paymentId: payment.id,
        status: 'CONFIRMED',
      })
    }

    // Increment player count
    await tournamentRepository.incrementCurrentPlayers(tournamentId)

    return { message: 'Registration confirmed' }
  },

  async handleWebhook(rawBody: string, signature: string) {
    const isValid = verifyWebhookSignature(rawBody, signature)
    if (!isValid) throw new Error('Invalid webhook signature')

    const event = JSON.parse(rawBody) as { event: string; payload: { payment: { entity: { order_id: string; id: string } } } }

    if (event.event === 'payment.failed') {
      const orderId = event.payload.payment.entity.order_id
      const payment = await paymentRepository.findByRazorpayOrderId(orderId)
      if (payment) {
        await paymentRepository.updateStatus(payment.id, { status: 'FAILED' })
      }
    }

    return { received: true }
  },

  async getUserHistory(userId: string) {
    return paymentRepository.findUserHistory(userId)
  },

  async adminListAll(page: number, limit: number) {
    const skip = (page - 1) * limit
    const [payments, total] = await Promise.all([
      paymentRepository.listAll(skip, limit),
      paymentRepository.countAll(),
    ])
    return {
      data: payments,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  },
}

/**
 * Tests for payment routes:
 * POST /api/payments/create-order
 * POST /api/payments/verify
 * GET  /api/payments/history
 */
import { POST as createOrder } from '@/app/api/payments/create-order/route'
import { POST as verifyPayment } from '@/app/api/payments/verify/route'
import { GET as paymentHistory } from '@/app/api/payments/history/route'

jest.mock('next/headers', () => ({
  cookies: jest.fn(() => Promise.resolve({ get: jest.fn(), set: jest.fn(), delete: jest.fn() })),
}))

jest.mock('@/lib/db/tournament', () => ({
  tournamentDb: { findById: jest.fn(), incrementCurrentPlayers: jest.fn() },
}))

jest.mock('@/lib/db/registration', () => ({
  registrationDb: { findByUserAndTournament: jest.fn(), create: jest.fn(), updateStatus: jest.fn() },
}))

jest.mock('@/lib/db/payment', () => ({
  paymentDb: {
    create: jest.fn(),
    findByRazorpayOrderId: jest.fn(),
    updateStatus: jest.fn(),
    findUserHistory: jest.fn(),
    totalRevenue: jest.fn(),
  },
}))

jest.mock('@/lib/razorpay', () => ({
  razorpay: { orders: { create: jest.fn() } },
  verifyRazorpaySignature: jest.fn(),
}))

jest.mock('@/lib/auth-server', () => ({
  ...jest.requireActual('@/lib/auth-server'),
  requireAuth: jest.fn(),
}))

import { tournamentDb } from '@/lib/db/tournament'
import { registrationDb } from '@/lib/db/registration'
import { paymentDb } from '@/lib/db/payment'
import { razorpay, verifyRazorpaySignature } from '@/lib/razorpay'
import { requireAuth } from '@/lib/auth-server'

const userSession = { id: 'user-1', email: 'user@chess.com', role: 'USER' }

const makeTournament = (overrides = {}) => ({
  id: 'tournament-1',
  title: 'Spring Open',
  status: 'UPCOMING',
  entryFee: 500,
  maxPlayers: 64,
  currentPlayers: 10,
  ...overrides,
})

// ─── POST /api/payments/create-order ─────────────────────────────────────────
describe('POST /api/payments/create-order', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns 401 when not authenticated', async () => {
    ;(requireAuth as jest.Mock).mockRejectedValue(new Error('UNAUTHORIZED'))
    const req = new Request('http://localhost/api/payments/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tournamentId: 'tournament-1' }),
    })
    const res = await createOrder(req)
    expect(res.status).toBe(401)
  })

  it('returns 400 when tournamentId is missing', async () => {
    ;(requireAuth as jest.Mock).mockResolvedValue(userSession)
    const req = new Request('http://localhost/api/payments/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
    const res = await createOrder(req)
    const body = await res.json()
    expect(res.status).toBe(400)
    expect(body.message).toMatch(/tournamentId/)
  })

  it('returns 404 when tournament does not exist', async () => {
    ;(requireAuth as jest.Mock).mockResolvedValue(userSession)
    ;(tournamentDb.findById as jest.Mock).mockResolvedValue(null)
    const req = new Request('http://localhost/api/payments/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tournamentId: 'ghost' }),
    })
    const res = await createOrder(req)
    expect(res.status).toBe(404)
  })

  it('returns 400 when tournament is not accepting registrations (PAST)', async () => {
    ;(requireAuth as jest.Mock).mockResolvedValue(userSession)
    ;(tournamentDb.findById as jest.Mock).mockResolvedValue(makeTournament({ status: 'PAST' }))
    const req = new Request('http://localhost/api/payments/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tournamentId: 'tournament-1' }),
    })
    const res = await createOrder(req)
    expect(res.status).toBe(400)
  })

  it('returns 400 when tournament is full', async () => {
    ;(requireAuth as jest.Mock).mockResolvedValue(userSession)
    ;(tournamentDb.findById as jest.Mock).mockResolvedValue(makeTournament({ currentPlayers: 64, maxPlayers: 64 }))
    const req = new Request('http://localhost/api/payments/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tournamentId: 'tournament-1' }),
    })
    const res = await createOrder(req)
    const body = await res.json()
    expect(res.status).toBe(400)
    expect(body.message).toBe('Tournament is full')
  })

  it('returns 400 when user is already confirmed for tournament', async () => {
    ;(requireAuth as jest.Mock).mockResolvedValue(userSession)
    ;(tournamentDb.findById as jest.Mock).mockResolvedValue(makeTournament())
    ;(registrationDb.findByUserAndTournament as jest.Mock).mockResolvedValue({ status: 'CONFIRMED' })
    const req = new Request('http://localhost/api/payments/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tournamentId: 'tournament-1' }),
    })
    const res = await createOrder(req)
    expect(res.status).toBe(400)
  })

  it('creates order and returns 201 with correct amount in paise', async () => {
    ;(requireAuth as jest.Mock).mockResolvedValue(userSession)
    ;(tournamentDb.findById as jest.Mock).mockResolvedValue(makeTournament())
    ;(registrationDb.findByUserAndTournament as jest.Mock).mockResolvedValue(null)
    ;(razorpay.orders.create as jest.Mock).mockResolvedValue({ id: 'order_123' })
    ;(paymentDb.create as jest.Mock).mockResolvedValue({ id: 'payment-1' })
    const req = new Request('http://localhost/api/payments/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tournamentId: 'tournament-1' }),
    })
    const res = await createOrder(req)
    const body = await res.json()
    expect(res.status).toBe(201)
    expect(body.data.orderId).toBe('order_123')
    expect(body.data.amount).toBe(50000) // 500 INR * 100 paise
    expect(body.data.currency).toBe('INR')
  })
})

// ─── POST /api/payments/verify ─────────────────────────────────────────────────
describe('POST /api/payments/verify', () => {
  const verifyPayload = {
    razorpayOrderId: 'order_123',
    razorpayPaymentId: 'pay_456',
    razorpaySignature: 'sig_789',
    tournamentId: 'tournament-1',
  }

  beforeEach(() => jest.clearAllMocks())

  it('returns 401 when not authenticated', async () => {
    ;(requireAuth as jest.Mock).mockRejectedValue(new Error('UNAUTHORIZED'))
    const req = new Request('http://localhost/api/payments/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(verifyPayload),
    })
    const res = await verifyPayment(req)
    expect(res.status).toBe(401)
  })

  it('returns 400 when signature is invalid', async () => {
    ;(requireAuth as jest.Mock).mockResolvedValue(userSession)
    ;(verifyRazorpaySignature as jest.Mock).mockReturnValue(false)
    const req = new Request('http://localhost/api/payments/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(verifyPayload),
    })
    const res = await verifyPayment(req)
    const body = await res.json()
    expect(res.status).toBe(400)
    expect(body.message).toMatch(/invalid signature/i)
  })

  it('returns 404 when payment record not found', async () => {
    ;(requireAuth as jest.Mock).mockResolvedValue(userSession)
    ;(verifyRazorpaySignature as jest.Mock).mockReturnValue(true)
    ;(paymentDb.findByRazorpayOrderId as jest.Mock).mockResolvedValue(null)
    const req = new Request('http://localhost/api/payments/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(verifyPayload),
    })
    const res = await verifyPayment(req)
    expect(res.status).toBe(404)
  })

  it('returns 403 when payment belongs to different user', async () => {
    ;(requireAuth as jest.Mock).mockResolvedValue(userSession)
    ;(verifyRazorpaySignature as jest.Mock).mockReturnValue(true)
    ;(paymentDb.findByRazorpayOrderId as jest.Mock).mockResolvedValue({ id: 'payment-1', userId: 'other-user' })
    const req = new Request('http://localhost/api/payments/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(verifyPayload),
    })
    const res = await verifyPayment(req)
    expect(res.status).toBe(403)
  })

  it('confirms new registration on valid payment', async () => {
    ;(requireAuth as jest.Mock).mockResolvedValue(userSession)
    ;(verifyRazorpaySignature as jest.Mock).mockReturnValue(true)
    ;(paymentDb.findByRazorpayOrderId as jest.Mock).mockResolvedValue({ id: 'payment-1', userId: 'user-1' })
    ;(paymentDb.updateStatus as jest.Mock).mockResolvedValue(undefined)
    ;(registrationDb.findByUserAndTournament as jest.Mock).mockResolvedValue(null)
    ;(registrationDb.create as jest.Mock).mockResolvedValue({ id: 'reg-1' })
    ;(tournamentDb.incrementCurrentPlayers as jest.Mock).mockResolvedValue(undefined)
    const req = new Request('http://localhost/api/payments/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(verifyPayload),
    })
    const res = await verifyPayment(req)
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.success).toBe(true)
    expect(registrationDb.create).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'CONFIRMED', userId: 'user-1' })
    )
  })
})

// ─── GET /api/payments/history ────────────────────────────────────────────────
describe('GET /api/payments/history', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns 401 when not authenticated', async () => {
    ;(requireAuth as jest.Mock).mockRejectedValue(new Error('UNAUTHORIZED'))
    const res = await paymentHistory()
    expect(res.status).toBe(401)
  })

  it('returns user payment history', async () => {
    ;(requireAuth as jest.Mock).mockResolvedValue(userSession)
    ;(paymentDb.findUserHistory as jest.Mock).mockResolvedValue([
      { id: 'payment-1', amount: 500, status: 'PAID', tournamentId: 'tournament-1' },
    ])
    const res = await paymentHistory()
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.data).toHaveLength(1)
    expect(paymentDb.findUserHistory).toHaveBeenCalledWith('user-1')
  })
})

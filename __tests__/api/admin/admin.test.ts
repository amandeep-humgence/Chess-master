/**
 * Tests for admin routes:
 * GET /api/admin/stats
 * GET /api/admin/registrations
 * GET /api/admin/payments
 * GET /api/admin/contacts
 */
import { GET as getStats } from '@/app/api/admin/stats/route'
import { GET as getRegistrations } from '@/app/api/admin/registrations/route'
import { GET as getPayments } from '@/app/api/admin/payments/route'
import { GET as getContacts } from '@/app/api/admin/contacts/route'

jest.mock('next/headers', () => ({
  cookies: jest.fn(() => Promise.resolve({ get: jest.fn(), set: jest.fn(), delete: jest.fn() })),
}))

jest.mock('@/lib/db/user', () => ({
  userDb: { countAll: jest.fn() },
}))

jest.mock('@/lib/db/tournament', () => ({
  tournamentDb: { count: jest.fn(), countByStatus: jest.fn() },
}))

jest.mock('@/lib/db/registration', () => ({
  registrationDb: { countAll: jest.fn(), listAll: jest.fn() },
}))

jest.mock('@/lib/db/payment', () => ({
  paymentDb: { totalRevenue: jest.fn(), listAll: jest.fn(), countAll: jest.fn() },
}))

jest.mock('@/lib/db/contact', () => ({
  contactDb: { findAll: jest.fn(), countAll: jest.fn() },
}))

jest.mock('@/lib/auth-server', () => ({
  ...jest.requireActual('@/lib/auth-server'),
  requireAdmin: jest.fn(),
}))

import { userDb } from '@/lib/db/user'
import { tournamentDb } from '@/lib/db/tournament'
import { registrationDb } from '@/lib/db/registration'
import { paymentDb } from '@/lib/db/payment'
import { contactDb } from '@/lib/db/contact'
import { requireAdmin } from '@/lib/auth-server'

const adminSession = { id: 'admin-1', email: 'admin@chess.com', role: 'ADMIN' }

const makeNextRequest = (url: string) =>
  Object.assign(new Request(url), { nextUrl: new URL(url) }) as any

// ─── GET /api/admin/stats ─────────────────────────────────────────────────────
describe('GET /api/admin/stats', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns 403 when not admin', async () => {
    ;(requireAdmin as jest.Mock).mockRejectedValue(new Error('FORBIDDEN'))
    const res = await getStats()
    expect(res.status).toBe(403)
  })

  it('returns dashboard statistics as admin', async () => {
    ;(requireAdmin as jest.Mock).mockResolvedValue(adminSession)
    ;(userDb.countAll as jest.Mock).mockResolvedValue(50)
    ;(tournamentDb.count as jest.Mock).mockResolvedValue(10)
    ;(registrationDb.countAll as jest.Mock).mockResolvedValue(200)
    ;(paymentDb.totalRevenue as jest.Mock).mockResolvedValue(100000)
    ;(tournamentDb.countByStatus as jest.Mock)
      .mockResolvedValueOnce(3) // UPCOMING
      .mockResolvedValueOnce(1) // RUNNING
    const res = await getStats()
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.data.totalUsers).toBe(50)
    expect(body.data.totalTournaments).toBe(10)
    expect(body.data.totalRegistrations).toBe(200)
    expect(body.data.totalRevenue).toBe(100000)
    expect(body.data.upcomingTournaments).toBe(3)
    expect(body.data.activeTournaments).toBe(1)
  })
})

// ─── GET /api/admin/registrations ─────────────────────────────────────────────
describe('GET /api/admin/registrations', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns 403 when not admin', async () => {
    ;(requireAdmin as jest.Mock).mockRejectedValue(new Error('FORBIDDEN'))
    const res = await getRegistrations(makeNextRequest('http://localhost/api/admin/registrations'))
    expect(res.status).toBe(403)
  })

  it('returns registrations list as admin', async () => {
    ;(requireAdmin as jest.Mock).mockResolvedValue(adminSession)
    ;(registrationDb.listAll as jest.Mock).mockResolvedValue([
      { id: 'reg-1', userId: 'user-1', tournamentId: 'tournament-1', status: 'CONFIRMED' },
    ])
    ;(registrationDb.countAll as jest.Mock).mockResolvedValue(1)
    const res = await getRegistrations(makeNextRequest('http://localhost/api/admin/registrations'))
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data.data).toHaveLength(1)
  })
})

// ─── GET /api/admin/payments ──────────────────────────────────────────────────
describe('GET /api/admin/payments', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns 403 when not admin', async () => {
    ;(requireAdmin as jest.Mock).mockRejectedValue(new Error('FORBIDDEN'))
    const res = await getPayments(makeNextRequest('http://localhost/api/admin/payments'))
    expect(res.status).toBe(403)
  })

  it('returns payments list as admin', async () => {
    ;(requireAdmin as jest.Mock).mockResolvedValue(adminSession)
    ;(paymentDb.listAll as jest.Mock).mockResolvedValue([
      { id: 'payment-1', amount: 500, status: 'PAID', userId: 'user-1' },
    ])
    ;(paymentDb.countAll as jest.Mock).mockResolvedValue(1)
    const res = await getPayments(makeNextRequest('http://localhost/api/admin/payments'))
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.success).toBe(true)
  })
})

// ─── GET /api/admin/contacts ──────────────────────────────────────────────────
describe('GET /api/admin/contacts', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns 403 when not admin', async () => {
    ;(requireAdmin as jest.Mock).mockRejectedValue(new Error('FORBIDDEN'))
    const res = await getContacts(makeNextRequest('http://localhost/api/admin/contacts'))
    expect(res.status).toBe(403)
  })

  it('returns contact messages as admin', async () => {
    ;(requireAdmin as jest.Mock).mockResolvedValue(adminSession)
    ;(contactDb.findAll as jest.Mock).mockResolvedValue([
      { id: 'msg-1', name: 'John', email: 'john@x.com', subject: 'Hello', message: 'Hi there', isRead: false },
    ])
    ;(contactDb.countAll as jest.Mock).mockResolvedValue(1)
    const res = await getContacts(makeNextRequest('http://localhost/api/admin/contacts'))
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data.data).toHaveLength(1)
  })
})

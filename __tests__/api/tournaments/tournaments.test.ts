/**
 * Tests for GET/POST /api/tournaments and GET/PUT/DELETE /api/tournaments/[id]
 */
import { GET as listTournaments, POST as createTournament } from '@/app/api/tournaments/route'
import { GET as getTournament, PUT as updateTournament, DELETE as deleteTournament } from '@/app/api/tournaments/[id]/route'

jest.mock('next/headers', () => ({
  cookies: jest.fn(() => Promise.resolve({ get: jest.fn(), set: jest.fn(), delete: jest.fn() })),
}))

jest.mock('@/lib/db/tournament', () => ({
  tournamentDb: {
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    countByStatus: jest.fn(),
  },
}))

jest.mock('@/lib/auth-server', () => ({
  ...jest.requireActual('@/lib/auth-server'),
  requireAuth: jest.fn(),
  requireAdmin: jest.fn(),
  getSession: jest.fn(),
}))

import { tournamentDb } from '@/lib/db/tournament'
import { requireAdmin } from '@/lib/auth-server'

const adminSession = { id: 'admin-1', email: 'admin@chess.com', role: 'ADMIN' }

const makeTournament = (overrides = {}) => ({
  id: 'tournament-1',
  title: 'Spring Open 2025',
  description: 'Annual spring chess tournament with prizes',
  startDate: new Date('2025-06-01T09:00:00Z'),
  endDate: new Date('2025-06-03T18:00:00Z'),
  location: 'New Delhi',
  entryFee: 500,
  prizePool: 10000,
  maxPlayers: 64,
  currentPlayers: 10,
  status: 'UPCOMING',
  createdBy: 'admin-1',
  ...overrides,
})

const makeNextRequest = (url: string, options?: RequestInit) =>
  Object.assign(new Request(url, options), { nextUrl: new URL(url) }) as any

// ─── GET /api/tournaments ─────────────────────────────────────────────────────
describe('GET /api/tournaments', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns list of tournaments', async () => {
    ;(tournamentDb.findAll as jest.Mock).mockResolvedValue([makeTournament()])
    const req = makeNextRequest('http://localhost/api/tournaments')
    const res = await listTournaments(req)
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.success).toBe(true)
    expect(Array.isArray(body.data)).toBe(true)
    expect(body.data).toHaveLength(1)
  })

  it('passes status filter to database query', async () => {
    ;(tournamentDb.findAll as jest.Mock).mockResolvedValue([])
    const req = makeNextRequest('http://localhost/api/tournaments?status=UPCOMING')
    await listTournaments(req)
    expect(tournamentDb.findAll).toHaveBeenCalledWith('UPCOMING')
  })

  it('returns empty array when no tournaments exist', async () => {
    ;(tournamentDb.findAll as jest.Mock).mockResolvedValue([])
    const req = makeNextRequest('http://localhost/api/tournaments')
    const res = await listTournaments(req)
    const body = await res.json()
    expect(body.data).toEqual([])
  })
})

// ─── POST /api/tournaments ────────────────────────────────────────────────────
describe('POST /api/tournaments', () => {
  const validPayload = {
    title: 'Autumn Classic 2025',
    description: 'A grand chess tournament for autumn season here',
    startDate: '2025-09-01T09:00:00.000Z',
    endDate: '2025-09-03T18:00:00.000Z',
    location: 'Mumbai',
    entryFee: 300,
    prizePool: 5000,
    maxPlayers: 32,
  }

  beforeEach(() => jest.clearAllMocks())

  it('returns 403 when not admin', async () => {
    ;(requireAdmin as jest.Mock).mockRejectedValue(new Error('FORBIDDEN'))
    const req = new Request('http://localhost/api/tournaments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validPayload),
    })
    const res = await createTournament(req)
    expect(res.status).toBe(403)
  })

  it('returns 422 when title is too short', async () => {
    ;(requireAdmin as jest.Mock).mockResolvedValue(adminSession)
    const req = new Request('http://localhost/api/tournaments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...validPayload, title: 'Hi' }),
    })
    const res = await createTournament(req)
    expect(res.status).toBe(422)
  })

  it('returns 422 when description is too short', async () => {
    ;(requireAdmin as jest.Mock).mockResolvedValue(adminSession)
    const req = new Request('http://localhost/api/tournaments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...validPayload, description: 'Short' }),
    })
    const res = await createTournament(req)
    expect(res.status).toBe(422)
  })

  it('returns 422 when entryFee is negative', async () => {
    ;(requireAdmin as jest.Mock).mockResolvedValue(adminSession)
    const req = new Request('http://localhost/api/tournaments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...validPayload, entryFee: -100 }),
    })
    const res = await createTournament(req)
    expect(res.status).toBe(422)
  })

  it('creates tournament and returns 201', async () => {
    ;(requireAdmin as jest.Mock).mockResolvedValue(adminSession)
    ;(tournamentDb.create as jest.Mock).mockResolvedValue(makeTournament())
    const req = new Request('http://localhost/api/tournaments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validPayload),
    })
    const res = await createTournament(req)
    const body = await res.json()
    expect(res.status).toBe(201)
    expect(body.success).toBe(true)
  })
})

// ─── GET /api/tournaments/[id] ────────────────────────────────────────────────
describe('GET /api/tournaments/[id]', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns 404 when tournament does not exist', async () => {
    ;(tournamentDb.findById as jest.Mock).mockResolvedValue(null)
    const req = new Request('http://localhost/api/tournaments/bad-id')
    const res = await getTournament(req, { params: Promise.resolve({ id: 'bad-id' }) })
    expect(res.status).toBe(404)
  })

  it('returns tournament when found', async () => {
    ;(tournamentDb.findById as jest.Mock).mockResolvedValue(makeTournament())
    const req = new Request('http://localhost/api/tournaments/tournament-1')
    const res = await getTournament(req, { params: Promise.resolve({ id: 'tournament-1' }) })
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.data.id).toBe('tournament-1')
  })
})

// ─── PUT /api/tournaments/[id] ────────────────────────────────────────────────
describe('PUT /api/tournaments/[id]', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns 403 when not admin', async () => {
    ;(requireAdmin as jest.Mock).mockRejectedValue(new Error('FORBIDDEN'))
    const req = new Request('http://localhost/api/tournaments/tournament-1', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'RUNNING' }),
    })
    const res = await updateTournament(req, { params: Promise.resolve({ id: 'tournament-1' }) })
    expect(res.status).toBe(403)
  })

  it('returns 404 when tournament does not exist', async () => {
    ;(requireAdmin as jest.Mock).mockResolvedValue(adminSession)
    ;(tournamentDb.findById as jest.Mock).mockResolvedValue(null)
    const req = new Request('http://localhost/api/tournaments/ghost', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'RUNNING' }),
    })
    const res = await updateTournament(req, { params: Promise.resolve({ id: 'ghost' }) })
    expect(res.status).toBe(404)
  })

  it('updates tournament status as admin', async () => {
    ;(requireAdmin as jest.Mock).mockResolvedValue(adminSession)
    ;(tournamentDb.findById as jest.Mock).mockResolvedValue(makeTournament())
    ;(tournamentDb.update as jest.Mock).mockResolvedValue(makeTournament({ status: 'RUNNING' }))
    const req = new Request('http://localhost/api/tournaments/tournament-1', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'RUNNING' }),
    })
    const res = await updateTournament(req, { params: Promise.resolve({ id: 'tournament-1' }) })
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.data.status).toBe('RUNNING')
  })
})

// ─── DELETE /api/tournaments/[id] ─────────────────────────────────────────────
describe('DELETE /api/tournaments/[id]', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns 403 when not admin', async () => {
    ;(requireAdmin as jest.Mock).mockRejectedValue(new Error('FORBIDDEN'))
    const req = new Request('http://localhost/api/tournaments/tournament-1', { method: 'DELETE' })
    const res = await deleteTournament(req, { params: Promise.resolve({ id: 'tournament-1' }) })
    expect(res.status).toBe(403)
  })

  it('returns 404 when tournament does not exist', async () => {
    ;(requireAdmin as jest.Mock).mockResolvedValue(adminSession)
    ;(tournamentDb.findById as jest.Mock).mockResolvedValue(null)
    const req = new Request('http://localhost/api/tournaments/ghost', { method: 'DELETE' })
    const res = await deleteTournament(req, { params: Promise.resolve({ id: 'ghost' }) })
    expect(res.status).toBe(404)
  })

  it('deletes tournament as admin', async () => {
    ;(requireAdmin as jest.Mock).mockResolvedValue(adminSession)
    ;(tournamentDb.findById as jest.Mock).mockResolvedValue(makeTournament())
    ;(tournamentDb.delete as jest.Mock).mockResolvedValue(undefined)
    const req = new Request('http://localhost/api/tournaments/tournament-1', { method: 'DELETE' })
    const res = await deleteTournament(req, { params: Promise.resolve({ id: 'tournament-1' }) })
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.message).toBe('Tournament deleted')
  })
})

/**
 * Tests for GET /api/users/[id] and GET /api/admin/users
 */
import { GET as getUser } from '@/app/api/users/[id]/route'
import { GET as listUsers } from '@/app/api/admin/users/route'

jest.mock('next/headers', () => ({
  cookies: jest.fn(() => Promise.resolve({ get: jest.fn(), set: jest.fn(), delete: jest.fn() })),
}))

jest.mock('@/lib/db/user', () => ({
  userDb: { findById: jest.fn(), listAll: jest.fn(), countAll: jest.fn() },
}))

jest.mock('@/lib/auth-server', () => ({
  ...jest.requireActual('@/lib/auth-server'),
  requireAdmin: jest.fn(),
}))

import { userDb } from '@/lib/db/user'
import { requireAdmin } from '@/lib/auth-server'

const adminSession = { id: 'admin-1', email: 'admin@chess.com', role: 'ADMIN' }

const makeUser = (overrides = {}) => ({
  id: 'user-1',
  email: 'user@chess.com',
  password: 'hashed',
  role: 'USER',
  createdAt: new Date(),
  profile: { firstName: 'John', lastName: 'Doe' },
  ...overrides,
})

// ─── GET /api/users/[id] ──────────────────────────────────────────────────────
describe('GET /api/users/[id]', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns 404 when user does not exist', async () => {
    ;(userDb.findById as jest.Mock).mockResolvedValue(null)
    const req = new Request('http://localhost/api/users/ghost')
    const res = await getUser(req, { params: Promise.resolve({ id: 'ghost' }) })
    expect(res.status).toBe(404)
  })

  it('returns user data without password', async () => {
    ;(userDb.findById as jest.Mock).mockResolvedValue(makeUser())
    const req = new Request('http://localhost/api/users/user-1')
    const res = await getUser(req, { params: Promise.resolve({ id: 'user-1' }) })
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.data.email).toBe('user@chess.com')
    expect(body.data).not.toHaveProperty('password')
  })
})

// ─── GET /api/admin/users ─────────────────────────────────────────────────────
describe('GET /api/admin/users', () => {
  const makeNextRequest = (url: string) =>
    Object.assign(new Request(url), { nextUrl: new URL(url) }) as any

  beforeEach(() => jest.clearAllMocks())

  it('returns 403 when not admin', async () => {
    ;(requireAdmin as jest.Mock).mockRejectedValue(new Error('FORBIDDEN'))
    const res = await listUsers(makeNextRequest('http://localhost/api/admin/users'))
    expect(res.status).toBe(403)
  })

  it('returns paginated users list as admin', async () => {
    ;(requireAdmin as jest.Mock).mockResolvedValue(adminSession)
    ;(userDb.listAll as jest.Mock).mockResolvedValue([makeUser()])
    ;(userDb.countAll as jest.Mock).mockResolvedValue(1)
    const res = await listUsers(makeNextRequest('http://localhost/api/admin/users'))
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.data.data).toHaveLength(1)
    expect(body.data.total).toBe(1)
  })

  it('never exposes password hashes in admin user list', async () => {
    ;(requireAdmin as jest.Mock).mockResolvedValue(adminSession)
    ;(userDb.listAll as jest.Mock).mockResolvedValue([makeUser()])
    ;(userDb.countAll as jest.Mock).mockResolvedValue(1)
    const res = await listUsers(makeNextRequest('http://localhost/api/admin/users'))
    const body = await res.json()
    body.data.data.forEach((u: any) => {
      expect(u).not.toHaveProperty('password')
    })
  })
})

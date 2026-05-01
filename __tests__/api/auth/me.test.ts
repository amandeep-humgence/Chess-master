/**
 * Tests for GET /api/auth/me
 */
import { GET } from '@/app/api/auth/me/route'

jest.mock('next/headers', () => ({
  cookies: jest.fn(() => Promise.resolve({ get: jest.fn(), set: jest.fn(), delete: jest.fn() })),
}))

jest.mock('@/lib/db/user', () => ({
  userDb: { findById: jest.fn(), findByEmail: jest.fn() },
}))

jest.mock('@/lib/auth-server', () => ({
  ...jest.requireActual('@/lib/auth-server'),
  requireAuth: jest.fn(),
  getSession: jest.fn(),
}))

import { userDb } from '@/lib/db/user'
import { requireAuth } from '@/lib/auth-server'

const mockUserRecord = {
  id: 'user-1',
  email: 'test@example.com',
  password: 'hashed',
  role: 'USER',
  createdAt: new Date(),
  updatedAt: new Date(),
  profile: { firstName: 'John', lastName: 'Doe' },
}

describe('GET /api/auth/me', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns 401 when not authenticated', async () => {
    ;(requireAuth as jest.Mock).mockRejectedValue(new Error('UNAUTHORIZED'))
    const res = await GET()
    const body = await res.json()
    expect(res.status).toBe(401)
    expect(body.success).toBe(false)
  })

  it('returns current user data when authenticated', async () => {
    ;(requireAuth as jest.Mock).mockResolvedValue({ id: 'user-1', email: 'test@example.com', role: 'USER' })
    ;(userDb.findById as jest.Mock).mockResolvedValue(mockUserRecord)
    const res = await GET()
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data.email).toBe('test@example.com')
  })

  it('does not expose password in response', async () => {
    ;(requireAuth as jest.Mock).mockResolvedValue({ id: 'user-1', email: 'test@example.com', role: 'USER' })
    ;(userDb.findById as jest.Mock).mockResolvedValue(mockUserRecord)
    const res = await GET()
    const body = await res.json()
    expect(body.data).not.toHaveProperty('password')
  })
})

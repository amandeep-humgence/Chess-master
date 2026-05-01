/**
 * Tests for POST /api/auth/login
 */
import { POST } from '@/app/api/auth/login/route'

jest.mock('next/headers', () => ({
  cookies: jest.fn(() =>
    Promise.resolve({ get: jest.fn(), set: jest.fn(), delete: jest.fn() })
  ),
}))

jest.mock('@/lib/db/user', () => ({
  userDb: { findByEmail: jest.fn(), create: jest.fn() },
}))

jest.mock('@/lib/hash', () => ({
  comparePassword: jest.fn(),
  hashPassword: jest.fn(),
}))

import { userDb } from '@/lib/db/user'
import { comparePassword } from '@/lib/hash'

const makeRequest = (body: object) =>
  new Request('http://localhost/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  password: 'hashed-password',
  role: 'USER',
  createdAt: new Date(),
  updatedAt: new Date(),
  profile: { firstName: 'John', lastName: 'Doe' },
}

describe('POST /api/auth/login', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns 422 when email is missing', async () => {
    const res = await POST(makeRequest({ password: 'secret123' }))
    const body = await res.json()
    expect(res.status).toBe(422)
    expect(body.success).toBe(false)
    expect(body.message).toMatch(/Validation failed/)
  })

  it('returns 422 when email is invalid', async () => {
    const res = await POST(makeRequest({ email: 'not-an-email', password: 'secret123' }))
    const body = await res.json()
    expect(res.status).toBe(422)
    expect(body.message).toMatch(/Validation failed/)
  })

  it('returns 422 when password is missing', async () => {
    const res = await POST(makeRequest({ email: 'test@example.com' }))
    expect(res.status).toBe(422)
  })

  it('returns 401 when user does not exist', async () => {
    ;(userDb.findByEmail as jest.Mock).mockResolvedValue(null)
    const res = await POST(makeRequest({ email: 'ghost@example.com', password: 'password123' }))
    const body = await res.json()
    expect(res.status).toBe(401)
    expect(body.message).toBe('Invalid email or password')
  })

  it('returns 401 when password is wrong', async () => {
    ;(userDb.findByEmail as jest.Mock).mockResolvedValue(mockUser)
    ;(comparePassword as jest.Mock).mockResolvedValue(false)
    const res = await POST(makeRequest({ email: 'test@example.com', password: 'wrongpassword' }))
    const body = await res.json()
    expect(res.status).toBe(401)
    expect(body.message).toBe('Invalid email or password')
  })

  it('returns 200 and user data on valid credentials', async () => {
    ;(userDb.findByEmail as jest.Mock).mockResolvedValue(mockUser)
    ;(comparePassword as jest.Mock).mockResolvedValue(true)
    const res = await POST(makeRequest({ email: 'test@example.com', password: 'correct-password' }))
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data.email).toBe('test@example.com')
  })

  it('does not expose password hash in response', async () => {
    ;(userDb.findByEmail as jest.Mock).mockResolvedValue(mockUser)
    ;(comparePassword as jest.Mock).mockResolvedValue(true)
    const res = await POST(makeRequest({ email: 'test@example.com', password: 'correct-password' }))
    const body = await res.json()
    expect(body.data).not.toHaveProperty('password')
  })
})

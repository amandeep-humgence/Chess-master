/**
 * Tests for POST /api/auth/register
 */
import { POST } from '@/app/api/auth/register/route'

jest.mock('next/headers', () => ({
  cookies: jest.fn(() =>
    Promise.resolve({ get: jest.fn(), set: jest.fn(), delete: jest.fn() })
  ),
}))

jest.mock('@/lib/db/user', () => ({
  userDb: { findByEmail: jest.fn(), create: jest.fn() },
}))

jest.mock('@/lib/hash', () => ({
  hashPassword: jest.fn(() => Promise.resolve('hashed')),
  comparePassword: jest.fn(),
}))

import { userDb } from '@/lib/db/user'

const makeRequest = (body: object) =>
  new Request('http://localhost/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

const validPayload = {
  email: 'newuser@example.com',
  password: 'Password123',
  firstName: 'Jane',
  lastName: 'Doe',
}

const createdUser = {
  id: 'user-2',
  email: 'newuser@example.com',
  password: 'hashed',
  role: 'USER',
  createdAt: new Date(),
  updatedAt: new Date(),
  profile: { firstName: 'Jane', lastName: 'Doe' },
}

describe('POST /api/auth/register', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns 422 when email is missing', async () => {
    const res = await POST(makeRequest({ password: 'Password123', firstName: 'Jane', lastName: 'Doe' }))
    expect(res.status).toBe(422)
  })

  it('returns 422 when password is too short (< 8 chars)', async () => {
    const res = await POST(makeRequest({ ...validPayload, password: 'short' }))
    const body = await res.json()
    expect(res.status).toBe(422)
    expect(body.message).toMatch(/Validation failed/)
  })

  it('returns 422 when firstName is missing', async () => {
    const res = await POST(makeRequest({ email: 'a@b.com', password: 'Password123', lastName: 'Doe' }))
    expect(res.status).toBe(422)
  })

  it('returns 422 when lastName is missing', async () => {
    const res = await POST(makeRequest({ email: 'a@b.com', password: 'Password123', firstName: 'Jane' }))
    expect(res.status).toBe(422)
  })

  it('returns 400 when email is already in use', async () => {
    ;(userDb.findByEmail as jest.Mock).mockResolvedValue(createdUser)
    const res = await POST(makeRequest(validPayload))
    const body = await res.json()
    expect(res.status).toBe(400)
    expect(body.message).toBe('Email already in use')
  })

  it('returns 201 and user data on successful registration', async () => {
    ;(userDb.findByEmail as jest.Mock).mockResolvedValue(null)
    ;(userDb.create as jest.Mock).mockResolvedValue(createdUser)
    const res = await POST(makeRequest(validPayload))
    const body = await res.json()
    expect(res.status).toBe(201)
    expect(body.success).toBe(true)
    expect(body.data.email).toBe('newuser@example.com')
  })

  it('does not expose password hash in response', async () => {
    ;(userDb.findByEmail as jest.Mock).mockResolvedValue(null)
    ;(userDb.create as jest.Mock).mockResolvedValue(createdUser)
    const res = await POST(makeRequest(validPayload))
    const body = await res.json()
    expect(body.data).not.toHaveProperty('password')
  })
})

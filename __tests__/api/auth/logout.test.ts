/**
 * Tests for POST /api/auth/logout
 */
import { POST } from '@/app/api/auth/logout/route'

const mockDelete = jest.fn()

jest.mock('next/headers', () => ({
  cookies: jest.fn(() => Promise.resolve({ get: jest.fn(), set: jest.fn(), delete: mockDelete })),
}))

describe('POST /api/auth/logout', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns 200 with success message', async () => {
    const res = await POST()
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.message).toBe('Logged out successfully')
  })

  it('deletes the token cookie', async () => {
    await POST()
    expect(mockDelete).toHaveBeenCalledWith('token')
  })
})

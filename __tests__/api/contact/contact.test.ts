/**
 * Tests for POST /api/contact
 */
import { POST } from '@/app/api/contact/route'

jest.mock('@/lib/db/contact', () => ({
  contactDb: { create: jest.fn() },
}))

import { contactDb } from '@/lib/db/contact'

const makeRequest = (body: object) =>
  new Request('http://localhost/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

const validPayload = {
  name: 'John Doe',
  email: 'john@example.com',
  subject: 'Tournament Question',
  message: 'I have a question about the upcoming tournament registration.',
}

describe('POST /api/contact', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns 422 when name is missing', async () => {
    const res = await POST(makeRequest({ ...validPayload, name: '' }))
    expect(res.status).toBe(422)
  })

  it('returns 422 when email is invalid', async () => {
    const res = await POST(makeRequest({ ...validPayload, email: 'not-an-email' }))
    const body = await res.json()
    expect(res.status).toBe(422)
    expect(body.message).toMatch(/Validation failed/)
  })

  it('returns 422 when subject is missing', async () => {
    const res = await POST(makeRequest({ ...validPayload, subject: '' }))
    expect(res.status).toBe(422)
  })

  it('returns 422 when message is too short (< 10 chars)', async () => {
    const res = await POST(makeRequest({ ...validPayload, message: 'Too short' }))
    expect(res.status).toBe(422)
  })

  it('returns 201 on successful message submission', async () => {
    ;(contactDb.create as jest.Mock).mockResolvedValue({ id: 'msg-1' })
    const res = await POST(makeRequest(validPayload))
    const body = await res.json()
    expect(res.status).toBe(201)
    expect(body.success).toBe(true)
    expect(body.message).toBe('Message sent successfully')
    expect(contactDb.create).toHaveBeenCalledWith(validPayload)
  })
})

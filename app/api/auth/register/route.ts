export const dynamic = 'force-dynamic'

import { cookies } from 'next/headers'
import { userDb } from '@/lib/db/user'
import { hashPassword } from '@/lib/hash'
import { signToken, COOKIE_OPTIONS } from '@/lib/auth-server'
import { successResponse, errorResponse } from '@/lib/api-helpers'
import { registerSchema } from '@/lib/validators/auth'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const result = registerSchema.safeParse(body)
    if (!result.success) {
      const messages = result.error.errors.map((e) => e.message).join(', ')
      return errorResponse(`Validation failed: ${messages}`, 422)
    }

    const { email, password, firstName, lastName } = result.data
    const existing = await userDb.findByEmail(email)
    if (existing) return errorResponse('Email already in use', 400)

    const hashed = await hashPassword(password)
    const user = await userDb.create({ email, password: hashed, profile: { firstName, lastName } })

    const token = signToken({ id: user.id, email: user.email, role: user.role as 'USER' | 'ADMIN' })
    const cookieStore = await cookies()
    cookieStore.set('token', token, COOKIE_OPTIONS)

    const { password: _p, ...safeUser } = user
    return successResponse(safeUser, 'Account created successfully', 201)
  } catch (err) {
    return errorResponse((err as Error).message)
  }
}

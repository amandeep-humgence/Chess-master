export const dynamic = 'force-dynamic'

import { cookies } from 'next/headers'
import { userDb } from '@/lib/db/user'
import { comparePassword } from '@/lib/hash'
import { signToken, COOKIE_OPTIONS } from '@/lib/auth-server'
import { successResponse, errorResponse } from '@/lib/api-helpers'
import { loginSchema } from '@/lib/validators/auth'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const result = loginSchema.safeParse(body)
    if (!result.success) {
      const messages = result.error.errors.map((e) => e.message).join(', ')
      return errorResponse(`Validation failed: ${messages}`, 422)
    }

    const { email, password } = result.data
    const user = await userDb.findByEmail(email)
    if (!user) return errorResponse('Invalid email or password', 401)

    const valid = await comparePassword(password, user.password)
    if (!valid) return errorResponse('Invalid email or password', 401)

    const token = signToken({ id: user.id, email: user.email, role: user.role as 'USER' | 'ADMIN' })
    const cookieStore = await cookies()
    cookieStore.set('token', token, COOKIE_OPTIONS)

    const { password: _p, ...safeUser } = user
    return successResponse(safeUser, 'Logged in successfully')
  } catch (err) {
    return errorResponse((err as Error).message)
  }
}

import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

export type UserRole = 'USER' | 'ADMIN'

export interface AuthUser {
  id: string
  email: string
  role: UserRole
}

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60,
  path: '/',
}

export function signToken(payload: AuthUser): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  })
}

export function verifyToken(token: string): AuthUser {
  return jwt.verify(token, JWT_SECRET) as AuthUser
}

export async function getSession(): Promise<AuthUser | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  if (!token) return null
  try {
    return verifyToken(token)
  } catch {
    return null
  }
}

export async function requireAuth(): Promise<AuthUser> {
  const session = await getSession()
  if (!session) throw new Error('UNAUTHORIZED')
  return session
}

export async function requireAdmin(): Promise<AuthUser> {
  const session = await requireAuth()
  if (session.role !== 'ADMIN') throw new Error('FORBIDDEN')
  return session
}

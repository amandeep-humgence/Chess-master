import jwt from 'jsonwebtoken'
import { config } from '../config/env'
import type { AuthUser } from '../types'

export function signToken(payload: AuthUser): string {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn as jwt.SignOptions['expiresIn'],
  })
}

export function verifyToken(token: string): AuthUser {
  return jwt.verify(token, config.jwt.secret) as AuthUser
}

import type { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../utils/jwt'
import { sendError } from '../utils/apiResponse'
import type { AuthUser } from '../types'

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const token = req.cookies?.token as string | undefined
  if (!token) {
    sendError(res, 'Unauthorized — please log in', 401)
    return
  }
  try {
    req.user = verifyToken(token)
    next()
  } catch {
    sendError(res, 'Invalid or expired session', 401)
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.user || req.user.role !== 'ADMIN') {
    sendError(res, 'Forbidden — admin access required', 403)
    return
  }
  next()
}

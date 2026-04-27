import type { Request, Response } from 'express'
import { authService } from '../services/auth.service'
import { sendSuccess, sendError } from '../utils/apiResponse'

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
}

export const authController = {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { user, token } = await authService.register(req.body)
      res.cookie('token', token, COOKIE_OPTIONS)
      const { password: _p, ...safeUser } = user
      sendSuccess(res, safeUser, 'Account created successfully', 201)
    } catch (err) {
      sendError(res, (err as Error).message, 400)
    }
  },

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { user, token } = await authService.login(req.body)
      res.cookie('token', token, COOKIE_OPTIONS)
      const { password: _p, ...safeUser } = user
      sendSuccess(res, safeUser, 'Logged in successfully')
    } catch (err) {
      sendError(res, (err as Error).message, 401)
    }
  },

  logout(_req: Request, res: Response): void {
    res.clearCookie('token')
    sendSuccess(res, null, 'Logged out successfully')
  },

  async me(req: Request, res: Response): Promise<void> {
    try {
      const user = await authService.me(req.user!.id)
      const { password: _p, ...safeUser } = user
      sendSuccess(res, safeUser)
    } catch (err) {
      sendError(res, (err as Error).message, 404)
    }
  },
}

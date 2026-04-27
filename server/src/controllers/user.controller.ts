import type { Request, Response } from 'express'
import { userService } from '../services/user.service'
import { sendSuccess, sendError } from '../utils/apiResponse'

export const userController = {
  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const user = await userService.getProfile(req.user!.id)
      const { password: _p, ...safeUser } = user
      sendSuccess(res, safeUser)
    } catch (err) {
      sendError(res, (err as Error).message, 404)
    }
  },

  async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const profile = await userService.updateProfile(
        req.user!.id,
        req.body,
        req.file
      )
      sendSuccess(res, profile, 'Profile updated')
    } catch (err) {
      sendError(res, (err as Error).message, 400)
    }
  },

  async getPublicProfile(req: Request, res: Response): Promise<void> {
    try {
      const user = await userService.getPublicProfile(req.params.id)
      sendSuccess(res, user)
    } catch (err) {
      sendError(res, (err as Error).message, 404)
    }
  },

  async getUserPosts(req: Request, res: Response): Promise<void> {
    try {
      const posts = await userService.getUserPosts(req.params.id)
      sendSuccess(res, posts)
    } catch (err) {
      sendError(res, (err as Error).message, 404)
    }
  },
}

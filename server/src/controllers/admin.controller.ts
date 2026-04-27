import type { Request, Response } from 'express'
import { adminService } from '../services/admin.service'
import { sendSuccess, sendError } from '../utils/apiResponse'

export const adminController = {
  async getDashboardStats(_req: Request, res: Response): Promise<void> {
    try {
      const stats = await adminService.getDashboardStats()
      sendSuccess(res, stats)
    } catch (err) {
      sendError(res, (err as Error).message)
    }
  },

  async listUsers(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 20
      const result = await adminService.listUsers(page, limit)
      sendSuccess(res, result)
    } catch (err) {
      sendError(res, (err as Error).message)
    }
  },

  async listRegistrations(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 20
      const result = await adminService.listRegistrations(page, limit)
      sendSuccess(res, result)
    } catch (err) {
      sendError(res, (err as Error).message)
    }
  },

  async listPayments(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 20
      const result = await adminService.listPayments(page, limit)
      sendSuccess(res, result)
    } catch (err) {
      sendError(res, (err as Error).message)
    }
  },

  async listPosts(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 20
      const result = await adminService.listPosts(page, limit)
      sendSuccess(res, result)
    } catch (err) {
      sendError(res, (err as Error).message)
    }
  },

  async deletePost(req: Request, res: Response): Promise<void> {
    try {
      await adminService.deletePost(req.params.id)
      sendSuccess(res, null, 'Post removed')
    } catch (err) {
      sendError(res, (err as Error).message, 404)
    }
  },
}

import type { Request, Response } from 'express'
import { contactService } from '../services/contact.service'
import { sendSuccess, sendError } from '../utils/apiResponse'

export const contactController = {
  async submit(req: Request, res: Response): Promise<void> {
    try {
      await contactService.submit(req.body)
      sendSuccess(res, null, 'Message sent successfully', 201)
    } catch (err) {
      sendError(res, (err as Error).message)
    }
  },

  async listAll(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 20
      const result = await contactService.listAll(page, limit)
      sendSuccess(res, result)
    } catch (err) {
      sendError(res, (err as Error).message)
    }
  },

  async markRead(req: Request, res: Response): Promise<void> {
    try {
      await contactService.markRead(req.params.id)
      sendSuccess(res, null, 'Marked as read')
    } catch (err) {
      sendError(res, (err as Error).message, 404)
    }
  },
}

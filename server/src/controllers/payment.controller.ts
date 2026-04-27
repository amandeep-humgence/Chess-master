import type { Request, Response } from 'express'
import { paymentService } from '../services/payment.service'
import { sendSuccess, sendError } from '../utils/apiResponse'

export const paymentController = {
  async createOrder(req: Request, res: Response): Promise<void> {
    try {
      const { tournamentId } = req.body
      if (!tournamentId) {
        sendError(res, 'tournamentId is required', 400)
        return
      }
      const order = await paymentService.createOrder(req.user!.id, tournamentId)
      sendSuccess(res, order, 'Order created', 201)
    } catch (err) {
      sendError(res, (err as Error).message)
    }
  },

  async verifyPayment(req: Request, res: Response): Promise<void> {
    try {
      const result = await paymentService.verifyPayment(req.body, req.user!.id)
      sendSuccess(res, result, 'Payment verified and registration confirmed')
    } catch (err) {
      sendError(res, (err as Error).message, 400)
    }
  },

  async webhook(req: Request, res: Response): Promise<void> {
    try {
      const signature = req.headers['x-razorpay-signature'] as string
      const rawBody = (req.body as Buffer).toString('utf-8')
      const result = await paymentService.handleWebhook(rawBody, signature)
      sendSuccess(res, result)
    } catch (err) {
      sendError(res, (err as Error).message, 400)
    }
  },

  async getHistory(req: Request, res: Response): Promise<void> {
    try {
      const history = await paymentService.getUserHistory(req.user!.id)
      sendSuccess(res, history)
    } catch (err) {
      sendError(res, (err as Error).message)
    }
  },
}

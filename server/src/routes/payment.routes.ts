import { Router } from 'express'
import { paymentController } from '../controllers/payment.controller'
import { authenticate } from '../middlewares/auth.middleware'

const router = Router()

// Webhook must be mounted BEFORE express.json() in index.ts (raw body needed)
router.post('/webhook', paymentController.webhook)
router.post('/create-order', authenticate, paymentController.createOrder)
router.post('/verify', authenticate, paymentController.verifyPayment)
router.get('/history', authenticate, paymentController.getHistory)

export default router

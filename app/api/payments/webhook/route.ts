import { paymentDb } from '@/lib/db/payment'
import { verifyWebhookSignature } from '@/lib/razorpay'
import { successResponse, errorResponse } from '@/lib/api-helpers'

export async function POST(request: Request) {
  try {
    const signature = request.headers.get('x-razorpay-signature') ?? ''
    const rawBody = await request.text()

    const isValid = verifyWebhookSignature(rawBody, signature)
    if (!isValid) return errorResponse('Invalid webhook signature', 400)

    const event = JSON.parse(rawBody) as {
      event: string
      payload: { payment: { entity: { order_id: string; id: string } } }
    }

    if (event.event === 'payment.failed') {
      const orderId = event.payload.payment.entity.order_id
      const payment = await paymentDb.findByRazorpayOrderId(orderId)
      if (payment) {
        await paymentDb.updateStatus(payment.id, { status: 'FAILED' })
      }
    }

    return successResponse({ received: true })
  } catch (err) {
    return errorResponse((err as Error).message)
  }
}

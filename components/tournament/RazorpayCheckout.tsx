'use client'

import { useCallback } from 'react'
import Button from '../ui/Button'
import api from '../../lib/api'
import type { TournamentDTO } from '../../types'

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => { open: () => void }
  }
}

interface RazorpayOptions {
  key: string
  amount: number
  currency: string
  name: string
  description: string
  order_id: string
  handler: (response: {
    razorpay_order_id: string
    razorpay_payment_id: string
    razorpay_signature: string
  }) => void
  prefill?: { email?: string; name?: string }
  theme?: { color: string }
}

interface Props {
  tournament: TournamentDTO
  userEmail?: string
  onSuccess: () => void
  onError: (msg: string) => void
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return }
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.head.appendChild(script)
  })
}

export default function RazorpayCheckout({ tournament, userEmail, onSuccess, onError }: Props) {
  const handlePay = useCallback(async () => {
    try {
      const loaded = await loadRazorpayScript()
      if (!loaded) { onError('Failed to load payment gateway'); return }

      const res = await api.post<{ data: { orderId: string; amount: number; currency: string; keyId: string } }>(
        '/api/payments/create-order',
        { tournamentId: tournament.id }
      )
      const { orderId, amount, currency, keyId } = res.data.data

      const rzp = new window.Razorpay({
        key: keyId,
        amount,
        currency,
        name: 'ChessMaster',
        description: `Registration: ${tournament.title}`,
        order_id: orderId,
        prefill: { email: userEmail },
        theme: { color: '#f0b429' },
        handler: async (response) => {
          try {
            await api.post('/api/payments/verify', {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              tournamentId: tournament.id,
            })
            onSuccess()
          } catch (err) {
            onError((err as Error).message)
          }
        },
      })

      rzp.open()
    } catch (err) {
      onError((err as Error).message)
    }
  }, [tournament, userEmail, onSuccess, onError])

  return (
    <Button onClick={handlePay} size="lg" className="w-full">
      Pay ₹{tournament.entryFee.toLocaleString('en-IN')} & Register
    </Button>
  )
}

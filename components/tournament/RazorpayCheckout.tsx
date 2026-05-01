'use client'

import { useCallback } from 'react'
import Button from '../ui/Button'
import { supabase } from '../../lib/supabase/client'
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
  modal?: { ondismiss?: () => void; escape?: boolean }
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

      const token = (await supabase.auth.getSession()).data.session?.access_token
      if (!token) { onError('Please sign in to continue'); return }

      const res = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ tournamentId: tournament.id }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.message || 'Unable to create payment order')
      const { orderId, amount, currency, keyId } = json.data

      const rzp = new window.Razorpay({
        key: keyId,
        amount,
        currency,
        name: 'ChessMaster',
        description: `Registration: ${tournament.title}`,
        order_id: orderId,
        prefill: { email: userEmail },
        theme: { color: '#f0b429' },
        modal: {
          escape: false,
          ondismiss: () => onError('Payment cancelled'),
        },
        handler: async (response) => {
          try {
            const verifyRes = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                tournamentId: tournament.id,
              }),
            })
            const verifyJson = await verifyRes.json()
            if (!verifyRes.ok) throw new Error(verifyJson.message || 'Payment verification failed')
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

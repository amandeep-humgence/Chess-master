'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'
import { Mail, MessageSquare, CheckCircle } from 'lucide-react'
import api from '../../lib/api'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'

const schema = z.object({
  name: z.string().min(1, 'Required'),
  email: z.string().email(),
  subject: z.string().min(1, 'Required'),
  message: z.string().min(10, 'Too short'),
})
type FormData = z.infer<typeof schema>

export default function ContactPage() {
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    try {
      setError('')
      await api.post('/api/contact', data)
      setSent(true)
    } catch (err) {
      setError((err as Error).message)
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <div className="mb-10 text-center">
        <div className="mx-auto mb-4 w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
          <MessageSquare size={22} className="text-amber-400" />
        </div>
        <h1 className="text-3xl font-bold text-slate-100">Contact Us</h1>
        <p className="mt-2 text-slate-400">Have a question or want to organize a tournament?</p>
      </div>

      {sent ? (
        <div className="flex flex-col items-center gap-4 rounded-xl border border-green-500/30 bg-green-500/10 p-10 text-center">
          <CheckCircle size={40} className="text-green-400" />
          <h2 className="text-xl font-semibold text-slate-100">Message Sent!</h2>
          <p className="text-slate-400">We&apos;ll get back to you within 24 hours.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-700/50 bg-slate-800/60 p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            {error && (
              <p className="rounded-lg bg-red-500/20 border border-red-500/30 px-4 py-2 text-sm text-red-400">{error}</p>
            )}
            <div className="grid grid-cols-2 gap-3">
              <Input label="Name" placeholder="John Doe" error={errors.name?.message} {...register('name')} />
              <Input label="Email" type="email" placeholder="you@example.com" error={errors.email?.message} {...register('email')} />
            </div>
            <Input label="Subject" placeholder="Tournament inquiry…" error={errors.subject?.message} {...register('subject')} />
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-300">Message</label>
              <textarea rows={5} placeholder="Your message…" className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500" {...register('message')} />
              {errors.message && <p className="text-xs text-red-400">{errors.message.message}</p>}
            </div>
            <Button type="submit" loading={isSubmitting} className="w-full">
              <Mail size={15} /> Send Message
            </Button>
          </form>
        </div>
      )}
    </div>
  )
}

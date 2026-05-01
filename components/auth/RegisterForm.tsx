'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabaseData } from '../../lib/supabase/data'
import { useAuthStore } from '../../lib/store/authStore'
import Input from '../ui/Input'
import Button from '../ui/Button'
import { useState } from 'react'

const schema = z.object({
  firstName: z.string().min(1, 'Required'),
  lastName: z.string().min(1, 'Required'),
  email: z.string().email(),
  password: z.string().min(8, 'At least 8 characters'),
})

type FormData = z.infer<typeof schema>

export default function RegisterForm() {
  const router = useRouter()
  const { setUser } = useAuthStore()
  const [serverError, setServerError] = useState('')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    try {
      setServerError('')
      const user = await supabaseData.auth.register(data)
      setUser(user)
      router.push('/dashboard')
    } catch (err) {
      setServerError((err as Error).message)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      {serverError && (
        <p className="rounded-lg bg-red-500/20 border border-red-500/30 px-4 py-2 text-sm text-red-400">
          {serverError}
        </p>
      )}
      <div className="grid grid-cols-2 gap-3">
        <Input label="First Name" placeholder="John" error={errors.firstName?.message} {...register('firstName')} />
        <Input label="Last Name" placeholder="Doe" error={errors.lastName?.message} {...register('lastName')} />
      </div>
      <Input label="Email" type="email" placeholder="you@example.com" error={errors.email?.message} {...register('email')} />
      <Input label="Password" type="password" placeholder="Min. 8 characters" error={errors.password?.message} {...register('password')} />
      <Button type="submit" loading={isSubmitting} className="w-full mt-1">
        Create Account
      </Button>
      <p className="text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link href="/auth/login" className="text-amber-400 hover:text-amber-300">
          Sign in
        </Link>
      </p>
    </form>
  )
}

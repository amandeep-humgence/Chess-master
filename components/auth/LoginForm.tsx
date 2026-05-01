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
  email: z.string().email(),
  password: z.string().min(1, 'Password required'),
})

type FormData = z.infer<typeof schema>

export default function LoginForm() {
  const router = useRouter()
  const { setUser } = useAuthStore()
  const [serverError, setServerError] = useState('')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    try {
      setServerError('')
      const user = await supabaseData.auth.login(data.email, data.password)
      setUser(user)
      router.push(user.role === 'ADMIN' ? '/admin' : '/dashboard')
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
      <Input
        label="Email"
        type="email"
        placeholder="you@example.com"
        error={errors.email?.message}
        {...register('email')}
      />
      <Input
        label="Password"
        type="password"
        placeholder="••••••••"
        error={errors.password?.message}
        {...register('password')}
      />
      <Button type="submit" loading={isSubmitting} className="w-full mt-1">
        Sign In
      </Button>
      <p className="text-center text-sm text-slate-500">
        No account?{' '}
        <Link href="/auth/register" className="text-amber-400 hover:text-amber-300">
          Register
        </Link>
      </p>
    </form>
  )
}

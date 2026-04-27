'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Input from '../ui/Input'
import Button from '../ui/Button'
import type { TournamentDTO } from '../../types'
import { useState } from 'react'

const schema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  startDate: z.string().min(1, 'Required'),
  endDate: z.string().min(1, 'Required'),
  location: z.string().min(2),
  entryFee: z.coerce.number().nonnegative(),
  prizePool: z.coerce.number().nonnegative(),
  maxPlayers: z.coerce.number().int().min(2),
})

type FormData = z.infer<typeof schema>

interface TournamentFormProps {
  initial?: Partial<TournamentDTO>
  onSubmit: (data: FormData) => Promise<void>
  onCancel: () => void
}

function toDatetimeLocal(isoString?: string): string {
  if (!isoString) return ''
  return new Date(isoString).toISOString().slice(0, 16)
}

export default function TournamentForm({ initial, onSubmit, onCancel }: TournamentFormProps) {
  const [serverError, setServerError] = useState('')
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: initial?.title || '',
      description: initial?.description || '',
      startDate: toDatetimeLocal(initial?.startDate),
      endDate: toDatetimeLocal(initial?.endDate),
      location: initial?.location || '',
      entryFee: initial?.entryFee || 0,
      prizePool: initial?.prizePool || 0,
      maxPlayers: initial?.maxPlayers || 32,
    },
  })

  const handleFormSubmit = async (data: FormData) => {
    try {
      setServerError('')
      const payload = {
        ...data,
        startDate: new Date(data.startDate).toISOString(),
        endDate: new Date(data.endDate).toISOString(),
      }
      await onSubmit(payload)
    } catch (err) {
      setServerError((err as Error).message)
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-4">
      {serverError && (
        <p className="rounded-lg bg-red-500/20 border border-red-500/30 px-4 py-2 text-sm text-red-400">
          {serverError}
        </p>
      )}
      <Input label="Title" error={errors.title?.message} {...register('title')} />
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-slate-300">Description</label>
        <textarea
          rows={3}
          className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
          {...register('description')}
        />
        {errors.description && <p className="text-xs text-red-400">{errors.description.message}</p>}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input label="Start Date" type="datetime-local" error={errors.startDate?.message} {...register('startDate')} />
        <Input label="End Date" type="datetime-local" error={errors.endDate?.message} {...register('endDate')} />
      </div>
      <Input label="Location" error={errors.location?.message} {...register('location')} />
      <div className="grid grid-cols-3 gap-3">
        <Input label="Entry Fee (₹)" type="number" min={0} error={errors.entryFee?.message} {...register('entryFee')} />
        <Input label="Prize Pool (₹)" type="number" min={0} error={errors.prizePool?.message} {...register('prizePool')} />
        <Input label="Max Players" type="number" min={2} error={errors.maxPlayers?.message} {...register('maxPlayers')} />
      </div>
      <div className="flex gap-3 pt-2">
        <Button type="submit" loading={isSubmitting} className="flex-1">
          {initial ? 'Update Tournament' : 'Create Tournament'}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  )
}

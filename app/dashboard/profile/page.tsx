'use client'

import { useRef, useState } from 'react'
import { useAuthStore } from '../../../lib/store/authStore'
import api from '../../../lib/api'
import Input from '../../../components/ui/Input'
import Button from '../../../components/ui/Button'
import Avatar from '../../../components/ui/Avatar'
import type { UserDTO } from '../../../types'
import { Camera } from 'lucide-react'

export default function ProfilePage() {
  const { user, setUser } = useAuthStore()
  const fileRef = useRef<HTMLInputElement>(null)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    firstName: user?.profile?.firstName || '',
    lastName: user?.profile?.lastName || '',
    bio: user?.profile?.bio || '',
    phone: user?.profile?.phone || '',
    chessRating: user?.profile?.chessRating?.toString() || '',
  })

  const name = user?.profile
    ? `${user.profile.firstName} ${user.profile.lastName}`
    : user?.email || ''

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSuccess(false)
    setError('')
    try {
      const formData = new FormData()
      Object.entries(form).forEach(([k, v]) => {
        if (v) formData.append(k, v)
      })
      const fileInput = fileRef.current
      if (fileInput?.files?.[0]) formData.append('image', fileInput.files[0])

      const res = await api.put<{ data: UserDTO }>('/api/users/me/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      const updatedMe = await api.get<{ data: UserDTO }>('/api/auth/me')
      setUser(updatedMe.data.data)
      setSuccess(true)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="mb-6 text-xl font-bold text-slate-100">Edit Profile</h1>

      <div className="rounded-xl border border-slate-700/50 bg-slate-800/60 p-6">
        {/* Avatar upload */}
        <div className="mb-6 flex items-center gap-4">
          <div className="relative">
            <Avatar src={user?.profile?.avatar} alt={name} size="xl" />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="absolute bottom-0 right-0 rounded-full bg-amber-500 p-1.5 text-slate-900 hover:bg-amber-400"
            >
              <Camera size={14} />
            </button>
          </div>
          <div>
            <p className="font-medium text-slate-200">{name}</p>
            <p className="text-sm text-slate-500">{user?.email}</p>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" />
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {success && <p className="rounded-lg bg-green-500/20 border border-green-500/30 px-4 py-2 text-sm text-green-400">Profile updated!</p>}
          {error && <p className="rounded-lg bg-red-500/20 border border-red-500/30 px-4 py-2 text-sm text-red-400">{error}</p>}

          <div className="grid grid-cols-2 gap-3">
            <Input label="First Name" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
            <Input label="Last Name" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-300">Bio</label>
            <textarea rows={3} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })}
              className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <Input label="Chess Rating" type="number" value={form.chessRating} onChange={(e) => setForm({ ...form, chessRating: e.target.value })} />
          </div>

          <Button type="submit" loading={loading}>Save Changes</Button>
        </form>
      </div>
    </div>
  )
}

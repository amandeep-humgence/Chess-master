import { Crown } from 'lucide-react'
import LoginForm from '../../../components/auth/LoginForm'

export default function LoginPage() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/20">
            <Crown size={24} className="fill-amber-400 text-amber-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100">Welcome back</h1>
          <p className="mt-1 text-sm text-slate-500">Sign in to your ChessMaster account</p>
        </div>
        <div className="rounded-xl border border-slate-700/50 bg-slate-800/60 p-6">
          <LoginForm />
        </div>
      </div>
    </div>
  )
}

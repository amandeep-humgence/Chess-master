import Link from 'next/link'
import { Crown, Github, Twitter } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-900 py-10 mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div>
            <div className="flex items-center gap-2 text-amber-400 mb-3">
              <Crown size={20} className="fill-amber-500" />
              <span className="font-bold">ChessMaster</span>
            </div>
            <p className="text-sm text-slate-500">
              The premier platform for competitive chess tournaments.
            </p>
          </div>
          <div>
            <p className="mb-3 text-sm font-semibold text-slate-300">Platform</p>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><Link href="/tournaments" className="hover:text-slate-300 transition-colors">Tournaments</Link></li>
              <li><Link href="/feed" className="hover:text-slate-300 transition-colors">Social Feed</Link></li>
              <li><Link href="/about" className="hover:text-slate-300 transition-colors">About</Link></li>
            </ul>
          </div>
          <div>
            <p className="mb-3 text-sm font-semibold text-slate-300">Support</p>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><Link href="/contact" className="hover:text-slate-300 transition-colors">Contact Us</Link></li>
              <li><Link href="/auth/register" className="hover:text-slate-300 transition-colors">Join Now</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 flex items-center justify-between border-t border-slate-800 pt-6">
          <p className="text-xs text-slate-600">
            © {new Date().getFullYear()} ChessMaster. All rights reserved.
          </p>
          <div className="flex gap-4 text-slate-600">
            <a href="#" className="hover:text-slate-400 transition-colors"><Github size={16} /></a>
            <a href="#" className="hover:text-slate-400 transition-colors"><Twitter size={16} /></a>
          </div>
        </div>
      </div>
    </footer>
  )
}

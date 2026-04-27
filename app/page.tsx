'use client'

import Link from 'next/link'
import Image from 'next/image'
import {
  Crown, Trophy, Users, Shield, ChevronRight, Calendar,
  UserPlus, Search, Star, CreditCard, Clock, BarChart3,
  Layers, MessageSquare, CheckCircle2, ArrowRight,
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import api from '../lib/api'
import TournamentCard from '../components/tournament/TournamentCard'
import type { TournamentDTO } from '../types'

function StatPill({ icon: Icon, label, value }: { icon: typeof Crown; label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-xl border border-slate-700/50 bg-slate-800/60 px-6 py-4">
      <Icon size={20} className="text-amber-400" />
      <span className="text-2xl font-bold text-slate-100">{value}</span>
      <span className="text-xs text-slate-500">{label}</span>
    </div>
  )
}

function StepCard({ step, icon: Icon, title, desc }: { step: number; icon: typeof UserPlus; title: string; desc: string }) {
  return (
    <div className="relative flex flex-col items-center text-center px-4">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/10">
        <Icon size={28} className="text-amber-400" />
      </div>
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-slate-900">
        {step}
      </div>
      <h3 className="mb-2 text-base font-semibold text-slate-100">{title}</h3>
      <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
    </div>
  )
}

function FeatureCard({ icon: Icon, title, desc }: { icon: typeof Shield; title: string; desc: string }) {
  return (
    <div className="group rounded-2xl border border-slate-700/50 bg-slate-800/40 p-5 transition-all duration-200 hover:border-amber-500/30 hover:bg-slate-800/70">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 group-hover:bg-amber-500/20 transition-colors">
        <Icon size={20} className="text-amber-400" />
      </div>
      <h3 className="mb-1.5 text-sm font-semibold text-slate-100">{title}</h3>
      <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
    </div>
  )
}

const features = [
  { icon: CreditCard, title: 'Secure Payments', desc: 'Powered by Razorpay — fast, safe entry fee collection with instant confirmation.' },
  { icon: Clock, title: 'Multiple Formats', desc: 'Blitz, Rapid, Classical — tournaments for every time control and play style.' },
  { icon: BarChart3, title: 'Live Standings', desc: 'Real-time leaderboards updated as rounds progress. Track every move.' },
  { icon: Users, title: 'Active Community', desc: 'Connect with players, share analysis, and follow the social chess feed.' },
  { icon: Trophy, title: 'Cash Prizes', desc: 'Compete for real prize pools ranging from ₹1,000 to ₹1,00,000+.' },
  { icon: Layers, title: 'All Skill Levels', desc: 'Separate categories for beginners, intermediate, and advanced players.' },
]

const perks = [
  'Free account — no hidden fees to join',
  'Instant registration for open tournaments',
  'Profile with ELO rating & tournament history',
  'Social feed to share games & analysis',
  'Mobile-friendly — play from anywhere',
]

export default function HomePage() {
  const { data, isLoading } = useQuery<TournamentDTO[]>({
    queryKey: ['tournaments', 'UPCOMING'],
    queryFn: async () => {
      const res = await api.get<{ data: TournamentDTO[] }>('/api/tournaments?status=UPCOMING')
      return res.data.data.slice(0, 3)
    },
  })

  return (
    <div>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden py-28 px-4 text-center">
        <Image
          src="/images/home-page-banner.jpg"
          alt="Chess tournament banner"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-slate-900/78" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(240,180,41,0.18),transparent)]" />
        <div className="relative mx-auto max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-sm text-amber-400">
            <Crown size={14} className="fill-amber-400" />
            India's Chess Tournament Platform
          </div>
          <h1 className="mb-5 text-5xl font-extrabold tracking-tight text-slate-100 sm:text-6xl">
            Compete. Connect.{' '}
            <span className="bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
              Conquer.
            </span>
          </h1>
          <p className="mb-8 text-lg text-slate-400 max-w-xl mx-auto">
            Join competitive chess tournaments, track your progress, and connect with players across India — all in one place.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/tournaments" className="flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-3 text-sm font-semibold text-slate-900 hover:bg-amber-400 transition-colors">
              Browse Tournaments <ChevronRight size={16} />
            </Link>
            <Link href="/auth/register" className="rounded-xl border border-slate-600 px-6 py-3 text-sm font-medium text-slate-300 hover:border-amber-500 hover:text-amber-400 transition-colors">
              Create Free Account
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="py-10 px-4">
        <div className="mx-auto max-w-3xl grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatPill icon={Trophy} label="Tournaments" value="50+" />
          <StatPill icon={Users} label="Players" value="500+" />
          <StatPill icon={Crown} label="Prize Pool" value="₹10L+" />
          <StatPill icon={Shield} label="Secure Payments" value="100%" />
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-16 px-4">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-amber-500">Simple & Fast</p>
            <h2 className="text-3xl font-bold text-slate-100">How It Works</h2>
            <p className="mt-3 text-slate-500 text-sm">Get playing in three easy steps</p>
          </div>
          <div className="relative grid grid-cols-1 gap-10 sm:grid-cols-3">
            {/* connector lines */}
            <div className="absolute top-8 left-1/3 right-1/3 hidden h-px bg-gradient-to-r from-amber-500/20 via-amber-500/50 to-amber-500/20 sm:block" />
            <StepCard step={1} icon={UserPlus} title="Create Your Account" desc="Sign up free in under a minute. Set up your profile and ELO rating." />
            <StepCard step={2} icon={Search} title="Find a Tournament" desc="Browse open tournaments by format, entry fee, or prize pool and register instantly." />
            <StepCard step={3} icon={Star} title="Play & Win Prizes" desc="Compete, climb the leaderboard, and claim your cash prize at the end." />
          </div>
        </div>
      </section>

      {/* ── Upcoming Tournaments ── */}
      <section className="py-10 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-100">
              <Calendar size={20} className="text-amber-400" />
              <h2 className="text-xl font-bold">Upcoming Tournaments</h2>
            </div>
            <Link href="/tournaments" className="text-sm text-amber-400 hover:text-amber-300 flex items-center gap-1">
              View all <ChevronRight size={14} />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-56 animate-pulse rounded-2xl border border-slate-700/50 bg-slate-800/40" />
              ))}
            </div>
          ) : data && data.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {data.map((t) => <TournamentCard key={t.id} tournament={t} />)}
            </div>
          ) : (
            <div className="rounded-xl border border-slate-700/50 bg-slate-800/40 py-16 text-center text-slate-500">
              No upcoming tournaments yet. Check back soon!
            </div>
          )}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-16 px-4 border-y border-slate-800">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-amber-500">Platform Features</p>
            <h2 className="text-3xl font-bold text-slate-100">Everything You Need to Compete</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => <FeatureCard key={f.title} {...f} />)}
          </div>
        </div>
      </section>

      {/* ── Why Join / Perks ── */}
      <section className="py-16 px-4">
        <div className="mx-auto max-w-5xl grid grid-cols-1 gap-10 lg:grid-cols-2 items-center">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-amber-500">Why ChessMaster?</p>
            <h2 className="mb-4 text-3xl font-bold text-slate-100">Built for Serious Players</h2>
            <p className="mb-8 text-slate-500 text-sm leading-relaxed">
              We built ChessMaster to solve everything that's frustrating about managing and joining chess tournaments —
              complicated registrations, slow payment processing, and no community to connect with afterward.
            </p>
            <ul className="space-y-3">
              {perks.map((perk) => (
                <li key={perk} className="flex items-center gap-3 text-sm text-slate-300">
                  <CheckCircle2 size={16} className="shrink-0 text-amber-400" />
                  {perk}
                </li>
              ))}
            </ul>
            <Link
              href="/auth/register"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-3 text-sm font-semibold text-slate-900 hover:bg-amber-400 transition-colors"
            >
              Join for Free <ArrowRight size={15} />
            </Link>
          </div>

          {/* Chess board decorative grid */}
          <div className="grid grid-cols-4 grid-rows-4 gap-1.5 max-w-xs mx-auto lg:ml-auto">
            {Array.from({ length: 16 }).map((_, i) => {
              const row = Math.floor(i / 4)
              const col = i % 4
              const isLight = (row + col) % 2 === 0
              const pieces = ['♟', '♜', '♞', '♝', '♛', '♚', '♟', '♜']
              const hasPiece = i < 4 || i >= 12
              return (
                <div
                  key={i}
                  className={`flex h-14 w-14 items-center justify-center rounded-lg text-2xl
                    ${isLight ? 'bg-amber-500/20 text-amber-400/70' : 'bg-slate-700/40 text-slate-500/60'}`}
                >
                  {hasPiece ? pieces[i < 4 ? i : i - 12] : ''}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Community / Feed Teaser ── */}
      <section className="py-16 px-4 border-t border-slate-800 bg-slate-900/50">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800/60 px-4 py-1.5 text-sm text-slate-400">
            <MessageSquare size={13} className="text-amber-400" />
            Social Feed
          </div>
          <h2 className="mb-4 text-3xl font-bold text-slate-100">Join the Chess Community</h2>
          <p className="mb-8 text-slate-500 text-sm leading-relaxed max-w-lg mx-auto">
            Share game analysis, discuss tournament results, and follow top players on our social feed.
            Chess isn't just about the board — it's about the community around it.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/feed" className="flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-6 py-3 text-sm font-medium text-amber-400 hover:bg-amber-500/20 transition-colors">
              Explore the Feed <ArrowRight size={15} />
            </Link>
            <Link href="/auth/register" className="rounded-xl border border-slate-700 px-6 py-3 text-sm font-medium text-slate-400 hover:border-slate-600 hover:text-slate-300 transition-colors">
              Create Account
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 px-4 bg-gradient-to-r from-amber-900/20 to-amber-800/10 border-y border-amber-900/20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-4xl font-bold text-slate-100 mb-4">Ready to make your move?</h2>
          <p className="text-slate-400 mb-8 text-sm leading-relaxed">
            Register today to join tournaments, earn prizes, and become part of India's fastest-growing chess community.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/auth/register" className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-8 py-3.5 text-sm font-semibold text-slate-900 hover:bg-amber-400 transition-colors">
              Get Started Free <ChevronRight size={16} />
            </Link>
            <Link href="/tournaments" className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-8 py-3.5 text-sm font-medium text-slate-300 hover:border-slate-600 transition-colors">
              Browse Tournaments
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

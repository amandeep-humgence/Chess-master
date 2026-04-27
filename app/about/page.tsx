import { Crown, Target, Users, Trophy } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      {/* Header */}
      <div className="mb-12 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-sm text-amber-400">
          <Crown size={14} className="fill-amber-400" />
          About ChessMaster
        </div>
        <h1 className="text-4xl font-bold text-slate-100 mb-4">
          India&apos;s Premier Chess Tournament Platform
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto">
          ChessMaster brings together chess enthusiasts across India for competitive tournaments, community connection, and skill development.
        </p>
      </div>

      {/* Mission cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-16">
        {[
          { icon: Target, title: 'Our Mission', text: 'Make competitive chess accessible to every player across India, from beginners to grandmasters.' },
          { icon: Users, title: 'Community', text: 'Build a vibrant community of chess players who share their passion, knowledge, and achievements.' },
          { icon: Trophy, title: 'Excellence', text: 'Organize world-class tournaments with transparent prize structures and fair competition.' },
        ].map(({ icon: Icon, title, text }) => (
          <div key={title} className="rounded-xl border border-slate-700/50 bg-slate-800/60 p-6 text-center">
            <div className="mx-auto mb-3 w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <Icon size={22} className="text-amber-400" />
            </div>
            <h3 className="font-semibold text-slate-200 mb-2">{title}</h3>
            <p className="text-sm text-slate-500">{text}</p>
          </div>
        ))}
      </div>

      {/* Story */}
      <div className="rounded-xl border border-slate-700/50 bg-slate-800/40 p-8">
        <h2 className="text-2xl font-bold text-slate-100 mb-4">Our Story</h2>
        <div className="space-y-4 text-slate-400 leading-relaxed">
          <p>
            ChessMaster was founded with a simple belief: every chess player deserves access to quality competitive play, regardless of their location or rating.
          </p>
          <p>
            We handle everything from tournament organization, secure Razorpay-powered registration payments, to post-tournament analytics — so organizers can focus on the game, and players can focus on winning.
          </p>
          <p>
            Join thousands of players who have already made ChessMaster their home for competitive chess in India.
          </p>
        </div>
      </div>
    </div>
  )
}

import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, Zap, Target, RefreshCw, Brain, CheckCircle2, ChevronDown, Star } from 'lucide-react';

const FEATURES = [
  {
    icon: Target,
    title: '30-Min Daily Missions',
    desc: 'Bite-sized DSA missions that fit any schedule. No marathon sessions, no guilt.',
    color: 'brand',
  },
  {
    icon: RefreshCw,
    title: 'Adaptive Scheduling',
    desc: 'Life happens. Tell us, and AI instantly rebuilds your roadmap around your reality.',
    color: 'accent',
  },
  {
    icon: Brain,
    title: 'AI Tutor On-Demand',
    desc: 'Stuck on Two Pointers? Ask NextStep AI for instant, concept-first explanations.',
    color: 'emerald',
  },
  {
    icon: Zap,
    title: 'Streak Engine',
    desc: 'Build momentum with daily streaks. Celebrate milestones, never count missed days.',
    color: 'amber',
  },
];

const MISSIONS_PREVIEW = [
  'Big-O & Time Complexity',
  'Array Manipulation & Memory',
  'Two-Pointer Technique',
  'Hash Maps for Fast Lookups',
  'Binary Search Patterns',
  'Dynamic Programming Intro',
];

const TESTIMONIALS = [
  { name: 'Priya S.', role: 'CS Final Year', text: 'I tried 3 other platforms. NextStep is the only one that didn\'t make me feel guilty when I missed a day.', stars: 5 },
  { name: 'Rahul M.', role: 'SDE Aspirant', text: 'The AI tutor explained Two Pointers better in 30 seconds than my professor did in an hour.', stars: 5 },
  { name: 'Aisha K.', role: 'MCA Student', text: 'Exam week hit me hard. But NextStep just adapted — 15 mins/day and I still made progress!', stars: 5 },
];

const iconColors = {
  brand: 'from-brand-600 to-brand-400',
  accent: 'from-accent-600 to-brand-400',
  emerald: 'from-emerald-600 to-emerald-400',
  amber: 'from-amber-600 to-amber-400',
};

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-surface-900 bg-grid overflow-x-hidden">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-white/8">
        <div className="absolute inset-0 bg-surface-900/80 backdrop-blur-xl" />
        <div className="relative max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-600 to-accent-500 flex items-center justify-center">
                <span className="text-white font-black text-sm">N</span>
              </div>
              <div className="absolute -inset-0.5 bg-gradient-to-br from-brand-600 to-accent-500 rounded-xl blur opacity-40" />
            </div>
            <span className="font-bold text-white">NextStep</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="btn-ghost text-sm">Sign in</Link>
            <Link to="/register" className="btn-primary text-sm px-5 py-2.5">Get Started Free</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-24 pb-20 px-6 text-center overflow-hidden">
        {/* Glowing orbs */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-brand-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-40 left-1/4 w-64 h-64 bg-accent-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto">
          {/* Pill badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-600/20 border border-brand-500/30 rounded-full text-sm text-brand-300 mb-8 animate-fade-in">
            <Zap size={13} className="text-brand-400" />
            Personalized AI Experiences · Hackathon 2026
          </div>

          <h1 className="text-5xl sm:text-7xl font-black text-white mb-6 leading-tight animate-slide-up">
            Big goals.{' '}
            <span className="gradient-text">A doable today.</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed animate-slide-up" style={{ animationDelay: '0.1s' }}>
            NextStep turns your placement prep into small, adaptive 30-minute missions. When life disrupts your schedule, AI rebuilds your roadmap — instantly, without the backlog guilt.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <button
              id="hero-cta"
              onClick={() => navigate('/register')}
              className="btn-accent text-base px-8 py-4 shadow-glow-md"
            >
              Start Your DSA Journey Free
              <ArrowRight size={18} />
            </button>
            <Link to="/login" className="btn-secondary text-base px-8 py-4">
              I have an account
            </Link>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-8 mt-12 pt-8 border-t border-white/8 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            {[
              { value: '12', label: 'DSA Missions' },
              { value: '30m', label: 'Daily Commitment' },
              { value: '∞', label: 'Adaptive Recalcs' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-3xl font-black gradient-text">{stat.value}</p>
                <p className="text-sm text-slate-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem statement */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="glass-card p-8 border border-red-500/20 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">The Placement Prep Problem</h2>
            <p className="text-slate-400 leading-relaxed max-w-2xl mx-auto">
              Students abandon placement preparation when generic, rigid roadmaps fail to adapt to real-world schedule changes. When life gets busy,{' '}
              <span className="text-red-400 font-medium">incomplete tasks stack into an intimidating backlog</span>, causing paralyzing guilt and complete drop-off.
            </p>
            <div className="mt-6 pt-6 border-t border-white/8">
              <p className="text-lg font-semibold text-white">
                NextStep solves this with <span className="gradient-text">AI-powered adaptive missions</span> that never punish you for falling behind.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-3">Everything you need to stay on track</h2>
            <p className="text-slate-400">Built for real students with real schedules.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="glass-card-hover p-5">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${iconColors[color]} flex items-center justify-center mb-4`}>
                  <Icon size={20} className="text-white" />
                </div>
                <h3 className="font-semibold text-white mb-2">{title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission track preview */}
      <section className="py-16 px-6 bg-surface-800/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-white mb-3">DSA Foundations Starter Track</h2>
            <p className="text-slate-400">12 mission sequence — each exactly 30 minutes</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {MISSIONS_PREVIEW.map((title, i) => (
              <div key={i} className="flex items-center gap-3 p-3 glass-card">
                <div className="w-7 h-7 rounded-lg bg-brand-600/20 border border-brand-500/30 flex items-center justify-center flex-shrink-0">
                  <span className="text-brand-400 text-xs font-mono font-bold">{String(i + 1).padStart(2, '0')}</span>
                </div>
                <span className="text-sm text-white">{title}</span>
                <CheckCircle2 size={14} className="text-brand-500/40 ml-auto" />
              </div>
            ))}
            <div className="flex items-center gap-3 p-3 glass-card border-brand-500/30 col-span-full sm:col-span-2">
              <span className="text-slate-400 text-sm">+ 6 more advanced missions unlocked as you progress...</span>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-10 text-center">Students love it</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="glass-card p-5">
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: t.stars }).map((_, si) => (
                    <Star key={si} size={14} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed mb-4">"{t.text}"</p>
                <div className="pt-3 border-t border-white/8">
                  <p className="text-white text-sm font-semibold">{t.name}</p>
                  <p className="text-slate-500 text-xs">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl font-black text-white mb-4">
            Ready to make today count?
          </h2>
          <p className="text-slate-400 mb-8">
            Join thousands of students who prep smarter, not harder.
          </p>
          <button
            onClick={() => navigate('/register')}
            className="btn-accent text-lg px-10 py-4 shadow-glow-md animate-glow"
          >
            Start Free — No Credit Card
            <ArrowRight size={20} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/8 py-8 px-6 text-center">
        <p className="text-slate-600 text-sm">
          © 2026 NextStep · Built for the Personalized AI Experiences Hackathon
        </p>
      </footer>
    </div>
  );
}

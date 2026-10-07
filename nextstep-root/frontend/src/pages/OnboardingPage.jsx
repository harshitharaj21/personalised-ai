import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { completeOnboarding } from '../services/api';
import { Target, Clock, ArrowRight, CheckCircle2, BookOpen } from 'lucide-react';

const TIME_OPTIONS = [
  { value: 15, label: '15 min', sublabel: 'Minimal — just essentials', emoji: '🌱' },
  { value: 30, label: '30 min', sublabel: 'Balanced — recommended', emoji: '⚡', recommended: true },
  { value: 60, label: '60 min', sublabel: 'Committed — deep dive', emoji: '🔥' },
  { value: 90, label: '90 min', sublabel: 'Intensive — full prep', emoji: '🚀' },
];

const STEPS = ['Welcome', 'Daily Time', 'Track Select', 'Ready'];

export default function OnboardingPage() {
  const { user, getToken, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [selectedTime, setSelectedTime] = useState(30);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFinish = async () => {
    setLoading(true);
    setError('');
    try {
      const token = await getToken();
      await completeOnboarding(token, selectedTime, 'dsa-foundations');
      await refreshProfile();
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to save preferences. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-900 bg-grid flex items-center justify-center p-4">
      <div className="fixed top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-600/8 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg animate-fade-in">
        {/* Progress steps */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                i < step
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : i === step
                  ? 'bg-brand-600/30 text-brand-300 border border-brand-500/40'
                  : 'bg-white/5 text-slate-600'
              }`}>
                {i < step ? <CheckCircle2 size={11} /> : null}
                {s}
              </div>
              {i < STEPS.length - 1 && (
                <div className={`w-4 h-px ${i < step ? 'bg-emerald-500/50' : 'bg-white/10'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="glass-card p-8">
          {/* Step 0: Welcome */}
          {step === 0 && (
            <div className="text-center animate-fade-in">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-600 to-accent-500 flex items-center justify-center mx-auto mb-6 shadow-glow-md">
                <span className="text-white font-black text-2xl">N</span>
              </div>
              <h1 className="text-2xl font-bold text-white mb-3">
                Welcome, {user?.user_metadata?.full_name?.split(' ')[0] || 'there'}! 👋
              </h1>
              <p className="text-slate-400 mb-6 leading-relaxed">
                Let's set up your personalized learning path. This takes just 2 minutes and helps NextStep AI adapt perfectly to your schedule.
              </p>
              <div className="space-y-3 text-left mb-8">
                {[
                  'Choose your daily time commitment',
                  'Start the DSA Foundations track',
                  'Get your first mission immediately',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-slate-300">
                    <div className="w-5 h-5 rounded-full bg-brand-600/30 border border-brand-500/30 flex items-center justify-center flex-shrink-0">
                      <span className="text-brand-400 text-[10px] font-bold">{i + 1}</span>
                    </div>
                    {item}
                  </div>
                ))}
              </div>
              <button onClick={() => setStep(1)} className="btn-primary w-full">
                Let's Begin <ArrowRight size={16} />
              </button>
            </div>
          )}

          {/* Step 1: Time selection */}
          {step === 1 && (
            <div className="animate-fade-in">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-brand-600/20 flex items-center justify-center">
                  <Clock size={20} className="text-brand-400" />
                </div>
                <div>
                  <h2 className="font-bold text-white">Daily Time Budget</h2>
                  <p className="text-sm text-slate-400">How much can you commit each day?</p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {TIME_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    id={`time-option-${opt.value}`}
                    onClick={() => setSelectedTime(opt.value)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                      selectedTime === opt.value
                        ? 'border-brand-500 bg-brand-600/20'
                        : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8'
                    }`}
                  >
                    <span className="text-2xl">{opt.emoji}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">{opt.label}</span>
                        {opt.recommended && (
                          <span className="px-2 py-0.5 text-[10px] font-medium bg-brand-600/30 text-brand-300 rounded-full border border-brand-500/30">
                            Recommended
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-slate-400">{opt.sublabel}</span>
                    </div>
                    {selectedTime === opt.value && (
                      <CheckCircle2 size={18} className="text-brand-400 flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>

              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl mb-6">
                <p className="text-xs text-amber-200">
                  💡 You can always adapt this later if life gets busier — that's what NextStep is built for!
                </p>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(0)} className="btn-secondary flex-1">Back</button>
                <button onClick={() => setStep(2)} className="btn-primary flex-1">
                  Continue <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Track selection */}
          {step === 2 && (
            <div className="animate-fade-in">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-accent-500/20 flex items-center justify-center">
                  <BookOpen size={20} className="text-accent-400" />
                </div>
                <div>
                  <h2 className="font-bold text-white">Your Learning Track</h2>
                  <p className="text-sm text-slate-400">Curated for placement success</p>
                </div>
              </div>

              <div className="glass-card p-5 border border-brand-500/30 mb-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-600 to-accent-500 flex items-center justify-center flex-shrink-0">
                    <Target size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white mb-1">DSA Foundations Starter Track</h3>
                    <p className="text-sm text-slate-400 mb-3">
                      Master core data structures and algorithms through 12 carefully sequenced 30-minute missions.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {['Big-O', 'Arrays', 'Two Pointers', 'Hash Maps', 'Trees', 'DP'].map((tag) => (
                        <span key={tag} className="px-2 py-0.5 text-xs bg-brand-600/20 text-brand-300 rounded-full border border-brand-500/20">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-white/5 border border-white/10 rounded-xl mb-6">
                <p className="text-xs text-slate-400">
                  More tracks coming soon: <span className="text-slate-300">System Design, SQL Mastery, Behavioral Prep</span>
                </p>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="btn-secondary flex-1">Back</button>
                <button onClick={() => setStep(3)} className="btn-primary flex-1">
                  Select Track <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Ready */}
          {step === 3 && (
            <div className="text-center animate-fade-in">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-600 to-brand-500 flex items-center justify-center mx-auto mb-6 shadow-glow-md">
                <CheckCircle2 size={32} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">You're all set! 🎉</h2>
              <p className="text-slate-400 mb-6">
                Your personalized DSA journey starts now. Here's your plan:
              </p>

              <div className="glass-card p-5 text-left mb-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Track</span>
                  <span className="text-sm font-medium text-white">DSA Foundations</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Daily commitment</span>
                  <span className="text-sm font-medium text-white">{selectedTime} minutes</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Total missions</span>
                  <span className="text-sm font-medium text-white">12 missions</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Est. completion</span>
                  <span className="text-sm font-medium text-white">
                    {selectedTime >= 60 ? '12' : selectedTime >= 30 ? '12' : '24'} days
                  </span>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-300 mb-4 animate-fade-in">
                  {error}
                </div>
              )}

              <button
                id="start-journey"
                onClick={handleFinish}
                disabled={loading}
                className="btn-accent w-full"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Setting up your missions...
                  </span>
                ) : (
                  <>Start My Journey <ArrowRight size={16} /></>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

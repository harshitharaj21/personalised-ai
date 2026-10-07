import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { previewAdaptation, acceptAdaptation, fetchDashboard } from '../services/api';
import Navbar from '../components/Navbar';
import RevisedPlanPreview from '../components/RevisedPlanPreview';
import {
  Shuffle,
  AlertTriangle,
  Clock,
  Sparkles,
  CheckCircle2,
  Calendar,
  Zap,
  ArrowRight,
  ShieldCheck,
  HeartHandshake,
  TrendingDown,
  RefreshCw,
} from 'lucide-react';

const INTERRUPTION_TYPES = [
  {
    id: 'EXAMS',
    label: 'College Exams / Midterms',
    desc: 'Focus on college exams while keeping coding muscle memory alive with micro-sessions.',
    emoji: '📚',
    defaultReduction: 0.5,
  },
  {
    id: 'BURNOUT',
    label: 'Feeling Overwhelmed / Burnout',
    desc: 'Take a gentle, guilt-free breath with 15-minute low-friction problem reviews.',
    emoji: '😮‍💨',
    defaultReduction: 0.5,
  },
  {
    id: 'BUSY_WORK',
    label: 'Heavy Assignment / Project Deadlines',
    desc: 'Temporarily scale down to fit tight academic or work deliverables.',
    emoji: '💼',
    defaultReduction: 0.25,
  },
  {
    id: 'ILLNESS',
    label: 'Sick / Personal Break',
    desc: 'Protect your health first. Light 15-minute reading mode without coding stress.',
    emoji: '🤒',
    defaultReduction: 0.75,
  },
  {
    id: 'CUSTOM',
    label: 'Routine Re-alignment / Goal Shift',
    desc: 'Adjust your daily prep pace up or down to fit a new daily schedule.',
    emoji: '🎯',
    defaultReduction: 0.3,
  },
];

const TIME_OPTIONS = [15, 30, 45, 60, 90];

export default function AdaptPage() {
  const { getToken, profile } = useAuth();
  const navigate = useNavigate();

  const [selectedReason, setSelectedReason] = useState('EXAMS');
  const [newCapacity, setNewCapacity] = useState(15);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [loadingAccept, setLoadingAccept] = useState(false);
  const [previewResult, setPreviewResult] = useState(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [dashboardData, setDashboardData] = useState(null);

  const currentCapacity = profile?.daily_capacity_minutes || 30;

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const token = await getToken();
      const res = await fetchDashboard(token);
      setDashboardData(res);
    } catch (err) {
      console.error('Failed to fetch dashboard data for adaptation context:', err);
    }
  };

  const handleReasonSelect = (reason) => {
    setSelectedReason(reason.id);
    const suggested = Math.max(15, Math.round(currentCapacity * (1 - reason.defaultReduction)));
    const nearest = TIME_OPTIONS.reduce((prev, curr) =>
      Math.abs(curr - suggested) < Math.abs(prev - suggested) ? curr : prev
    );
    setNewCapacity(nearest);
    setPreviewResult(null); // Reset preview on parameter change
  };

  const handleGeneratePreview = async () => {
    if (!selectedReason) return;
    setError('');
    setLoadingPreview(true);
    try {
      const token = await getToken();
      const data = await previewAdaptation(token, selectedReason, newCapacity);
      setPreviewResult(data);
    } catch (err) {
      setError(err.message || 'Failed to generate adaptation plan.');
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleAcceptPlan = async () => {
    setError('');
    setLoadingAccept(true);
    try {
      const token = await getToken();
      await acceptAdaptation(token, selectedReason, newCapacity);
      setSuccessMessage('Plan successfully adapted! Redirecting to dashboard...');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to save updated plan.');
      setLoadingAccept(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-900 bg-grid">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-fade-in">
        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-brand-400 text-sm font-semibold uppercase tracking-wider mb-1">
              <Shuffle size={16} />
              Dynamic Pacing Engine
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Life Happened? Let's Adapt.
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              No backlogs. No shame. Gemini AI recalculates your daily trajectory while keeping all your earned progress intact.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2.5 rounded-2xl flex-shrink-0">
            <Clock size={16} className="text-slate-400" />
            <div>
              <p className="text-xs text-slate-400">Current Pace</p>
              <p className="text-sm font-bold text-white">{currentCapacity} min / day</p>
            </div>
          </div>
        </div>

        {/* Guarantees Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass-card p-4 flex items-start gap-3 border-brand-500/20">
            <div className="w-8 h-8 rounded-xl bg-brand-600/20 text-brand-400 flex items-center justify-center flex-shrink-0 mt-0.5">
              <ShieldCheck size={18} />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Zero Backlog Guilt</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Missions never pile up. We compress or stretch future tasks so you only focus on 1 daily step.
              </p>
            </div>
          </div>

          <div className="glass-card p-4 flex items-start gap-3 border-emerald-500/20">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
              <CheckCircle2 size={18} />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Progress Preserved</p>
              <p className="text-xs text-slate-400 mt-0.5">
                {dashboardData?.stats?.completedCount || 0} completed missions stay verified in your portfolio forever.
              </p>
            </div>
          </div>

          <div className="glass-card p-4 flex items-start gap-3 border-purple-500/20">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center flex-shrink-0 mt-0.5">
              <HeartHandshake size={18} />
            </div>
            <div>
              <p className="text-sm font-bold text-white">AI-Tailored Focus</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Gemini pinpoints your high-yield concepts so less time still translates to maximum retention.
              </p>
            </div>
          </div>
        </div>

        {/* Error / Success Notifications */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center gap-3 text-red-300 text-sm">
            <AlertTriangle size={18} className="flex-shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center gap-3 text-emerald-300 text-sm animate-fade-in">
            <CheckCircle2 size={18} className="flex-shrink-0 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Form Controls */}
          <div className="lg:col-span-6 space-y-6">
            {/* Step 1: Select Disruption */}
            <div className="glass-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-6 h-6 rounded-full bg-brand-500/20 border border-brand-500/40 text-brand-300 text-xs font-bold flex items-center justify-center">
                  1
                </span>
                <h2 className="text-base font-bold text-white">What's causing the schedule shift?</h2>
              </div>

              <div className="space-y-3">
                {INTERRUPTION_TYPES.map((reason) => {
                  const isSelected = selectedReason === reason.id;
                  return (
                    <button
                      key={reason.id}
                      id={`adapt-reason-${reason.id.toLowerCase()}`}
                      type="button"
                      onClick={() => handleReasonSelect(reason)}
                      className={`w-full text-left p-3.5 rounded-2xl border transition-all duration-200 ${
                        isSelected
                          ? 'border-brand-500 bg-brand-600/20 shadow-glow-sm'
                          : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl flex-shrink-0 mt-0.5">{reason.emoji}</span>
                        <div className="flex-1">
                          <p className={`text-sm font-semibold ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                            {reason.label}
                          </p>
                          <p className="text-xs text-slate-400 mt-1 leading-relaxed">{reason.desc}</p>
                        </div>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-brand-500 flex items-center justify-center flex-shrink-0 mt-1">
                            <CheckCircle2 size={12} className="text-white" />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Time Selection */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-brand-500/20 border border-brand-500/40 text-brand-300 text-xs font-bold flex items-center justify-center">
                    2
                  </span>
                  <h2 className="text-base font-bold text-white">Realistic daily capacity</h2>
                </div>
                <span className="text-xs text-slate-400">
                  Current: <strong className="text-brand-300">{currentCapacity} min</strong>
                </span>
              </div>

              <div className="grid grid-cols-5 gap-2.5">
                {TIME_OPTIONS.map((mins) => {
                  const isSelected = newCapacity === mins;
                  return (
                    <button
                      key={mins}
                      id={`adapt-time-${mins}`}
                      type="button"
                      onClick={() => {
                        setNewCapacity(mins);
                        setPreviewResult(null);
                      }}
                      className={`py-3 px-2 rounded-2xl border-2 text-center transition-all ${
                        isSelected
                          ? 'border-brand-500 bg-brand-600/25 text-white shadow-glow-sm scale-[1.02]'
                          : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:text-white'
                      }`}
                    >
                      <span className="text-lg font-bold block">{mins}</span>
                      <span className="text-[10px] text-slate-400 font-medium">mins</span>
                    </button>
                  );
                })}
              </div>

              <p className="text-xs text-slate-400 mt-4 leading-relaxed flex items-center gap-1.5">
                <Sparkles size={13} className="text-brand-400 flex-shrink-0" />
                Even 15 minutes/day keeps concept recall sharp without leading to placement prep gaps.
              </p>

              <button
                id="generate-adaptation-plan-btn"
                type="button"
                onClick={handleGeneratePreview}
                disabled={loadingPreview || !selectedReason}
                className="btn-accent w-full mt-6 py-3 text-sm justify-center"
              >
                {loadingPreview ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw size={16} className="animate-spin" />
                    Consulting Gemini AI Mentor...
                  </span>
                ) : (
                  <>
                    <Sparkles size={16} />
                    Generate AI Adaptation Plan
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Column: AI Plan Preview or Placeholder */}
          <div className="lg:col-span-6 space-y-6">
            {previewResult ? (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-brand-300 flex items-center gap-2">
                    <Sparkles size={15} />
                    Gemini AI Pacing Strategy
                  </h3>
                  <span className="text-xs text-slate-500 font-mono">Customized Just Now</span>
                </div>

                <RevisedPlanPreview
                  aiPlan={previewResult.aiPlan}
                  schedulePreview={previewResult.schedulePreview}
                  onAccept={handleAcceptPlan}
                  onCancel={() => setPreviewResult(null)}
                  isLoading={loadingAccept}
                />
              </div>
            ) : (
              <div className="glass-card p-8 text-center flex flex-col items-center justify-center min-h-[420px] border-dashed border-white/15">
                <div className="w-16 h-16 rounded-2xl bg-brand-600/10 border border-brand-500/20 flex items-center justify-center mb-4 text-brand-400">
                  <Sparkles size={28} className="animate-pulse-slow" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">No active preview yet</h3>
                <p className="text-sm text-slate-400 max-w-sm leading-relaxed mb-6">
                  Select what is happening in your life on the left and choose your target daily budget. NextStep AI will recalculate an empathetic roadmap in seconds.
                </p>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <ShieldCheck size={14} className="text-emerald-400" />
                  No changes take effect until you hit "Accept New Plan"
                </div>
              </div>
            )}

            {/* Micro-learning tips */}
            <div className="glass-card p-5">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Zap size={14} className="text-amber-400" />
                Proven Strategy for Exam Weeks
              </h4>
              <div className="space-y-2.5 text-xs text-slate-300">
                <div className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-400 mt-1.5 flex-shrink-0" />
                  <span><strong>10-minute concept skim:</strong> Read problem intuition on your phone during transit.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-400 mt-1.5 flex-shrink-0" />
                  <span><strong>One dry-run:</strong> Trace 1 test case with pen and paper rather than full IDE debugging.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-400 mt-1.5 flex-shrink-0" />
                  <span><strong>Streak survival:</strong> Logging completion rates difficulty and preserves momentum.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

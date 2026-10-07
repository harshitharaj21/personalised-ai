import { useEffect, useState, useRef } from 'react';
import { CheckCircle2, Star, Zap, ArrowRight, X } from 'lucide-react';
import confetti from 'canvas-confetti';

const DIFFICULTY_OPTIONS = [
  {
    value: 'EASY',
    label: 'Easy',
    sublabel: 'Flew through it',
    emoji: '🚀',
    color: 'emerald',
    borderClass: 'border-emerald-500/50 bg-emerald-500/10',
    activeClass: 'border-emerald-400 bg-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.3)]',
  },
  {
    value: 'MODERATE',
    label: 'Moderate',
    sublabel: 'Right challenge level',
    emoji: '⚡',
    color: 'blue',
    borderClass: 'border-brand-500/50 bg-brand-500/10',
    activeClass: 'border-brand-400 bg-brand-500/20 shadow-glow-sm',
  },
  {
    value: 'HARD',
    label: 'Hard',
    sublabel: 'Struggled with concepts',
    emoji: '🧗',
    color: 'amber',
    borderClass: 'border-amber-500/50 bg-amber-500/10',
    activeClass: 'border-amber-400 bg-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.3)]',
  },
];

export default function CompletionModal({ isOpen, missionTitle, onSubmit, onClose, isLoading }) {
  const [selected, setSelected] = useState(null);
  const [notes, setNotes] = useState('');
  const [confettiFired, setConfettiFired] = useState(false);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (isOpen && !confettiFired) {
      setConfettiFired(true);
      // Fire confetti
      const fire = (particleRatio, opts) => {
        confetti({
          origin: { y: 0.7 },
          ...opts,
          particleCount: Math.floor(200 * particleRatio),
        });
      };
      setTimeout(() => {
        fire(0.25, { spread: 26, startVelocity: 55, colors: ['#6366f1', '#ec4899', '#a5f3fc'] });
        fire(0.2, { spread: 60, colors: ['#818cf8', '#f472b6'] });
        fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8, colors: ['#6366f1', '#ec4899'] });
        fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
        fire(0.1, { spread: 120, startVelocity: 45 });
      }, 200);
    }
    if (!isOpen) {
      setConfettiFired(false);
      setSelected(null);
      setNotes('');
    }
  }, [isOpen, confettiFired]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative glass-card w-full max-w-lg p-6 animate-slide-up">
        {/* Close */}
        <button onClick={onClose} className="absolute top-4 right-4 btn-ghost p-2">
          <X size={16} />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-brand-500 rounded-2xl mb-4 shadow-glow-md">
            <CheckCircle2 size={32} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-1">Mission Complete! 🎉</h2>
          <p className="text-slate-400 text-sm">
            You just crushed <span className="text-white font-medium">"{missionTitle}"</span>
          </p>
        </div>

        {/* Difficulty Rating */}
        <div className="mb-5">
          <p className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
            <Star size={14} className="text-brand-400" />
            How did it feel?
          </p>
          <div className="grid grid-cols-3 gap-3">
            {DIFFICULTY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                id={`difficulty-${opt.value.toLowerCase()}`}
                onClick={() => setSelected(opt.value)}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-200 ${
                  selected === opt.value ? opt.activeClass : `border-white/10 bg-white/5 hover:${opt.borderClass}`
                }`}
              >
                <span className="text-2xl">{opt.emoji}</span>
                <span className="text-sm font-semibold text-white">{opt.label}</span>
                <span className="text-[10px] text-slate-400 text-center leading-tight">{opt.sublabel}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="mb-5">
          <label className="text-sm font-medium text-slate-300 mb-2 flex items-center gap-2 block">
            <Zap size={14} className="text-brand-400" />
            Quick note (optional)
          </label>
          <textarea
            id="completion-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="What clicked? What's still fuzzy?"
            maxLength={500}
            rows={3}
            className="input-field resize-none text-sm"
          />
        </div>

        {/* Submit */}
        <button
          id="complete-mission-submit"
          onClick={() => selected && onSubmit(selected, notes)}
          disabled={!selected || isLoading}
          className="btn-accent w-full"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Saving...
            </span>
          ) : (
            <>
              Save & Unlock Next Mission
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

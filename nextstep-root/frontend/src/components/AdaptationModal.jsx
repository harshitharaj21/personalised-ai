import { useState } from 'react';
import { X, AlertTriangle, Clock, ChevronRight } from 'lucide-react';

const INTERRUPTION_TYPES = [
  { id: 'EXAMS', label: 'College Exams / Midterms', emoji: '📚', defaultReduction: 0.5 },
  { id: 'BURNOUT', label: 'Feeling Overwhelmed / Burnout', emoji: '😮‍💨', defaultReduction: 0.5 },
  { id: 'BUSY_WORK', label: 'High Workload / Assignments', emoji: '💼', defaultReduction: 0.25 },
  { id: 'ILLNESS', label: 'Sick / Personal Break', emoji: '🤒', defaultReduction: 1.0 },
];

const TIME_BUDGETS = [15, 30, 60, 90];

export default function AdaptationModal({ isOpen, onClose, onSubmit, currentCapacity, isLoading }) {
  const [selectedReason, setSelectedReason] = useState(null);
  const [newCapacity, setNewCapacity] = useState(15);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!selectedReason) return;
    onSubmit(selectedReason, newCapacity);
  };

  const handleReasonSelect = (reason) => {
    setSelectedReason(reason.id);
    // Auto-suggest reduced time
    const suggested = Math.max(15, Math.round(currentCapacity * (1 - reason.defaultReduction)));
    const nearest = TIME_BUDGETS.reduce((prev, curr) =>
      Math.abs(curr - suggested) < Math.abs(prev - suggested) ? curr : prev
    );
    setNewCapacity(nearest);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative glass-card w-full max-w-lg p-6 animate-slide-up max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 btn-ghost p-2">
          <X size={16} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
            <AlertTriangle size={20} className="text-amber-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Life Happened?</h2>
            <p className="text-sm text-slate-400">Let's adapt your plan — no pressure.</p>
          </div>
        </div>

        {/* Reason selection */}
        <div className="mb-5">
          <p className="text-sm font-semibold text-slate-300 mb-3">What's going on?</p>
          <div className="space-y-2">
            {INTERRUPTION_TYPES.map((reason) => (
              <button
                key={reason.id}
                id={`reason-${reason.id.toLowerCase()}`}
                onClick={() => handleReasonSelect(reason)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all duration-200 ${
                  selectedReason === reason.id
                    ? 'border-brand-500 bg-brand-600/20'
                    : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8'
                }`}
              >
                <span className="text-xl">{reason.emoji}</span>
                <span className="text-sm text-white">{reason.label}</span>
                {selectedReason === reason.id && (
                  <div className="ml-auto w-4 h-4 rounded-full bg-brand-500 flex items-center justify-center">
                    <span className="text-white text-[10px]">✓</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Time selector */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <Clock size={14} className="text-brand-400" />
              New daily time budget
            </p>
            <span className="text-xs text-slate-500">
              Was: <span className="text-white">{currentCapacity}min</span>
            </span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {TIME_BUDGETS.map((mins) => (
              <button
                key={mins}
                id={`time-${mins}`}
                onClick={() => setNewCapacity(mins)}
                className={`py-3 rounded-xl border-2 text-center transition-all duration-200 ${
                  newCapacity === mins
                    ? 'border-brand-500 bg-brand-600/20 text-white font-bold'
                    : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:text-white'
                }`}
              >
                <span className="text-sm font-semibold block">{mins}</span>
                <span className="text-[10px] text-slate-500">min</span>
              </button>
            ))}
          </div>
        </div>

        {/* Note */}
        <div className="mb-5 p-3 bg-brand-600/10 border border-brand-500/20 rounded-xl">
          <p className="text-xs text-brand-300 leading-relaxed">
            ✨ <strong>Zero backlog guilt.</strong> We'll keep all your progress and simply adjust the pace going forward. Your completed missions stay exactly where they are.
          </p>
        </div>

        <button
          id="preview-adaptation"
          onClick={handleSubmit}
          disabled={!selectedReason || isLoading}
          className="btn-accent w-full"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Generating plan...
            </span>
          ) : (
            <>
              Preview My Adapted Plan
              <ChevronRight size={16} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

import { ArrowRight, TrendingDown, TrendingUp, CheckCircle2, Sparkles, Target, Clock } from 'lucide-react';

export default function RevisedPlanPreview({ aiPlan, schedulePreview, onAccept, onCancel, isLoading }) {
  if (!aiPlan || !schedulePreview) return null;

  const isSlowing = schedulePreview.newCapacity < schedulePreview.previousCapacity;

  return (
    <div className="space-y-4 animate-slide-up">
      {/* Encouragement */}
      <div className="glass-card p-5 border border-brand-500/20">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-600 to-accent-500 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Sparkles size={16} className="text-white" />
          </div>
          <div>
            <p className="text-sm text-white leading-relaxed">{aiPlan.encouragement}</p>
          </div>
        </div>
      </div>

      {/* Schedule comparison */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass-card p-4">
          <p className="text-xs text-slate-500 mb-2 flex items-center gap-1">
            <Clock size={11} />
            Previous pace
          </p>
          <p className="text-2xl font-bold text-slate-400">{schedulePreview.previousCapacity}</p>
          <p className="text-xs text-slate-500">min/day</p>
          <div className="mt-2 pt-2 border-t border-white/8">
            <p className="text-xs text-slate-500">
              ~{schedulePreview.previousDaysToComplete} days to finish
            </p>
          </div>
        </div>

        <div className="glass-card p-4 border-brand-500/30">
          <p className="text-xs text-brand-400 mb-2 flex items-center gap-1">
            {isSlowing ? <TrendingDown size={11} /> : <TrendingUp size={11} />}
            New pace
          </p>
          <p className="text-2xl font-bold text-white">{schedulePreview.newCapacity}</p>
          <p className="text-xs text-slate-400">min/day</p>
          <div className="mt-2 pt-2 border-t border-white/8">
            <p className="text-xs text-slate-400">
              ~{schedulePreview.estimatedDaysToComplete} days to finish
            </p>
          </div>
        </div>
      </div>

      {/* AI Strategy */}
      <div className="glass-card p-4 space-y-3">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">AI Strategy</p>

        <div className="flex items-start gap-2">
          <Target size={13} className="text-brand-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-medium text-slate-300 mb-0.5">Revised Pacing</p>
            <p className="text-sm text-white">{aiPlan.revisedPacing}</p>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <Sparkles size={13} className="text-accent-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-medium text-slate-300 mb-0.5">Focus Next</p>
            <p className="text-sm text-white">{aiPlan.focusRecommendation}</p>
          </div>
        </div>

        <div>
          <p className="text-xs font-medium text-slate-300 mb-2">Action Plan</p>
          <div className="space-y-2">
            {aiPlan.actionableSteps?.map((step, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-brand-600/30 border border-brand-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-[10px] text-brand-400 font-bold">{i + 1}</span>
                </div>
                <p className="text-sm text-slate-300">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Strategy summary */}
      <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
        <p className="text-sm text-emerald-300 leading-relaxed">{aiPlan.strategySummary}</p>
      </div>

      {/* Preserved progress note */}
      <div className="flex items-center gap-2 p-3 bg-white/5 border border-white/10 rounded-xl">
        <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0" />
        <p className="text-xs text-slate-400">
          <span className="text-white font-medium">{schedulePreview.completedMissions} missions</span> already completed — preserved & never reset.
          <span className="text-white font-medium"> {schedulePreview.remainingMissions} missions</span> to go.
        </p>
      </div>

      {/* CTA Buttons */}
      <div className="flex gap-3 pt-2">
        <button onClick={onCancel} className="btn-secondary flex-1">
          Cancel
        </button>
        <button
          id="accept-adaptation"
          onClick={onAccept}
          disabled={isLoading}
          className="btn-accent flex-1"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Saving...
            </span>
          ) : (
            <>
              Accept New Plan
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

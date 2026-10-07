import { Zap, Flame, Trophy, Target } from 'lucide-react';

const MILESTONE_DAYS = [3, 7, 14, 21, 30];

export default function StreakCard({ streak = 0, completedCount = 0, totalMissions = 12 }) {
  const nextMilestone = MILESTONE_DAYS.find((m) => m > streak) || 30;
  const milestoneProgress = Math.min((streak / nextMilestone) * 100, 100);

  const getStreakEmoji = () => {
    if (streak >= 21) return '🏆';
    if (streak >= 14) return '🔥';
    if (streak >= 7) return '⚡';
    if (streak >= 3) return '✨';
    return '🌱';
  };

  return (
    <div className="glass-card p-5 relative overflow-hidden">
      {/* Background glow */}
      {streak > 0 && (
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
      )}

      <div className="flex items-start justify-between gap-4">
        {/* Streak counter */}
        <div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-5xl font-black text-white tabular-nums">{streak}</span>
            <span className="text-xl">{getStreakEmoji()}</span>
          </div>
          <p className="text-slate-400 text-sm">
            {streak === 1 ? 'Day streak' : 'Day streak'}
          </p>
        </div>

        {/* Mission progress ring */}
        <div className="text-right">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-brand-600/20 border border-brand-500/30 rounded-full mb-2">
            <Target size={12} className="text-brand-400" />
            <span className="text-brand-300 text-xs font-semibold">{completedCount}/{totalMissions}</span>
          </div>
          <p className="text-xs text-slate-500">Missions done</p>
        </div>
      </div>

      {/* Milestone progress */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-slate-400">Next milestone</span>
          <div className="flex items-center gap-1">
            <Flame size={11} className="text-amber-400" />
            <span className="text-xs font-semibold text-amber-300">{nextMilestone} days</span>
          </div>
        </div>
        <div className="progress-track">
          <div
            className="progress-fill"
            style={{
              width: `${milestoneProgress}%`,
              background: streak > 0
                ? 'linear-gradient(90deg, #f59e0b, #ef4444)'
                : 'linear-gradient(90deg, #4f46e5, #ec4899)',
            }}
          />
        </div>
        <p className="text-xs text-slate-500 mt-1.5">
          {streak === 0
            ? 'Complete today\'s mission to start your streak!'
            : `${nextMilestone - streak} more day${nextMilestone - streak !== 1 ? 's' : ''} to reach ${nextMilestone}-day milestone`}
        </p>
      </div>

      {/* Milestone badges */}
      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/8">
        {MILESTONE_DAYS.slice(0, 4).map((day) => (
          <div
            key={day}
            className={`flex flex-col items-center gap-0.5 flex-1 ${
              streak >= day ? 'opacity-100' : 'opacity-30'
            }`}
          >
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs ${
              streak >= day
                ? 'bg-amber-500/30 border border-amber-500/50 text-amber-300'
                : 'bg-white/5 border border-white/10 text-slate-500'
            }`}>
              {streak >= day ? '✓' : day}
            </div>
            <span className="text-[9px] text-slate-500">{day}d</span>
          </div>
        ))}
        <div className={`flex flex-col items-center gap-0.5 flex-1 ${streak >= 30 ? 'opacity-100' : 'opacity-30'}`}>
          <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
            streak >= 30
              ? 'bg-amber-500/30 border border-amber-500/50'
              : 'bg-white/5 border border-white/10'
          }`}>
            <Trophy size={12} className={streak >= 30 ? 'text-amber-300' : 'text-slate-500'} />
          </div>
          <span className="text-[9px] text-slate-500">30d</span>
        </div>
      </div>
    </div>
  );
}

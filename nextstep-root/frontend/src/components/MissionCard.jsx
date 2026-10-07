import { useNavigate } from 'react-router-dom';
import { Lock, CheckCircle2, PlayCircle, Clock, ChevronRight, Loader2 } from 'lucide-react';

const STATUS_CONFIG = {
  LOCKED: {
    badge: 'badge-locked',
    label: 'Locked',
    Icon: Lock,
    iconColor: 'text-slate-500',
    cardClass: 'opacity-60',
    btnClass: 'btn-secondary opacity-50 cursor-not-allowed',
    btnLabel: 'Locked',
  },
  AVAILABLE: {
    badge: 'badge-available',
    label: 'Available',
    Icon: PlayCircle,
    iconColor: 'text-brand-400',
    cardClass: '',
    btnClass: 'btn-primary',
    btnLabel: 'Start Mission',
  },
  IN_PROGRESS: {
    badge: 'badge-in-progress',
    label: 'In Progress',
    Icon: Loader2,
    iconColor: 'text-yellow-400',
    cardClass: '',
    btnClass: 'btn-primary bg-yellow-600 hover:bg-yellow-500',
    btnLabel: 'Continue',
  },
  COMPLETED: {
    badge: 'badge-completed',
    label: 'Completed',
    Icon: CheckCircle2,
    iconColor: 'text-emerald-400',
    cardClass: '',
    btnClass: 'btn-secondary',
    btnLabel: 'Review',
  },
};

export default function MissionCard({ mission, status, sequenceOrder, compact = false, onClick }) {
  const navigate = useNavigate();
  const config = STATUS_CONFIG[status] || STATUS_CONFIG['LOCKED'];
  const { badge, label, Icon, iconColor, cardClass, btnClass, btnLabel } = config;

  const handleClick = () => {
    if (status === 'LOCKED') return;
    if (onClick) return onClick();
    navigate(`/mission/${mission.id}`);
  };

  if (compact) {
    return (
      <div
        className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 ${
          status === 'LOCKED'
            ? 'border-white/5 bg-white/2 opacity-50'
            : status === 'COMPLETED'
            ? 'border-emerald-500/20 bg-emerald-500/5 cursor-pointer hover:bg-emerald-500/10'
            : status === 'AVAILABLE' || status === 'IN_PROGRESS'
            ? 'border-brand-500/30 bg-brand-600/10 cursor-pointer hover:bg-brand-600/15'
            : ''
        }`}
        onClick={handleClick}
      >
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
          status === 'COMPLETED' ? 'bg-emerald-500/20' :
          status === 'AVAILABLE' || status === 'IN_PROGRESS' ? 'bg-brand-600/20' :
          'bg-white/5'
        }`}>
          <Icon size={14} className={iconColor} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">
            {sequenceOrder && <span className="text-slate-500 mr-1">#{sequenceOrder}</span>}
            {mission.title}
          </p>
          <p className="text-xs text-slate-500 flex items-center gap-1">
            <Clock size={10} />
            {mission.estimated_minutes}m
          </p>
        </div>
        <span className={badge}>{label}</span>
      </div>
    );
  }

  return (
    <div className={`glass-card-hover p-5 ${cardClass} ${status !== 'LOCKED' ? 'cursor-pointer' : ''}`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
            status === 'COMPLETED' ? 'bg-emerald-500/20' :
            status === 'AVAILABLE' || status === 'IN_PROGRESS' ? 'bg-brand-600/20' :
            'bg-white/5'
          }`}>
            <Icon size={20} className={`${iconColor} ${status === 'IN_PROGRESS' ? 'animate-spin' : ''}`} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-mono mb-0.5">
              DSA-{String(sequenceOrder).padStart(2, '0')}
            </p>
            <span className={badge}>{label}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-slate-500 text-xs">
          <Clock size={12} />
          <span>{mission.estimated_minutes}m</span>
        </div>
      </div>

      <h3 className="font-semibold text-white mb-1.5">{mission.title}</h3>
      <p className="text-sm text-slate-400 line-clamp-2 mb-4">{mission.summary}</p>

      <button
        className={`${btnClass} w-full text-sm`}
        onClick={handleClick}
        disabled={status === 'LOCKED'}
      >
        {btnLabel}
        {status !== 'LOCKED' && <ChevronRight size={14} />}
      </button>
    </div>
  );
}

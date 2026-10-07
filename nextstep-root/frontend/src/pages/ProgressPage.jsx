import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchDashboard } from '../services/api';
import Navbar from '../components/Navbar';
import ProgressBar from '../components/ProgressBar';
import {
  BarChart3,
  Zap,
  Target,
  Clock,
  CheckCircle2,
  Lock,
  PlayCircle,
  Award,
  Sparkles,
  Shuffle,
  ChevronRight,
  Flame,
  Calendar,
  Layers,
  BookOpen,
  ArrowRight,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const DIFFICULTY_COLORS = {
  EASY: '#10b981', // emerald-500
  MODERATE: '#6366f1', // brand-500
  MEDIUM: '#6366f1', // brand-500
  HARD: '#f59e0b', // amber-500
};

const BADGES = [
  {
    id: 'first_step',
    title: 'First Step',
    description: 'Completed your 1st placement mission',
    icon: '🚀',
    isUnlocked: (stats) => (stats?.completedCount || 0) >= 1,
  },
  {
    id: 'streak_3',
    title: '3-Day Fire',
    description: 'Maintained a 3-day learning streak',
    icon: '🔥',
    isUnlocked: (stats) => (stats?.streak || 0) >= 3,
  },
  {
    id: 'streak_7',
    title: 'Unstoppable 7',
    description: 'Maintained a full 7-day streak',
    icon: '⚡',
    isUnlocked: (stats) => (stats?.streak || 0) >= 7,
  },
  {
    id: 'halfway',
    title: 'Halfway Hero',
    description: 'Conquered 50% of the DSA track',
    icon: '🛡️',
    isUnlocked: (stats) => (stats?.completedCount || 0) >= 6,
  },
  {
    id: 'hard_conqueror',
    title: 'Resilience Pro',
    description: 'Conquered a challenging Hard rated topic',
    icon: '🧠',
    isUnlocked: (_, list) => list?.some((p) => p.difficultyRating === 'HARD'),
  },
  {
    id: 'master',
    title: 'DSA Track Master',
    description: 'Completed all 12 missions in the curriculum',
    icon: '👑',
    isUnlocked: (stats) => (stats?.completedCount || 0) >= 12,
  },
];

export default function ProgressPage() {
  const { getToken, profile } = useAuth();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('ALL');

  useEffect(() => {
    loadProgressData();
  }, []);

  const loadProgressData = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const result = await fetchDashboard(token);
      setData(result);
    } catch (err) {
      setError(err.message || 'Failed to load progress analytics.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-900">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-white/5 rounded-xl w-60" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-28 skeleton rounded-2xl" />
              ))}
            </div>
            <div className="h-64 skeleton rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-surface-900">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="glass-card p-8 text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <button onClick={loadProgressData} className="btn-primary">
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { stats, allProgress, currentMission } = data || {};

  const completedList = allProgress?.filter((p) => p.status === 'COMPLETED') || [];
  const inProgressList = allProgress?.filter((p) => p.status === 'IN_PROGRESS' || p.status === 'AVAILABLE') || [];
  const lockedList = allProgress?.filter((p) => p.status === 'LOCKED') || [];

  // Estimated total minutes invested
  const totalMinutesInvested = completedList.reduce(
    (acc, cur) => acc + (cur.mission?.estimated_minutes || 0),
    0
  );

  // Difficulty counts for Pie Chart
  const difficultyCounts = completedList.reduce((acc, curr) => {
    const rating = curr.difficultyRating || 'MEDIUM';
    acc[rating] = (acc[rating] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.keys(difficultyCounts).map((rating) => ({
    name: rating,
    value: difficultyCounts[rating],
    color: DIFFICULTY_COLORS[rating] || '#6366f1',
  }));

  // Bar chart data by mission sequence order
  const barData = (allProgress || []).map((p) => ({
    name: `M${p.mission?.sequence_order}`,
    fullName: p.mission?.title,
    minutes: p.mission?.estimated_minutes || 0,
    status: p.status,
    completed: p.status === 'COMPLETED' ? p.mission?.estimated_minutes || 0 : 0,
  }));

  // Filtered mission list
  const filteredMissions = (allProgress || []).filter((p) => {
    if (selectedFilter === 'ALL') return true;
    if (selectedFilter === 'COMPLETED') return p.status === 'COMPLETED';
    if (selectedFilter === 'ACTIVE') return p.status === 'IN_PROGRESS' || p.status === 'AVAILABLE';
    if (selectedFilter === 'LOCKED') return p.status === 'LOCKED';
    return true;
  });

  return (
    <div className="min-h-screen bg-surface-900 bg-grid">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-fade-in">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold uppercase tracking-wider mb-1">
              <BarChart3 size={16} />
              Analytics & Milestones
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">Your Preparation Progress</h1>
            <p className="text-slate-400 text-sm mt-1">
              Tracking consistent, compound growth across data structures and algorithms.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/adapt')}
              className="btn-secondary text-sm gap-2"
            >
              <Shuffle size={15} />
              Adapt Schedule
            </button>
            {currentMission?.mission && (
              <button
                onClick={() => navigate(`/mission/${currentMission.mission.id}`)}
                className="btn-accent text-sm gap-2"
              >
                Continue Mission
                <ArrowRight size={15} />
              </button>
            )}
          </div>
        </div>

        {/* Metric Cards Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card p-5 border-brand-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                Overall Progress
              </span>
              <div className="w-7 h-7 rounded-lg bg-brand-600/20 text-brand-400 flex items-center justify-center">
                <Target size={15} />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-white">
              {stats?.completionPercentage || 0}%
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {stats?.completedCount || 0} of {stats?.totalMissions || 12} missions conquered
            </p>
          </div>

          <div className="glass-card p-5 border-amber-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                Current Streak
              </span>
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Flame size={15} />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-white">
              {stats?.streak || 0} <span className="text-sm font-normal text-amber-300">days</span>
            </p>
            <p className="text-xs text-slate-400 mt-1">Daily consistency score</p>
          </div>

          <div className="glass-card p-5 border-emerald-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                Time Invested
              </span>
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Clock size={15} />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-white">
              {totalMinutesInvested} <span className="text-sm font-normal text-slate-400">mins</span>
            </p>
            <p className="text-xs text-slate-400 mt-1">Focused deep work logged</p>
          </div>

          <div className="glass-card p-5 border-purple-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                Daily Pace
              </span>
              <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
                <Zap size={15} />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-white">
              {profile?.daily_capacity_minutes || 30}{' '}
              <span className="text-sm font-normal text-slate-400">m/day</span>
            </p>
            <p className="text-xs text-slate-400 mt-1">Empathetic budget</p>
          </div>
        </div>

        {/* Charts & Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Track Mission Breakdown Chart */}
          <div className="lg:col-span-8 glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <BookOpen size={16} className="text-brand-400" />
                  Curriculum Mission Map
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  DSA Foundations mission workload and completion status
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm bg-brand-500" />
                  <span className="text-slate-400">Completed</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm bg-white/10" />
                  <span className="text-slate-400">Remaining</span>
                </div>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} unit="m" />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0].payload;
                        return (
                          <div className="glass-card p-3 shadow-xl border border-white/20 text-xs">
                            <p className="font-bold text-white mb-1">{item.fullName}</p>
                            <p className="text-slate-300">Est. Time: {item.minutes} mins</p>
                            <p className="text-brand-400 capitalize mt-1">Status: {item.status.replace('_', ' ')}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="minutes" fill="#1e293b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="completed" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Difficulty Feedback Distribution / Mastery */}
          <div className="lg:col-span-4 glass-card p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                <Sparkles size={16} className="text-amber-400" />
                Difficulty Self-Ratings
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                How missions felt to you (powers AI review pacing)
              </p>

              {pieData.length > 0 ? (
                <div className="h-44 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={70}
                        paddingAngle={4}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="glass-card p-2 text-xs border border-white/20">
                                <p className="font-bold text-white">{payload[0].name}: {payload[0].value} mission(s)</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-44 flex flex-col items-center justify-center text-center p-4 border border-dashed border-white/10 rounded-xl my-2">
                  <p className="text-xs text-slate-400">Complete missions to view difficulty insights.</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/8 text-center text-xs">
              <div>
                <p className="text-emerald-400 font-bold">{difficultyCounts.EASY || 0}</p>
                <p className="text-slate-500 text-[10px]">Easy</p>
              </div>
              <div>
                <p className="text-brand-400 font-bold">{(difficultyCounts.MODERATE || 0) + (difficultyCounts.MEDIUM || 0)}</p>
                <p className="text-slate-500 text-[10px]">Moderate</p>
              </div>
              <div>
                <p className="text-amber-400 font-bold">{difficultyCounts.HARD || 0}</p>
                <p className="text-slate-500 text-[10px]">Hard</p>
              </div>
            </div>
          </div>
        </div>

        {/* Milestones & Badges Section */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Award size={18} className="text-amber-400" />
                Achievements & Badges
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Earn badges as you advance through DSA and maintain your preparation discipline
              </p>
            </div>
            <span className="text-xs text-slate-400">
              {BADGES.filter((b) => b.isUnlocked(stats, allProgress)).length} of {BADGES.length} Unlocked
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {BADGES.map((badge) => {
              const unlocked = badge.isUnlocked(stats, allProgress);
              return (
                <div
                  key={badge.id}
                  className={`p-4 rounded-2xl border text-center transition-all ${
                    unlocked
                      ? 'bg-brand-600/15 border-brand-500/40 shadow-glow-sm'
                      : 'bg-white/5 border-white/8 opacity-50 grayscale'
                  }`}
                >
                  <div className="text-3xl mb-2">{badge.icon}</div>
                  <p className="text-xs font-bold text-white truncate">{badge.title}</p>
                  <p className="text-[10px] text-slate-400 mt-1 leading-tight">{badge.description}</p>
                  {unlocked ? (
                    <span className="inline-block mt-2 px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[9px] font-bold rounded-full">
                      UNLOCKED
                    </span>
                  ) : (
                    <span className="inline-block mt-2 px-2 py-0.5 bg-white/10 text-slate-500 text-[9px] font-bold rounded-full">
                      LOCKED
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Comprehensive Mission History Grid */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Layers size={18} className="text-brand-400" />
                Curriculum Progression Matrix
              </h2>
              <p className="text-xs text-slate-400">
                Detailed view of all 12 modules in your active learning pathway
              </p>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 p-1 rounded-xl">
              {['ALL', 'COMPLETED', 'ACTIVE', 'LOCKED'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setSelectedFilter(filter)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    selectedFilter === filter
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredMissions.map((item) => {
              const { progressId, status, difficultyRating, completedAt, userNotes, mission } = item;
              const isCompleted = status === 'COMPLETED';
              const isInProgress = status === 'IN_PROGRESS' || status === 'AVAILABLE';
              const isLocked = status === 'LOCKED';

              return (
                <div
                  key={progressId}
                  className={`glass-card p-4 flex flex-col justify-between border transition-all ${
                    isCompleted
                      ? 'border-emerald-500/25 bg-emerald-500/5'
                      : isInProgress
                      ? 'border-brand-500/40 bg-brand-600/10 shadow-glow-sm'
                      : 'border-white/5 opacity-60'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/8 text-slate-300">
                          DSA-{String(mission?.sequence_order).padStart(2, '0')}
                        </span>
                        {isCompleted && (
                          <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
                            <CheckCircle2 size={12} /> Completed
                          </span>
                        )}
                        {isInProgress && (
                          <span className="flex items-center gap-1 text-[11px] text-brand-300 font-semibold animate-pulse">
                            <PlayCircle size={12} /> Active Next
                          </span>
                        )}
                        {isLocked && (
                          <span className="flex items-center gap-1 text-[11px] text-slate-500 font-semibold">
                            <Lock size={12} /> Locked
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 text-xs text-slate-400">
                        <Clock size={11} />
                        <span>{mission?.estimated_minutes}m</span>
                      </div>
                    </div>

                    <h4 className="text-sm font-bold text-white mb-1">{mission?.title}</h4>
                    <p className="text-xs text-slate-400 line-clamp-2">{mission?.summary}</p>

                    {/* Notes / rating pill if completed */}
                    {isCompleted && (
                      <div className="mt-3 pt-3 border-t border-white/8 flex items-center justify-between gap-2 text-xs">
                        <span className="text-slate-500">
                          Rated:{' '}
                          <strong
                            className={
                              difficultyRating === 'HARD'
                                ? 'text-amber-400'
                                : difficultyRating === 'EASY'
                                ? 'text-emerald-400'
                                : 'text-brand-300'
                            }
                          >
                            {difficultyRating || 'MEDIUM'}
                          </strong>
                        </span>
                        {userNotes && (
                          <span className="text-slate-400 italic text-[11px] truncate max-w-[180px]">
                            "{userNotes}"
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-2">
                    {isInProgress && (
                      <button
                        onClick={() => navigate(`/mission/${mission.id}`)}
                        className="btn-accent w-full text-xs py-2 justify-center"
                      >
                        Start Mission
                        <ChevronRight size={13} />
                      </button>
                    )}
                    {isCompleted && (
                      <button
                        onClick={() => navigate(`/mission/${mission.id}`)}
                        className="btn-ghost w-full text-xs py-1.5 justify-center text-slate-400 hover:text-white"
                      >
                        Review Material
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

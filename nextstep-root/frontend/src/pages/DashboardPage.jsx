import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchDashboard } from '../services/api';
import Navbar from '../components/Navbar';
import StreakCard from '../components/StreakCard';
import MissionCard from '../components/MissionCard';
import ProgressBar from '../components/ProgressBar';
import { Shuffle, BarChart3, ArrowRight, Zap, Clock, BookOpen, Target } from 'lucide-react';

export default function DashboardPage() {
  const { getToken, profile } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const result = await fetchDashboard(token);
      setData(result);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard.');
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
            <div className="h-8 bg-white/5 rounded-xl w-48" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="h-48 skeleton rounded-2xl" />
              <div className="h-48 skeleton rounded-2xl lg:col-span-2" />
            </div>
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
            <button onClick={loadDashboard} className="btn-primary">Retry</button>
          </div>
        </div>
      </div>
    );
  }

  const { stats, currentMission, allProgress } = data || {};
  const firstName = profile?.full_name?.split(' ')[0] || 'there';

  // Get today's date greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  // Separate missions by status
  const available = allProgress?.filter((p) => p.status === 'AVAILABLE') || [];
  const completed = allProgress?.filter((p) => p.status === 'COMPLETED') || [];
  const locked = allProgress?.filter((p) => p.status === 'LOCKED') || [];

  return (
    <div className="min-h-screen bg-surface-900 bg-grid">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-slate-400 text-sm mb-1">{greeting}, {firstName} 👋</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Today's Dashboard</h1>
            <p className="text-slate-500 text-sm mt-1">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <button
            id="adapt-schedule-btn"
            onClick={() => navigate('/adapt')}
            className="btn-secondary text-sm gap-2 flex-shrink-0"
          >
            <Shuffle size={15} />
            Adapt Schedule
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Missions Done', value: stats?.completedCount || 0, suffix: `/${stats?.totalMissions || 12}`, icon: Target, color: 'brand' },
            { label: 'Current Streak', value: stats?.streak || 0, suffix: ' days', icon: Zap, color: 'amber' },
            { label: 'Completion', value: stats?.completionPercentage || 0, suffix: '%', icon: BarChart3, color: 'emerald' },
            { label: 'Daily Budget', value: profile?.daily_capacity_minutes || 30, suffix: ' min', icon: Clock, color: 'purple' },
          ].map(({ label, value, suffix, icon: Icon, color }) => (
            <div key={label} className="glass-card p-4">
              <div className={`w-7 h-7 rounded-lg mb-2 flex items-center justify-center ${
                color === 'brand' ? 'bg-brand-600/20' :
                color === 'amber' ? 'bg-amber-500/20' :
                color === 'emerald' ? 'bg-emerald-500/20' :
                'bg-purple-500/20'
              }`}>
                <Icon size={15} className={
                  color === 'brand' ? 'text-brand-400' :
                  color === 'amber' ? 'text-amber-400' :
                  color === 'emerald' ? 'text-emerald-400' :
                  'text-purple-400'
                } />
              </div>
              <p className="text-xs text-slate-500 mb-0.5">{label}</p>
              <p className="text-xl font-bold text-white tabular-nums">
                {value}<span className="text-sm font-normal text-slate-400">{suffix}</span>
              </p>
            </div>
          ))}
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Streak + Progress */}
          <div className="space-y-5">
            <StreakCard
              streak={stats?.streak || 0}
              completedCount={stats?.completedCount || 0}
              totalMissions={stats?.totalMissions || 12}
            />

            {/* Track progress */}
            <div className="glass-card p-5">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <BookOpen size={16} className="text-brand-400" />
                DSA Foundations
              </h3>
              <ProgressBar
                percentage={stats?.completionPercentage || 0}
                label="Track Progress"
                color="brand"
              />
              <p className="text-xs text-slate-500 mt-3">
                {locked.length} missions still locked · Complete in order
              </p>
            </div>

            {/* Quick actions */}
            <div className="glass-card p-4 space-y-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Quick Actions</p>
              <button onClick={() => navigate('/adapt')} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/8 transition-colors text-left">
                <Shuffle size={16} className="text-brand-400 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-white">Adapt Schedule</p>
                  <p className="text-xs text-slate-500">Exams or life disruptions?</p>
                </div>
                <ArrowRight size={14} className="text-slate-500 ml-auto" />
              </button>
              <button onClick={() => navigate('/progress')} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/8 transition-colors text-left">
                <BarChart3 size={16} className="text-emerald-400 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-white">View Progress</p>
                  <p className="text-xs text-slate-500">Full history & heatmap</p>
                </div>
                <ArrowRight size={14} className="text-slate-500 ml-auto" />
              </button>
            </div>
          </div>

          {/* Right: Today's mission + all missions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Today's Mission */}
            <div>
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Today's Mission
              </h2>
              {currentMission ? (
                <div className="glass-card p-5 border border-brand-500/20">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <p className="text-xs text-brand-400 font-mono mb-1">
                        DSA-{String(currentMission.mission?.sequence_order).padStart(2, '0')}
                      </p>
                      <h3 className="text-xl font-bold text-white">{currentMission.mission?.title}</h3>
                      <p className="text-sm text-slate-400 mt-1">{currentMission.mission?.summary}</p>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-600/20 border border-brand-500/30 rounded-full flex-shrink-0">
                      <Clock size={12} className="text-brand-400" />
                      <span className="text-xs font-semibold text-brand-300">
                        {currentMission.mission?.estimated_minutes}m
                      </span>
                    </div>
                  </div>
                  <button
                    id="start-today-mission"
                    onClick={() => navigate(`/mission/${currentMission.mission?.id}`)}
                    className="btn-accent w-full"
                  >
                    {currentMission.status === 'IN_PROGRESS' ? 'Continue Mission' : 'Start Mission'}
                    <ArrowRight size={16} />
                  </button>
                </div>
              ) : (
                <div className="glass-card p-8 text-center">
                  <div className="text-4xl mb-3">🎉</div>
                  <h3 className="font-bold text-white mb-1">All missions completed!</h3>
                  <p className="text-sm text-slate-400">You've crushed the entire DSA Foundations track.</p>
                </div>
              )}
            </div>

            {/* Mission sequence */}
            <div>
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Mission Sequence
              </h2>
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                {allProgress?.map((p) => (
                  <MissionCard
                    key={p.progressId}
                    mission={p.mission}
                    status={p.status}
                    sequenceOrder={p.mission?.sequence_order}
                    compact
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

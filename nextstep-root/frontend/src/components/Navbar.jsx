import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap, LayoutDashboard, BookOpen, BarChart3, Shuffle, LogOut, ChevronRight } from 'lucide-react';

const NavLink = ({ to, icon: Icon, label, active }) => (
  <Link
    to={to}
    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
      active
        ? 'bg-brand-600/20 text-brand-300 border border-brand-500/30'
        : 'text-slate-400 hover:text-white hover:bg-white/8'
    }`}
  >
    <Icon size={16} />
    <span className="hidden sm:inline">{label}</span>
  </Link>
);

export default function Navbar() {
  const { profile, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (!isAuthenticated) return null;

  return (
    <nav className="sticky top-0 z-50 border-b border-white/8">
      <div className="absolute inset-0 bg-surface-900/80 backdrop-blur-xl" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2.5 flex-shrink-0">
          <div className="relative">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-600 to-accent-500 flex items-center justify-center">
              <span className="text-white font-black text-sm">N</span>
            </div>
            <div className="absolute -inset-0.5 bg-gradient-to-br from-brand-600 to-accent-500 rounded-xl blur opacity-40" />
          </div>
          <span className="font-bold text-white hidden sm:block">NextStep</span>
        </Link>

        {/* Nav Links */}
        <div className="flex items-center gap-1">
          <NavLink to="/dashboard" icon={LayoutDashboard} label="Dashboard" active={path === '/dashboard'} />
          <NavLink to="/adapt" icon={Shuffle} label="Adapt" active={path === '/adapt'} />
          <NavLink to="/progress" icon={BarChart3} label="Progress" active={path === '/progress'} />
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          {/* Streak pill */}
          {profile?.current_streak > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/15 border border-amber-500/30 rounded-full">
              <Zap size={13} className="text-amber-400 fill-amber-400" />
              <span className="text-amber-300 text-xs font-bold">{profile.current_streak}</span>
            </div>
          )}

          {/* Avatar */}
          <div className="relative group">
            <button className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-white/8 transition-all">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">
                  {profile?.full_name?.[0]?.toUpperCase() || '?'}
                </span>
              </div>
              <ChevronRight size={12} className="text-slate-400 rotate-90" />
            </button>

            {/* Dropdown */}
            <div className="absolute right-0 top-full mt-2 w-48 glass-card py-1 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-200 translate-y-1 group-hover:translate-y-0">
              <div className="px-3 py-2 border-b border-white/10">
                <p className="text-sm font-medium text-white truncate">{profile?.full_name}</p>
                <p className="text-xs text-slate-400 truncate">{profile?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <LogOut size={14} />
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

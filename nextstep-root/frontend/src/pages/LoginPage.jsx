import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, ArrowRight, Eye, EyeOff, Zap, AlertCircle } from 'lucide-react';

const DEMO_EMAIL = 'demo@nextstep.ai';
const DEMO_PASSWORD = 'password123';

export default function LoginPage() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email.trim(), password);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.message?.toLowerCase() || '';
      if (msg.includes('invalid login credentials') || msg.includes('invalid_credentials')) {
        setError('Incorrect email or password. Please verify your details or sign up for a new account.');
      } else if (msg.includes('email not confirmed')) {
        setError('Please check your inbox to confirm your email before signing in, or use Quick Demo Login.');
      } else {
        setError(err.message || 'Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async () => {
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
    setError('');
    setLoading(true);
    try {
      try {
        await login(DEMO_EMAIL, DEMO_PASSWORD);
      } catch (loginErr) {
        // If demo user does not exist in Supabase yet, automatically provision it!
        if (
          loginErr.message?.toLowerCase().includes('invalid login') ||
          loginErr.message?.toLowerCase().includes('invalid_credentials') ||
          loginErr.message?.toLowerCase().includes('user not found')
        ) {
          await register(DEMO_EMAIL, DEMO_PASSWORD, 'Demo Candidate');
          await login(DEMO_EMAIL, DEMO_PASSWORD);
        } else {
          throw loginErr;
        }
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Demo login encountered an issue. Please try signing up with your email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-900 bg-grid flex items-center justify-center p-4">
      {/* Background ambient orbs */}
      <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/4 w-64 h-64 bg-accent-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md animate-slide-up">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-6">
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-600 to-accent-500 flex items-center justify-center">
                <span className="text-white font-black">N</span>
              </div>
              <div className="absolute -inset-0.5 bg-gradient-to-br from-brand-600 to-accent-500 rounded-2xl blur opacity-40" />
            </div>
            <span className="text-xl font-bold text-white">NextStep</span>
          </Link>
          <h1 className="text-2xl font-bold text-white mb-1">Welcome back</h1>
          <p className="text-slate-400 text-sm">Continue your personalised DSA placement journey</p>
        </div>

        {/* Form card */}
        <div className="glass-card p-6 mb-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3.5 bg-red-500/10 border border-red-500/25 rounded-xl text-sm text-red-300 flex items-start gap-2.5 animate-fade-in">
                <AlertCircle size={17} className="text-red-400 flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="login-email" className="block text-sm font-medium text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="input-field pl-10"
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="login-password" className="block text-sm font-medium text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  id="login-password"
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="input-field pl-10 pr-10"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-2 justify-center"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                <>
                  Sign In
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-surface-800 text-xs text-slate-500 rounded">or</span>
            </div>
          </div>

          <button
            id="demo-login"
            type="button"
            onClick={handleDemo}
            disabled={loading}
            className="btn-secondary w-full gap-2 justify-center"
          >
            <Zap size={16} className="text-amber-400" />
            Quick Demo Login (1-Click)
          </button>
        </div>

        <p className="text-center text-sm text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" className="text-brand-400 hover:text-brand-300 font-semibold transition-colors">
            Create account free
          </Link>
        </p>
      </div>
    </div>
  );
}

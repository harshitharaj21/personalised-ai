import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { syncUser } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const getToken = useCallback(async () => {
    try {
      const { data } = await supabase.auth.getSession();
      return data?.session?.access_token || null;
    } catch (e) {
      return null;
    }
  }, []);

  const loadProfile = useCallback(async (supabaseUser, accessToken) => {
    if (!supabaseUser) return;
    try {
      if (accessToken) {
        const result = await syncUser(
          accessToken,
          supabaseUser.user_metadata?.full_name || supabaseUser.email?.split('@')[0] || 'Candidate',
          supabaseUser.email
        );
        if (result?.profile) {
          setProfile(result.profile);
          return;
        }
      }
    } catch (err) {
      console.warn('Backend profile sync warning (falling back to auth session):', err.message);
    }

    // Resilient fallback profile so student is never stuck
    setProfile((prev) => prev || {
      id: supabaseUser.id,
      email: supabaseUser.email,
      full_name: supabaseUser.user_metadata?.full_name || supabaseUser.email?.split('@')[0] || 'Candidate',
      daily_capacity_minutes: null,
      current_streak: 0,
    });
  }, []);

  useEffect(() => {
    let mounted = true;

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user, session.access_token);
      }
      setLoading(false);
    }).catch(() => {
      if (mounted) setLoading(false);
    });

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await loadProfile(session.user, session.access_token);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, [loadProfile]);

  const register = async (email, password, fullName) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) throw error;
    if (data?.session?.user) {
      setUser(data.session.user);
      setSession(data.session);
      await loadProfile(data.session.user, data.session.access_token);
    }
    return data;
  };

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (data?.session?.user) {
      setUser(data.session.user);
      setSession(data.session);
      await loadProfile(data.session.user, data.session.access_token);
    }
    return data;
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (_) {}
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  const refreshProfile = useCallback(async () => {
    const token = await getToken();
    if (user) await loadProfile(user, token);
  }, [user, getToken, loadProfile]);

  const value = {
    user,
    session,
    profile,
    loading,
    register,
    login,
    logout,
    getToken,
    refreshProfile,
    isAuthenticated: !!user,
    hasProfile: !!profile,
    isOnboarded: !!(profile && profile.daily_capacity_minutes),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

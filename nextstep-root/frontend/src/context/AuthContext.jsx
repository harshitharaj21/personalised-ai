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
    const { data } = await supabase.auth.getSession();
    return data?.session?.access_token || null;
  }, []);

  const loadProfile = useCallback(async (supabaseUser, accessToken) => {
    if (!supabaseUser || !accessToken) return;
    try {
      const result = await syncUser(accessToken, supabaseUser.user_metadata?.full_name || supabaseUser.email, supabaseUser.email);
      if (result?.profile) setProfile(result.profile);
    } catch (err) {
      console.error('Profile load error:', err);
    }
  }, []);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user && session?.access_token) {
        loadProfile(session.user, session.access_token);
      }
      setLoading(false);
    });

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user && session?.access_token) {
        await loadProfile(session.user, session.access_token);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [loadProfile]);

  const register = async (email, password, fullName) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) throw error;
    return data;
  };

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  const refreshProfile = useCallback(async () => {
    const token = await getToken();
    if (user && token) await loadProfile(user, token);
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

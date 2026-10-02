import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session } from '@supabase/supabase-js';
import { UserProfile } from '../types';
import { SupabaseService, supabase, isSupabaseConfigured } from '../services/supabaseClient';

interface AuthContextType {
  user: UserProfile | null;
  session: Session | null;
  isLoggedIn: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<UserProfile>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<UserProfile | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfileAndSetState = async (sessionUser: any) => {
    try {
      let profile = await SupabaseService.fetchProfile(sessionUser.id);
      if (!profile) {
        // Fallback profile if row hasn't propagated yet
        profile = {
          id: sessionUser.id,
          name: sessionUser.user_metadata?.name || sessionUser.email?.split('@')[0] || 'User',
          email: sessionUser.email || '',
          ageGroup: '25-34',
          activityLevel: 'Lightly Active',
          experience: 'Beginner',
          location: 'Home',
          availableDays: 4,
          durationMinutes: 30,
          preferredTime: 'Morning (7:00 AM)',
          equipment: ['None (Bodyweight)'],
          preferredActivities: ['Bodyweight Training'],
          preferences: '',
          language: 'en',
          isAdmin: false
        };
      }

      // Auto-elevate admin status for master admin email accounts
      const userEmail = (profile.email || sessionUser.email || '').toLowerCase();
      if (userEmail.includes('admin@') || userEmail.startsWith('admin')) {
        profile.isAdmin = true;
        profile.role = 'admin';
      }

      setUser(profile);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching auth user profile:', err);
      setError(err.message || 'Failed to resolve user profile');
    }
  };

  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      if (!isSupabaseConfigured()) {
        if (mounted) setIsLoading(false);
        return;
      }

      try {
        const currentSession = await SupabaseService.getCurrentSession();
        if (currentSession?.user) {
          if (mounted) setSession(currentSession);
          await fetchProfileAndSetState(currentSession.user);
        }
      } catch (err: any) {
        console.error('Auth initialization error:', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    initAuth();

    if (isSupabaseConfigured()) {
      const { data: authListener } = supabase.auth.onAuthStateChange(async (event, newSession) => {
        if (!mounted) return;
        setSession(newSession);

        if (newSession?.user) {
          await fetchProfileAndSetState(newSession.user);
        } else {
          setUser(null);
        }
        setIsLoading(false);
      });

      return () => {
        mounted = false;
        authListener.subscription.unsubscribe();
      };
    }
  }, []);

  const signIn = async (email: string, password: string): Promise<UserProfile> => {
    setError(null);
    const data = await SupabaseService.signIn(email, password);
    if (!data.user) throw new Error('Invalid email or password');
    setSession(data.session);

    let profile = await SupabaseService.fetchProfile(data.user.id);
    if (!profile) {
      profile = {
        id: data.user.id,
        name: data.user.user_metadata?.name || email.split('@')[0],
        email: email.toLowerCase(),
        ageGroup: '25-34',
        activityLevel: 'Lightly Active',
        experience: 'Beginner',
        location: 'Home',
        availableDays: 4,
        durationMinutes: 30,
        preferredTime: 'Morning (7:00 AM)',
        equipment: ['None (Bodyweight)'],
        preferredActivities: ['Bodyweight Training'],
        preferences: '',
        language: 'en',
        isAdmin: false
      };
      await SupabaseService.upsertProfile(profile);
    }
    // Auto-elevate admin status for master admin email accounts
    const userEmail = email.toLowerCase();
    if (userEmail.includes('admin@') || userEmail.startsWith('admin')) {
      profile.isAdmin = true;
      profile.role = 'admin';
      try {
        await SupabaseService.upsertProfile({ id: profile.id, isAdmin: true, role: 'admin' } as any);
      } catch (e) {
        console.warn('Could not auto-update admin flag in DB:', e);
      }
    }

    setUser(profile);
    return profile;
  };

  const signUp = async (email: string, password: string, name: string): Promise<void> => {
    setError(null);
    await SupabaseService.signUp(email, password, name);
  };

  const signOut = async (): Promise<void> => {
    await SupabaseService.signOut();
    setUser(null);
    setSession(null);
  };

  const resetPassword = async (email: string): Promise<void> => {
    await SupabaseService.resetPassword(email);
  };

  const refreshProfile = async (): Promise<void> => {
    if (session?.user) {
      await fetchProfileAndSetState(session.user);
    }
  };

  const value = {
    user,
    session,
    isLoggedIn: Boolean(user && session),
    isAdmin: Boolean(user?.isAdmin || user?.role === 'admin'),
    isLoading,
    error,
    signIn,
    signUp,
    signOut,
    resetPassword,
    refreshProfile,
    setUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

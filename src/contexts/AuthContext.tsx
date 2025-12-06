'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  profile: any | null;
  loading: boolean;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      (() => {
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchProfile(session.user.id);
        } else {
          setProfile(null);
          setLoading(false);
        }
      })();
    });
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      // Get user email from auth
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (!authUser?.email) {
        setProfile(null);
        setLoading(false);
        return;
      }

      // Find account by email
      const { data: accountData, error: accountError } = await supabase
        .from('account')
        .select('*, users(*)')
        .eq('email', authUser.email)
        .maybeSingle();

      if (accountError && accountError.code !== 'PGRST116') {
        console.error('Error fetching account:', accountError);
      }

      // Get traveller info if exists
      if (accountData?.id_user) {
        const { data: travellerData } = await supabase
          .from('traveller')
          .select('*')
          .eq('id_user', accountData.id_user)
          .maybeSingle();

        // Combine account and traveller data
        setProfile({
          ...accountData,
          ...travellerData,
          username: accountData?.username,
          email: accountData?.email,
          avatar_url: accountData?.users?.avatar_url || null,
          name: accountData?.users?.name || accountData?.username,
          points: 0, // Default points
          rank: 'bronze', // Default rank
          created_at: accountData?.users?.created_at || new Date().toISOString(),
        });
      } else {
        // Fallback: create minimal profile from auth user
        setProfile({
          username: authUser.email?.split('@')[0] || 'user',
          email: authUser.email,
          name: authUser.email?.split('@')[0] || 'User',
          points: 0,
          rank: 'bronze',
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Fallback profile
      setProfile({
        username: 'user',
        email: userId,
        points: 0,
        rank: 'bronze',
      });
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, username: string) => {
    // Sign up with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username,
        },
      },
    });
  
    if (error) throw error;
  
    // Profile will be created automatically by database trigger
    // Wait a moment for trigger to complete
    if (data.user) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const value = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

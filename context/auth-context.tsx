'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '@/lib/types';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

interface StoredAccount {
  id: string;
  email: string;
  fullName: string;
  password?: string;
  role: UserRole;
  phone?: string;
  defaultAddress?: string;
  createdAt: string;
}

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole;
  isAdmin: boolean;
  loginWithEmail: (email: string, password?: string) => UserProfile;
  signupWithEmail: (fullName: string, email: string, password?: string) => UserProfile;
  signInWithGoogle: () => Promise<void>;
  logout: () => void;
  updateProfile: (updated: Partial<UserProfile>) => void;
  isSupabaseLive: boolean;
  isLoadingAuth: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_EMAILS = ['admin@dspace.com'];

const checkIsAdmin = (email: string, metaRole?: string): boolean => {
  if (metaRole === 'admin') return true;
  return ADMIN_EMAILS.includes(email.toLowerCase().trim());
};

const DEFAULT_ACCOUNTS: StoredAccount[] = [
  {
    id: 'usr_admin',
    email: 'admin@dspace.com',
    fullName: 'Dspace Admin',
    password: 'admin',
    role: 'admin',
    phone: '+91 98450 12345',
    defaultAddress: '1273, HAL 3rd Stage, New Thippasandra, Bengaluru 560075',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
];

const getStoredAccounts = (): StoredAccount[] => {
  if (typeof window === 'undefined') return DEFAULT_ACCOUNTS;
  try {
    const raw = localStorage.getItem('dspace_registered_accounts');
    if (!raw) {
      localStorage.setItem('dspace_registered_accounts', JSON.stringify(DEFAULT_ACCOUNTS));
      return DEFAULT_ACCOUNTS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem('dspace_registered_accounts', JSON.stringify(DEFAULT_ACCOUNTS));
      return DEFAULT_ACCOUNTS;
    }
    // Ensure admin account is always present
    const hasAdmin = parsed.some((a: StoredAccount) => a.email.toLowerCase() === 'admin@dspace.com');
    if (!hasAdmin) {
      parsed.unshift(DEFAULT_ACCOUNTS[0]);
      localStorage.setItem('dspace_registered_accounts', JSON.stringify(parsed));
    }
    return parsed;
  } catch {
    return DEFAULT_ACCOUNTS;
  }
};

const saveStoredAccounts = (accounts: StoredAccount[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('dspace_registered_accounts', JSON.stringify(accounts));
  } catch (err) {
    console.error('Failed to save registered accounts:', err);
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const isSupabaseLive = isSupabaseConfigured();

  useEffect(() => {
    // Initialize default accounts in storage if needed
    getStoredAccounts();

    // Check saved session from localStorage (if any previously logged in)
    const saved = localStorage.getItem('dspace_current_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setUser(parsed);
      } catch {
        // ignore
      }
    }
    setIsLoadingAuth(false);

    if (isSupabaseLive) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          const meta = session.user.user_metadata || {};
          const userEmail = session.user.email || '';
          const isUserAdmin = checkIsAdmin(userEmail, meta.role);
          const liveUser: UserProfile = {
            id: session.user.id,
            email: userEmail,
            fullName: meta.full_name || meta.name || session.user.email?.split('@')[0] || 'Hardware Maker',
            role: isUserAdmin ? 'admin' : 'user',
            phone: session.user.phone,
            defaultAddress: meta.default_address,
          };
          setUser(liveUser);
          localStorage.setItem('dspace_current_user', JSON.stringify(liveUser));
        }
        setIsLoadingAuth(false);
      });

      const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
        if (session?.user) {
          const meta = session.user.user_metadata || {};
          const userEmail = session.user.email || '';
          const isUserAdmin = checkIsAdmin(userEmail, meta.role);
          const liveUser: UserProfile = {
            id: session.user.id,
            email: userEmail,
            fullName: meta.full_name || meta.name || session.user.email?.split('@')[0] || 'Hardware Maker',
            role: isUserAdmin ? 'admin' : 'user',
            phone: session.user.phone,
            defaultAddress: meta.default_address,
          };
          setUser(liveUser);
          localStorage.setItem('dspace_current_user', JSON.stringify(liveUser));
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          localStorage.removeItem('dspace_current_user');
        }
      });

      return () => {
        authListener.subscription.unsubscribe();
      };
    }
  }, [isSupabaseLive]);

  const updateUserState = (newUser: UserProfile | null) => {
    setUser(newUser);
    if (newUser) {
      localStorage.setItem('dspace_current_user', JSON.stringify(newUser));
    } else {
      localStorage.removeItem('dspace_current_user');
    }
  };

  const loginWithEmail = (email: string, password?: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    if (!cleanEmail) {
      throw new Error('Please enter your email address.');
    }
    if (!cleanPassword) {
      throw new Error('Please enter your password.');
    }

    const accounts = getStoredAccounts();
    const matchedAccount = accounts.find((a) => a.email.toLowerCase().trim() === cleanEmail);

    if (!matchedAccount) {
      throw new Error(`No registered account found for "${cleanEmail}". Please sign up first.`);
    }

    // Check password match
    if (matchedAccount.password && matchedAccount.password !== cleanPassword) {
      throw new Error('Incorrect password. Please enter the same password you provided during sign up.');
    }

    const isUserAdmin = matchedAccount.role === 'admin' || checkIsAdmin(cleanEmail);
    const loggedProfile: UserProfile = {
      id: matchedAccount.id,
      email: matchedAccount.email,
      fullName: matchedAccount.fullName,
      role: isUserAdmin ? 'admin' : 'user',
      phone: matchedAccount.phone,
      defaultAddress: matchedAccount.defaultAddress,
    };

    updateUserState(loggedProfile);
    return loggedProfile;
  };

  const signupWithEmail = (fullName: string, email: string, password?: string) => {
    const cleanName = fullName.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    if (!cleanName) {
      throw new Error('Please enter your full name or organization name.');
    }
    if (!cleanEmail || !cleanEmail.includes('@')) {
      throw new Error('Please enter a valid email address.');
    }
    if (!cleanPassword || cleanPassword.length < 4) {
      throw new Error('Password must be at least 4 characters long.');
    }

    const accounts = getStoredAccounts();
    const existing = accounts.find((a) => a.email.toLowerCase().trim() === cleanEmail);

    if (existing) {
      throw new Error(`An account with email "${cleanEmail}" is already registered. Please sign in instead.`);
    }

    const isUserAdmin = checkIsAdmin(cleanEmail);
    const newAccount: StoredAccount = {
      id: `usr_${Date.now()}`,
      email: cleanEmail,
      fullName: cleanName,
      password: cleanPassword,
      role: isUserAdmin ? 'admin' : 'user',
      createdAt: new Date().toISOString(),
    };

    accounts.push(newAccount);
    saveStoredAccounts(accounts);

    if (isSupabaseLive) {
      try {
        supabase.auth.signUp({
          email: cleanEmail,
          password: cleanPassword,
          options: {
            data: {
              full_name: cleanName,
              role: newAccount.role,
            },
          },
        });
      } catch (err) {
        console.warn('Supabase signup background error:', err);
      }
    }

    const newProfile: UserProfile = {
      id: newAccount.id,
      email: newAccount.email,
      fullName: newAccount.fullName,
      role: newAccount.role,
    };

    updateUserState(newProfile);
    return newProfile;
  };

  const updateProfile = (updated: Partial<UserProfile>) => {
    if (!user) return;
    const cleanEmail = user.email.toLowerCase().trim();
    const updatedProfile: UserProfile = {
      ...user,
      ...updated,
    };
    updateUserState(updatedProfile);

    // Also update in registered accounts
    const accounts = getStoredAccounts();
    const idx = accounts.findIndex((a) => a.email.toLowerCase().trim() === cleanEmail);
    if (idx !== -1) {
      accounts[idx] = {
        ...accounts[idx],
        fullName: updated.fullName || accounts[idx].fullName,
        phone: updated.phone || accounts[idx].phone,
        defaultAddress: updated.defaultAddress || accounts[idx].defaultAddress,
      };
      saveStoredAccounts(accounts);
    }
  };

  const signInWithGoogle = async () => {
    if (isSupabaseLive) {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined,
        },
      });
      if (error) throw error;
    } else {
      throw new Error('Supabase Google OAuth is not configured. Please configure NEXT_PUBLIC_SUPABASE_URL in .env.local to enable live Google sign-in.');
    }
  };

  const logout = () => {
    updateUserState(null);
    if (isSupabaseLive) {
      try {
        supabase.auth.signOut();
      } catch (err) {
        console.warn('Supabase sign out error:', err);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user ? user.role : 'user',
        isAdmin: user?.role === 'admin',
        loginWithEmail,
        signupWithEmail,
        signInWithGoogle,
        logout,
        updateProfile,
        isSupabaseLive,
        isLoadingAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

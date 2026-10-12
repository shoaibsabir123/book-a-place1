import React, { createContext, useContext, useState, useEffect } from 'react';
import { Profile, UserRoleType } from '../types';
import { INITIAL_PROFILES } from '../lib/mockData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AuthContextType {
  user: Profile | null;
  role: UserRoleType;
  setRole: (role: UserRoleType) => void;
  signIn: (email: string, role?: UserRoleType) => Promise<void>;
  signUp: (email: string, name: string, role?: UserRoleType) => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
  isHost: boolean;
  isAdmin: boolean;
  currency: 'PKR' | 'USD' | 'AED' | 'GBP';
  setCurrency: (currency: 'PKR' | 'USD' | 'AED' | 'GBP') => void;
  formatPrice: (amountInPkr: number) => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Profile | null>(() => {
    const saved = localStorage.getItem('bap_current_user');
    return saved ? JSON.parse(saved) : INITIAL_PROFILES[0];
  });

  const [role, setRoleState] = useState<UserRoleType>(() => {
    const savedRole = localStorage.getItem('bap_active_role');
    return (savedRole as UserRoleType) || 'customer';
  });

  const [currency, setCurrencyState] = useState<'PKR' | 'USD' | 'AED' | 'GBP'>(() => {
    const savedCurr = localStorage.getItem('bap_currency');
    return (savedCurr as any) || 'PKR';
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('bap_current_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('bap_current_user');
    }
  }, [user]);

  const setRole = (newRole: UserRoleType) => {
    setRoleState(newRole);
    localStorage.setItem('bap_active_role', newRole);
  };

  const setCurrency = (c: 'PKR' | 'USD' | 'AED' | 'GBP') => {
    setCurrencyState(c);
    localStorage.setItem('bap_currency', c);
  };

  // Convert and format PKR prices
  const formatPrice = (amountInPkr: number): string => {
    if (currency === 'USD') {
      const usd = Math.round(amountInPkr / 280);
      return `$${usd.toLocaleString()}`;
    }
    if (currency === 'AED') {
      const aed = Math.round(amountInPkr / 76);
      return `AED ${aed.toLocaleString()}`;
    }
    if (currency === 'GBP') {
      const gbp = Math.round(amountInPkr / 365);
      return `£${gbp.toLocaleString()}`;
    }
    return `PKR ${Math.round(amountInPkr).toLocaleString()}`;
  };

  const signIn = async (email: string, targetRole: UserRoleType = 'customer') => {
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signInWithOtp({ email });
      } catch (e) {
        console.warn('Supabase signIn OTP:', e);
      }
    }
    const matched = INITIAL_PROFILES.find(p => p.email.toLowerCase() === email.toLowerCase()) || {
      id: `user-${Date.now()}`,
      email,
      full_name: email.split('@')[0],
      phone: '+92 300 0000000',
      is_verified: true,
      city: 'Islamabad',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setUser(matched);
    setRole(targetRole);
  };

  const signUp = async (email: string, name: string, targetRole: UserRoleType = 'customer') => {
    const newUser: Profile = {
      id: `user-${Date.now()}`,
      email,
      full_name: name,
      phone: '+92 300 0000000',
      is_verified: false,
      city: 'Lahore',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setUser(newUser);
    setRole(targetRole);
  };

  const signOut = async () => {
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('Supabase signOut error:', e);
      }
    }
    setUser(null);
    setRole('customer');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        setRole,
        signIn,
        signUp,
        signOut,
        isAuthenticated: !!user,
        isHost: role === 'host' || role === 'admin',
        isAdmin: role === 'admin',
        currency,
        setCurrency,
        formatPrice
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

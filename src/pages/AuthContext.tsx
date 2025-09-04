import React, { createContext, useContext, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

interface SupabaseUser {
  id: string;
  email: string | null;
}

interface AuthContextType {
  user: SupabaseUser | null;
  login: (user: SupabaseUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);


export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<SupabaseUser | null>(null);


  const login = (user: SupabaseUser) => {
    setUser(user);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  React.useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        setUser({ id: data.session.user.id, email: data.session.user.email });
      } else {
        setUser(null);
      }
    };
    getSession();
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email });
      } else {
        setUser(null);
      }
    });
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
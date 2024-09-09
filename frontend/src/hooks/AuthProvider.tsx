"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';

type User = {
  id: string;
  email: string;
  // Add other user properties as needed
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if the user is already logged in
    checkUserSession();
  }, []);

  const checkUserSession = async () => {
    try {
      const response = await fetch('/api/auth/session');
      if (response.ok) {
        const session = await response.json();
        setUser(session.user);
      }
    } catch (error) {
      console.error('Failed to fetch session:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setUser({email: "a@gmail.com", id: "iadnv"});


    // setLoading(true);
    // try {
    //   const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/TODOSIGNINENDPOINT`, {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ email, password }),
    //   });
    //   if (response.ok) {
    //     const userData = await response.json();
    //     setUser(userData);
    //   } else {
    //     throw new Error('Sign in failed');
    //   }
    // } catch (error) {
    //   console.error('Sign in error:', error);
    //   throw error;
    // } finally {
    //   setLoading(false);
    // }
  };

  const signUp = async (email: string, password: string) => {
    
    setUser({email: "a@gmail.com", id: "iadnv"});

    // setLoading(true);
    // try {
    //   const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/TODOSIGNUPENDPOINT`, {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ email, password }),
    //   });
    //   if (response.ok) {
    //     const userData = await response.json();
    //     setUser(userData);
    //   } else {
    //     throw new Error('Sign up failed');
    //   }
    // } catch (error) {
    //   console.error('Sign up error:', error);
    //   throw error;
    // } finally {
    //   setLoading(false);
    // }
  };

  const signOut = async () => {

    setUser(null);
    // setLoading(true);
    // try {
    //   const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/TODOSIGNOUTENDPOINT`, { method: 'POST'});
    //   if (response.ok) {
    //     setUser(null);
    //   } else {
    //     throw new Error('Sign out failed');
    //   }
    // } catch (error) {
    //   console.error('Sign out error:', error);
    //   throw error;
    // } finally {
    //   setLoading(false);
    // }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
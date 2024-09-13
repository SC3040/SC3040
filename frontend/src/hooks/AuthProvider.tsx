"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';

type User = {
  id: string;
  email: string;
  // Add other user properties as needed
};

type SignInUser = {
  username: string;
  password: string;
}

type SignUpUser = {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (data : SignInUser) => Promise<void>;
  signUp: (data : SignUpUser) => Promise<void>;
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
  const [loading, setLoading] = useState(false);


  const signIn = async (data: SignInUser) => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Sign in failed');
      }
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (data: SignUpUser) => {
    console.log('Sending signup data:', JSON.stringify(data, null, 2));
    
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        const errorData = await response.json();
        console.error('Server response:', response.status, errorData);
        throw new Error(errorData.message || 'Sign up failed');
      }
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
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
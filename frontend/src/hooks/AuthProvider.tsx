"use client"

import React, { createContext, useContext, useState } from 'react';
import { signIn, signUp, signOut } from '@/app/api/auth/route';
import { useRouter } from 'next/navigation';

type User = {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  image: string;
}

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
  securityQuestion: string;
  securityAnswer: string;
}

type AuthContextType = {
  user: User | undefined;
  loading: boolean;
  signIn: (data: SignInUser) => Promise<void>;
  signUp: (data: SignUpUser) => Promise<void>;
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
  const [user, setUser] = useState<User | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignIn = async (data: SignInUser) => {
    setLoading(true);
    try {
      const result = await signIn(data);
      if (result.success) {
        setUser(result.user);
        router.push('/home');
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (data: SignUpUser) => {
    setLoading(true);
    try {
      const result = await signUp(data);
      if (result.success) {
        setUser(result.user);
        router.push('/home');
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      console.log("[AuthProvider]: handleSignOut before await")
      const result = await signOut();
      console.log("[AuthProvider]: handleSignOut after await")
      console.log("[AuthProvider] result:", result)
      setUser(undefined)
      router.push("/")

      // commented out because result could never be success, not sure if frontend/backend bug
      // if (result.success) {
      //   setUser(undefined);
      //   router.push('/');
      // } else {
      //   console.error('Sign out failed:', result.error);
      // }
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    signIn: handleSignIn,
    signUp: handleSignUp,
    signOut: handleSignOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
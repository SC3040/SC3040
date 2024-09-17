'use server'

import { cookies } from 'next/headers'

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



export async function signIn(data: SignInUser) {
  try {
    const response = await fetch(`${process.env.BACKEND_URL}/api/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      const data = await response.json();
      console.log("received data:", data)
      // Set the JWT token in an HTTP-only cookie
      cookies().set('jwt', data.token, { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/'
      });
      await new Promise(resolve => setTimeout(resolve, 500));
      return { success: true, user: {
        id: data._id,
        username: data.username,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        image: data.image
      } };
    } else {
      const errorData = await response.json();
      return { success: false, error: errorData.message || 'Sign in failed' };
    }
  } catch (error) {
    console.error('Sign in error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function signUp(data: SignUpUser) {

  try {
    const response = await fetch(`${process.env.BACKEND_URL}/api/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      const data = await response.json();
      // Set the JWT token in an HTTP-only cookie
      cookies().set('jwt', data.token, { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/'
      });
      await new Promise(resolve => setTimeout(resolve, 500));
      return { success: true, user: {
        id: data._id,
        username: data.username,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        image: data.image
      } };
    } else {
      const errorData = await response.json();
      return { success: false, error: errorData.message || 'Sign up failed' };
    }
  } catch (error) {
    console.error('Sign up error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function signOut() {
  
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/logout`, {
      method: 'POST',
    });

    if (response.ok) {
      // Clear the JWT token cookie
      cookies().delete('jwt');
      return { success: true };
    } else {
      const errorData = await response.json();
      return { success: false, error: errorData.message || 'Sign out failed' };
    }
  } catch (error) {
    console.error('Sign out error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}
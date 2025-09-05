"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore'; // setDoc removed - unused
import { getFirebaseAuth, getFirebaseDB } from '@/lib/firebase';
import { setUserRole as setUserRoleInFirestore } from '@/lib/authUtils';

// Helper function to get user-friendly Firebase error messages
const getFirebaseErrorMessage = (error: unknown): string => {
  const firebaseError = error as { code?: string; message?: string };
  switch (firebaseError.code) {
    case 'auth/user-not-found':
      return 'No user found with this email address.';
    case 'auth/wrong-password':
      return 'Incorrect password.';
    case 'auth/invalid-email':
      return 'Invalid email address.';
    case 'auth/user-disabled':
      return 'This account has been disabled.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.';
    case 'auth/invalid-credential':
      return 'Invalid email or password. Please check your credentials and try again.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection.';
    case 'auth/operation-not-allowed':
      return 'Email/password accounts are not enabled. Please contact support.';
    case 'auth/requires-recent-login':
      return 'This operation requires recent authentication. Please log in again.';
    default:
      return firebaseError.message || 'An error occurred during authentication.';
  }
};

interface UserRole {
  role: 'admin' | 'user';
  email: string;
  name?: string;
  createdAt: Date;
}

interface AuthContextType {
  user: User | null;
  userRole: UserRole | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const auth = getFirebaseAuth();
  const db = getFirebaseDB();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        // Fetch user role from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserRole({
              role: userData.role || 'user',
              email: userData.email || user.email || '',
              name: userData.name,
              createdAt: userData.createdAt?.toDate() || new Date(),
            });
          } else {
            // If user document doesn't exist, create one with default role
            setUserRole({
              role: 'user',
              email: user.email || '',
              name: user.displayName || '',
              createdAt: new Date(),
            });
          }
        } catch (error) {
          console.error('Error fetching user role:', error);
          setUserRole({
            role: 'user',
            email: user.email || '',
            name: user.displayName || '',
            createdAt: new Date(),
          });
        }
      } else {
        setUser(null);
        setUserRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth, db]);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: unknown) {
      console.error('Sign in error:', error);
      setError(getFirebaseErrorMessage(error));
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name?: string) => {
    try {
      setLoading(true);
      setError(null);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user document in Firestore with default role
      await setUserRoleInFirestore(userCredential.user.uid, 'user', email, name);
    } catch (error: unknown) {
      console.error('Sign up error:', error);
      setError(getFirebaseErrorMessage(error));
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      setError(null);
      await signOut(auth);
    } catch (error: unknown) {
      console.error('Logout error:', error);
      setError(getFirebaseErrorMessage(error));
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const isAdmin = userRole?.role === 'admin';

  const value = {
    user,
    userRole,
    loading,
    error,
    signIn,
    signUp,
    logout,
    isAdmin,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

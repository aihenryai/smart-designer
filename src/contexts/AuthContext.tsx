// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  User,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  AuthProvider
} from 'firebase/auth';
import { 
  auth, 
  googleProvider, 
  facebookProvider, 
  microsoftProvider 
} from '../config/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithFacebook: () => Promise<void>;
  signInWithMicrosoft: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInWithProvider = async (provider: AuthProvider) => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw new Error(getErrorMessage(error.code));
    }
  };

  const signInWithGoogle = () => signInWithProvider(googleProvider);
  const signInWithFacebook = () => signInWithProvider(facebookProvider);
  const signInWithMicrosoft = () => signInWithProvider(microsoftProvider);

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signInWithGoogle,
    signInWithFacebook,
    signInWithMicrosoft,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

function getErrorMessage(errorCode: string): string {
  const errorMessages: Record<string, string> = {
    'auth/popup-blocked': 'החלון נחסם על ידי הדפדפן. אנא אפשר חלונות קופצים.',
    'auth/popup-closed-by-user': 'ההתחברות בוטלה.',
    'auth/cancelled-popup-request': 'חלון התחברות אחר כבר פתוח.',
    'auth/account-exists-with-different-credential': 'כבר קיים חשבון עם אימייל זה.',
    'auth/network-request-failed': 'בעיית רשת. בדוק את החיבור לאינטרנט.',
    'auth/unauthorized-domain': 'הדומיין לא מורשה. בדוק הגדרות Firebase.',
    'default': 'אירעה שגיאה בהתחברות. נסה שוב.'
  };

  return errorMessages[errorCode] || errorMessages['default'];
}

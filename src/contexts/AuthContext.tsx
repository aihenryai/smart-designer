import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import { initializeUserCredits, getUserCredits, UserCredits } from '../services/credits';

interface AuthContextType {
  user: User | null;
  userCredits: UserCredits | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshCredits: () => Promise<void>;
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
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userCredits, setUserCredits] = useState<UserCredits | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user credits when user changes
  const loadUserCredits = async (currentUser: User | null) => {
    if (currentUser) {
      try {
        const credits = await getUserCredits(currentUser.uid);
        setUserCredits(credits);
      } catch (error) {
        console.error('Failed to load user credits:', error);
        // Set default credits if Firestore fails
        setUserCredits({
          uid: currentUser.uid,
          email: currentUser.email || '',
          plan: 'free',
          credits: {
            used: 0,
            limit: 3,
            resetDate: null
          },
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    } else {
      setUserCredits(null);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      await loadUserCredits(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      // Try to initialize credits for new users, but don't fail if Firestore is not available
      if (result.user.email) {
        try {
          await initializeUserCredits(result.user.uid, result.user.email);
        } catch (error) {
          console.warn('Could not initialize Firestore credits, using defaults:', error);
        }
        await loadUserCredits(result.user);
      }
    } catch (error: any) {
      console.error('Google sign in error:', error);
      throw new Error(getHebrewErrorMessage(error.code));
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      await loadUserCredits(result.user);
    } catch (error: any) {
      console.error('Email sign in error:', error);
      throw new Error(getHebrewErrorMessage(error.code));
    }
  };

  const signUpWithEmail = async (email: string, password: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      // Try to initialize credits for new users, but don't fail if Firestore is not available
      try {
        await initializeUserCredits(result.user.uid, email);
      } catch (error) {
        console.warn('Could not initialize Firestore credits, using defaults:', error);
      }
      await loadUserCredits(result.user);
    } catch (error: any) {
      console.error('Email sign up error:', error);
      throw new Error(getHebrewErrorMessage(error.code));
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUserCredits(null);
    } catch (error: any) {
      console.error('Sign out error:', error);
      throw new Error('שגיאה בניתוק. אנא נסה שוב.');
    }
  };

  const refreshCredits = async () => {
    if (user) {
      await loadUserCredits(user);
    }
  };

  const value: AuthContextType = {
    user,
    userCredits,
    loading,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    refreshCredits
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Helper function for Hebrew error messages
const getHebrewErrorMessage = (errorCode: string): string => {
  const errorMessages: Record<string, string> = {
    'auth/user-not-found': 'משתמש לא נמצא. אנא בדוק את פרטי ההתחברות.',
    'auth/wrong-password': 'סיסמה שגויה. אנא נסה שנית.',
    'auth/email-already-in-use': 'כתובת המייל כבר בשימוש.',
    'auth/weak-password': 'הסיסמה חלשה מדי. השתמש לפחות 6 תווים.',
    'auth/invalid-email': 'כתובת המייל אינה תקינה.',
    'auth/popup-closed-by-user': 'חלון ההתחברות נסגר. אנא נסה שנית.',
    'auth/cancelled-popup-request': 'בקשת ההתחברות בוטלה.',
    'auth/network-request-failed': 'שגיאת רשת. אנא בדוק את החיבור לאינטרנט.',
    'auth/too-many-requests': 'יותר מדי ניסיונות התחברות. אנא נסה שוב מאוחר יותר.'
  };

  return errorMessages[errorCode] || 'אירעה שגיאה בהתחברות. אנא נסה שנית.';
};

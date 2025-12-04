import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface UserCredits {
  uid: string;
  email: string;
  plan: 'free' | 'premium';
  credits: {
    used: number;
    limit: number;
    resetDate: Date | null;
  };
  createdAt: Date;
  updatedAt: Date;
}

const FREE_CREDITS_LIMIT = 3;
const PREMIUM_CREDITS_LIMIT = -1; // Unlimited

/**
 * Initialize user credits when they first sign up
 */
export async function initializeUserCredits(uid: string, email: string): Promise<void> {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    const userData: Omit<UserCredits, 'createdAt' | 'updatedAt'> = {
      uid,
      email,
      plan: 'free',
      credits: {
        used: 0,
        limit: FREE_CREDITS_LIMIT,
        resetDate: null
      }
    };

    await setDoc(userRef, {
      ...userData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }
}

/**
 * Get user credits information
 */
export async function getUserCredits(uid: string): Promise<UserCredits | null> {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    return null;
  }

  const data = userSnap.data();
  return {
    uid: data.uid,
    email: data.email,
    plan: data.plan,
    credits: data.credits,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date()
  };
}

/**
 * Check if user has available credits
 */
export async function hasCreditsAvailable(uid: string): Promise<boolean> {
  const userCredits = await getUserCredits(uid);
  
  if (!userCredits) {
    return false;
  }

  // Premium users have unlimited credits
  if (userCredits.plan === 'premium') {
    return true;
  }

  // Free users check against limit
  return userCredits.credits.used < userCredits.credits.limit;
}

/**
 * Get remaining credits for user
 */
export async function getRemainingCredits(uid: string): Promise<number> {
  const userCredits = await getUserCredits(uid);
  
  if (!userCredits) {
    return 0;
  }

  // Premium users have unlimited
  if (userCredits.plan === 'premium') {
    return -1; // -1 indicates unlimited
  }

  return Math.max(0, userCredits.credits.limit - userCredits.credits.used);
}

/**
 * Use one credit (increment used counter)
 */
export async function useCredit(uid: string): Promise<boolean> {
  const hasCredits = await hasCreditsAvailable(uid);
  
  if (!hasCredits) {
    return false;
  }

  const userRef = doc(db, 'users', uid);
  const userCredits = await getUserCredits(uid);

  if (!userCredits) {
    return false;
  }

  // Don't increment for premium users
  if (userCredits.plan === 'premium') {
    return true;
  }

  await updateDoc(userRef, {
    'credits.used': userCredits.credits.used + 1,
    updatedAt: serverTimestamp()
  });

  return true;
}

/**
 * Upgrade user to premium
 */
export async function upgradeUserToPremium(uid: string): Promise<void> {
  const userRef = doc(db, 'users', uid);
  
  await updateDoc(userRef, {
    plan: 'premium',
    'credits.limit': PREMIUM_CREDITS_LIMIT,
    updatedAt: serverTimestamp()
  });
}

/**
 * Reset user credits (for testing or admin purposes)
 */
export async function resetUserCredits(uid: string): Promise<void> {
  const userRef = doc(db, 'users', uid);
  
  await updateDoc(userRef, {
    'credits.used': 0,
    'credits.resetDate': serverTimestamp(),
    updatedAt: serverTimestamp()
  });
}

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { adminAuth, adminDb } from './firebase-admin';

export interface AuthenticatedRequest extends VercelRequest {
  user?: {
    uid: string;
    email: string | undefined;
  };
}

/**
 * Middleware to verify Firebase ID token and attach user to request
 */
export async function verifyAuth(req: AuthenticatedRequest): Promise<{ uid: string; email: string | undefined } | null> {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    
    return {
      uid: decodedToken.uid,
      email: decodedToken.email
    };
  } catch (error) {
    console.error('Auth verification error:', error);
    return null;
  }
}

/**
 * Check if user has available credits
 */
export async function checkCredits(uid: string): Promise<{ hasCredits: boolean; remaining: number; plan: string }> {
  try {
    const userRef = adminDb.collection('users').doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      // Initialize user if doesn't exist
      await userRef.set({
        uid,
        plan: 'free',
        credits: {
          used: 0,
          limit: 3,
          resetDate: null
        },
        createdAt: new Date(),
        updatedAt: new Date()
      });

      return {
        hasCredits: true,
        remaining: 3,
        plan: 'free'
      };
    }

    const userData = userDoc.data();
    const plan = userData?.plan || 'free';

    // Premium users have unlimited credits
    if (plan === 'premium') {
      return {
        hasCredits: true,
        remaining: -1, // -1 indicates unlimited
        plan: 'premium'
      };
    }

    // Free users check against limit
    const used = userData?.credits?.used || 0;
    const limit = userData?.credits?.limit || 3;
    const remaining = Math.max(0, limit - used);

    return {
      hasCredits: remaining > 0,
      remaining,
      plan
    };
  } catch (error) {
    console.error('Check credits error:', error);
    return {
      hasCredits: false,
      remaining: 0,
      plan: 'free'
    };
  }
}

/**
 * Use one credit (increment used counter)
 */
export async function useCredit(uid: string): Promise<boolean> {
  try {
    const userRef = adminDb.collection('users').doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return false;
    }

    const userData = userDoc.data();
    const plan = userData?.plan || 'free';

    // Don't increment for premium users
    if (plan === 'premium') {
      return true;
    }

    const used = userData?.credits?.used || 0;
    const limit = userData?.credits?.limit || 3;

    // Check if has credits available
    if (used >= limit) {
      return false;
    }

    // Increment used counter
    await userRef.update({
      'credits.used': used + 1,
      updatedAt: new Date()
    });

    return true;
  } catch (error) {
    console.error('Use credit error:', error);
    return false;
  }
}

/**
 * Helper to send auth error response
 */
export function sendAuthError(res: VercelResponse, message: string = 'נדרשת התחברות') {
  return res.status(401).json({ error: message });
}

/**
 * Helper to send credits error response
 */
export function sendCreditsError(res: VercelResponse, remaining: number) {
  return res.status(403).json({ 
    error: 'אין מספיק קרדיטים',
    remaining,
    message: remaining === 0 
      ? 'נגמרו הקרדיטים החינמיים שלך. שדרג לפרימיום כדי להמשיך.'
      : `נותרו לך ${remaining} יצירות חינמיות`
  });
}

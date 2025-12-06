import type { VercelRequest, VercelResponse } from '@vercel/node';

export interface AuthenticatedRequest extends VercelRequest {
  user?: {
    uid: string;
    email: string | undefined;
  };
}

// Dynamic import helper
async function getFirebaseAdmin() {
  return await import('./firebase-admin.js');
}

// Admin emails with unlimited access
const UNLIMITED_ACCESS_EMAILS = [
  'henrystauber22@gmail.com'
];

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
    const { adminAuth } = await getFirebaseAdmin();
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
export async function checkCredits(uid: string, email?: string): Promise<{ hasCredits: boolean; remaining: number; plan: string }> {
  try {
    const { getAdminDb } = await getFirebaseAdmin();
    const db = await getAdminDb();
    const userRef = db.collection('users').doc(uid);
    const userDoc = await userRef.get();

    // Check if user email has unlimited access
    const isUnlimitedUser = email && UNLIMITED_ACCESS_EMAILS.includes(email.toLowerCase());

    if (!userDoc.exists) {
      // Initialize user if doesn't exist
      const plan = isUnlimitedUser ? 'premium' : 'free';
      await userRef.set({
        uid,
        email,
        plan,
        credits: {
          used: 0,
          limit: isUnlimitedUser ? -1 : 3,
          resetDate: null
        },
        createdAt: new Date(),
        updatedAt: new Date()
      });

      return {
        hasCredits: true,
        remaining: isUnlimitedUser ? -1 : 3,
        plan
      };
    }

    const userData = userDoc.data();
    let plan = userData?.plan || 'free';

    // Auto-upgrade unlimited access users to premium
    if (isUnlimitedUser && plan !== 'premium') {
      await userRef.update({
        plan: 'premium',
        'credits.limit': -1,
        updatedAt: new Date()
      });
      plan = 'premium';
    }

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
    // Return default free credits on error
    return {
      hasCredits: true,
      remaining: 3,
      plan: 'free'
    };
  }
}

/**
 * Use one credit (increment used counter)
 */
export async function useCredit(uid: string): Promise<boolean> {
  try {
    const { getAdminDb } = await getFirebaseAdmin();
    const db = await getAdminDb();
    const userRef = db.collection('users').doc(uid);
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

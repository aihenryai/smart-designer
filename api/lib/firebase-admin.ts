import * as admin from 'firebase-admin';

let isInitialized = false;
let _adminAuth: admin.auth.Auth | null = null;
let _adminDb: admin.firestore.Firestore | null = null;

// Initialize Firebase Admin only once
if (!admin.apps.length) {
  try {
    const serviceAccountEnv = process.env.FIREBASE_SERVICE_ACCOUNT;
    
    if (serviceAccountEnv) {
      console.log('FIREBASE_SERVICE_ACCOUNT found, attempting to parse...');
      
      try {
        const serviceAccount = JSON.parse(serviceAccountEnv);
        
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId: serviceAccount.project_id || process.env.VITE_FIREBASE_PROJECT_ID
        });
        
        isInitialized = true;
        _adminAuth = admin.auth();
        _adminDb = admin.firestore();
        console.log('Firebase Admin initialized successfully with service account');
      } catch (parseError) {
        console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT JSON:', parseError);
        console.error('Make sure the JSON is properly formatted as a single line');
      }
    } else {
      console.warn('FIREBASE_SERVICE_ACCOUNT not set - Firebase Admin features will be limited');
      
      // Try to initialize without credentials for development
      const projectId = process.env.VITE_FIREBASE_PROJECT_ID;
      if (projectId) {
        try {
          admin.initializeApp({ projectId });
          _adminAuth = admin.auth();
          _adminDb = admin.firestore();
          console.log('Firebase Admin initialized in limited mode (no service account)');
        } catch (initError) {
          console.error('Failed to initialize Firebase Admin in limited mode:', initError);
        }
      }
    }
  } catch (error) {
    console.error('Firebase admin initialization error:', error);
  }
} else {
  isInitialized = true;
  _adminAuth = admin.auth();
  _adminDb = admin.firestore();
}

// Export getters that check for initialization
export const getAdminAuth = () => {
  if (!_adminAuth) {
    throw new Error('Firebase Admin Auth not initialized');
  }
  return _adminAuth;
};

export const getAdminDb = () => {
  if (!_adminDb) {
    throw new Error('Firebase Admin Firestore not initialized');
  }
  return _adminDb;
};

// Legacy exports for backwards compatibility - may throw if not initialized
export const adminAuth = {
  verifyIdToken: async (token: string) => {
    if (!_adminAuth) {
      throw new Error('Firebase Admin Auth not initialized - check FIREBASE_SERVICE_ACCOUNT env var');
    }
    return _adminAuth.verifyIdToken(token);
  }
};

export const adminDb = {
  collection: (name: string) => {
    if (!_adminDb) {
      throw new Error('Firebase Admin Firestore not initialized - check FIREBASE_SERVICE_ACCOUNT env var');
    }
    return _adminDb.collection(name);
  }
};

export const isFirebaseAdminReady = () => isInitialized;

export default admin;

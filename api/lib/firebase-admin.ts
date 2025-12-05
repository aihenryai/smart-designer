import * as admin from 'firebase-admin';

let isInitialized = false;
let _adminAuth: admin.auth.Auth | null = null;
let _adminDb: admin.firestore.Firestore | null = null;
let initError: string | null = null;

// Safe initialization function
function safeInitialize() {
  if (admin.apps.length) {
    // Already initialized
    try {
      _adminAuth = admin.auth();
      _adminDb = admin.firestore();
      isInitialized = true;
      return;
    } catch (error) {
      console.error('Failed to get auth/firestore from existing app:', error);
      initError = String(error);
      return;
    }
  }

  const serviceAccountEnv = process.env.FIREBASE_SERVICE_ACCOUNT;
  
  if (!serviceAccountEnv) {
    console.warn('FIREBASE_SERVICE_ACCOUNT not set - Firebase Admin features disabled');
    initError = 'FIREBASE_SERVICE_ACCOUNT not set';
    return;
  }

  console.log('FIREBASE_SERVICE_ACCOUNT found, length:', serviceAccountEnv.length);

  try {
    const serviceAccount = JSON.parse(serviceAccountEnv);
    
    if (!serviceAccount.project_id || !serviceAccount.private_key || !serviceAccount.client_email) {
      throw new Error('Service account JSON missing required fields');
    }

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id
    });
    
    _adminAuth = admin.auth();
    _adminDb = admin.firestore();
    isInitialized = true;
    console.log('Firebase Admin initialized successfully');
  } catch (error: any) {
    console.error('Firebase Admin init failed:', error.message || error);
    initError = error.message || String(error);
  }
}

// Run initialization
safeInitialize();

// Export getters that check for initialization
export const getAdminAuth = () => {
  if (!_adminAuth) {
    throw new Error(`Firebase Admin Auth not initialized: ${initError || 'unknown error'}`);
  }
  return _adminAuth;
};

export const getAdminDb = () => {
  if (!_adminDb) {
    throw new Error(`Firebase Admin Firestore not initialized: ${initError || 'unknown error'}`);
  }
  return _adminDb;
};

// Wrapper objects for backwards compatibility
export const adminAuth = {
  verifyIdToken: async (token: string) => {
    const auth = getAdminAuth();
    return auth.verifyIdToken(token);
  }
};

export const adminDb = {
  collection: (name: string) => {
    const db = getAdminDb();
    return db.collection(name);
  }
};

export const isFirebaseAdminReady = () => isInitialized;
export const getInitError = () => initError;

export default admin;

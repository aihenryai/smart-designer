// Lazy-loaded firebase-admin to avoid module-level crashes
let admin: any = null;
let isInitialized = false;
let _adminAuth: any = null;
let _adminDb: any = null;
let initError: string | null = null;

// Lazy load and initialize firebase-admin
async function ensureInitialized(): Promise<boolean> {
  if (isInitialized) return true;
  if (initError) return false;
  
  try {
    // Dynamic import to avoid module-level crash
    const adminModule = await import('firebase-admin');
    admin = adminModule.default || adminModule;
    
    const apps = admin.apps || [];
    
    if (apps.length > 0) {
      _adminAuth = admin.auth();
      _adminDb = admin.firestore();
      isInitialized = true;
      console.log('Firebase Admin: Using existing app');
      return true;
    }
    
    const serviceAccountEnv = process.env.FIREBASE_SERVICE_ACCOUNT;
    
    if (!serviceAccountEnv) {
      initError = 'FIREBASE_SERVICE_ACCOUNT not set';
      console.warn(initError);
      return false;
    }
    
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
    return true;
    
  } catch (error: any) {
    initError = error.message || String(error);
    console.error('Firebase Admin init failed:', initError);
    return false;
  }
}

// Export async getters
export const getAdminAuth = async () => {
  await ensureInitialized();
  if (!_adminAuth) {
    throw new Error(`Firebase Admin Auth not available: ${initError || 'unknown error'}`);
  }
  return _adminAuth;
};

export const getAdminDb = async () => {
  await ensureInitialized();
  if (!_adminDb) {
    throw new Error(`Firebase Admin Firestore not available: ${initError || 'unknown error'}`);
  }
  return _adminDb;
};

// Wrapper objects for backwards compatibility (now async)
export const adminAuth = {
  verifyIdToken: async (token: string) => {
    const auth = await getAdminAuth();
    return auth.verifyIdToken(token);
  }
};

export const adminDb = {
  collection: async (name: string) => {
    const db = await getAdminDb();
    return db.collection(name);
  }
};

export const isFirebaseAdminReady = () => isInitialized;
export const getInitError = () => initError;

// For health check - trigger initialization and return status
export const checkFirebaseAdmin = async () => {
  const ready = await ensureInitialized();
  return {
    ready,
    error: initError
  };
};

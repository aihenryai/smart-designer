import * as admin from 'firebase-admin';

let isInitialized = false;

// Initialize Firebase Admin only once
if (!admin.apps.length) {
  try {
    const serviceAccountEnv = process.env.FIREBASE_SERVICE_ACCOUNT;
    
    if (serviceAccountEnv) {
      // Log that we found the environment variable (but not its content for security)
      console.log('FIREBASE_SERVICE_ACCOUNT found, attempting to parse...');
      
      try {
        const serviceAccount = JSON.parse(serviceAccountEnv);
        
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId: serviceAccount.project_id || process.env.VITE_FIREBASE_PROJECT_ID
        });
        
        isInitialized = true;
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
        admin.initializeApp({ projectId });
        console.log('Firebase Admin initialized in limited mode (no service account)');
      }
    }
  } catch (error) {
    console.error('Firebase admin initialization error:', error);
  }
} else {
  isInitialized = true;
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
export const isFirebaseAdminReady = () => isInitialized;

export default admin;

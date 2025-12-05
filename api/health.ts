import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const serviceAccountEnv = process.env.FIREBASE_SERVICE_ACCOUNT;
  
  // Use dynamic import to avoid module-level crashes
  // Path is relative to this file's directory
  let firebaseStatus = { ready: false, error: null as string | null };
  try {
    // Import firebase-admin directly instead of through wrapper
    const admin = await import('firebase-admin');
    const adminModule = (admin as any).default || admin;
    const apps = adminModule.apps || [];
    
    if (apps.length > 0) {
      firebaseStatus = { ready: true, error: null };
    } else if (serviceAccountEnv) {
      try {
        const serviceAccount = JSON.parse(serviceAccountEnv);
        adminModule.initializeApp({
          credential: adminModule.credential.cert(serviceAccount),
          projectId: serviceAccount.project_id
        });
        adminModule.auth();
        adminModule.firestore();
        firebaseStatus = { ready: true, error: null };
      } catch (initError: any) {
        firebaseStatus = { ready: false, error: initError.message };
      }
    } else {
      firebaseStatus = { ready: false, error: 'FIREBASE_SERVICE_ACCOUNT not set' };
    }
  } catch (error: any) {
    firebaseStatus = { ready: false, error: error.message };
  }
  
  const status = {
    server: 'ok',
    timestamp: new Date().toISOString(),
    environment: {
      hasGeminiKey: !!process.env.GEMINI_API_KEY,
      hasFirebaseServiceAccount: !!serviceAccountEnv,
      serviceAccountLength: serviceAccountEnv?.length || 0,
      hasFirebaseProjectId: !!process.env.VITE_FIREBASE_PROJECT_ID,
      firebaseProjectId: process.env.VITE_FIREBASE_PROJECT_ID || 'not set',
      firebaseAdminReady: firebaseStatus.ready,
      firebaseInitError: firebaseStatus.error
    }
  };

  return res.status(200).json(status);
}

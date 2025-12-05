import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const serviceAccountEnv = process.env.FIREBASE_SERVICE_ACCOUNT;
  
  // Use dynamic import to avoid module-level crashes
  let firebaseStatus = { ready: false, error: 'Not checked' };
  try {
    const firebaseAdmin = await import('./lib/firebase-admin');
    firebaseStatus = await firebaseAdmin.checkFirebaseAdmin();
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

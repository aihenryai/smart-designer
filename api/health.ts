import type { VercelRequest, VercelResponse } from '@vercel/node';
import { checkFirebaseAdmin } from './lib/firebase-admin';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const serviceAccountEnv = process.env.FIREBASE_SERVICE_ACCOUNT;
  
  // Check Firebase Admin status (async)
  const firebaseStatus = await checkFirebaseAdmin();
  
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

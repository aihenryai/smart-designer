import type { VercelRequest, VercelResponse } from '@vercel/node';
import { isFirebaseAdminReady } from './lib/firebase-admin';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const status = {
    server: 'ok',
    timestamp: new Date().toISOString(),
    environment: {
      hasGeminiKey: !!process.env.GEMINI_API_KEY,
      hasFirebaseServiceAccount: !!process.env.FIREBASE_SERVICE_ACCOUNT,
      hasFirebaseProjectId: !!process.env.VITE_FIREBASE_PROJECT_ID,
      firebaseAdminReady: isFirebaseAdminReady()
    }
  };

  return res.status(200).json(status);
}

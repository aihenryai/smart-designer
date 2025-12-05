import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const serviceAccountEnv = process.env.FIREBASE_SERVICE_ACCOUNT;
  let jsonParseTest = 'not tested';
  let hasRequiredFields = false;
  
  if (serviceAccountEnv) {
    try {
      const parsed = JSON.parse(serviceAccountEnv);
      jsonParseTest = 'success';
      hasRequiredFields = !!(parsed.project_id && parsed.private_key && parsed.client_email);
    } catch (e: any) {
      jsonParseTest = `parse error: ${e.message}`;
    }
  }
  
  const status = {
    server: 'ok',
    timestamp: new Date().toISOString(),
    nodeVersion: process.version,
    environment: {
      hasGeminiKey: !!process.env.GEMINI_API_KEY,
      hasFirebaseServiceAccount: !!serviceAccountEnv,
      serviceAccountLength: serviceAccountEnv?.length || 0,
      serviceAccountJsonParseTest: jsonParseTest,
      hasRequiredFields: hasRequiredFields,
      hasFirebaseProjectId: !!process.env.VITE_FIREBASE_PROJECT_ID,
      firebaseProjectId: process.env.VITE_FIREBASE_PROJECT_ID || 'not set'
    }
  };

  return res.status(200).json(status);
}

import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Authorization, Content-Type'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const diagnostics: any = {
      timestamp: new Date().toISOString(),
      method: req.method,
      headers: {
        authorization: req.headers.authorization ? 'present' : 'missing',
        contentType: req.headers['content-type']
      },
      env: {
        geminiKey: process.env.GEMINI_API_KEY ? 'present' : 'missing',
        firebaseAccount: process.env.FIREBASE_SERVICE_ACCOUNT ? 'present' : 'missing'
      },
      steps: []
    };

    // Step 1: Check imports
    diagnostics.steps.push({ step: 1, action: 'Checking imports...' });
    
    try {
      const { GoogleGenAI } = await import("@google/genai");
      diagnostics.steps.push({ step: 2, status: 'GoogleGenAI imported successfully' });
    } catch (err: any) {
      diagnostics.steps.push({ step: 2, status: 'Failed to import GoogleGenAI', error: err.message });
      return res.status(200).json(diagnostics);
    }

    // Step 2: Check auth middleware
    try {
      const { verifyAuth } = await import('./lib/auth-middleware');
      diagnostics.steps.push({ step: 3, status: 'auth-middleware imported successfully' });
      
      const user = await verifyAuth(req);
      diagnostics.steps.push({ 
        step: 4, 
        status: user ? 'User authenticated' : 'No user found',
        user: user ? { uid: user.uid, email: user.email } : null
      });
    } catch (err: any) {
      diagnostics.steps.push({ step: 3, status: 'Failed auth check', error: err.message });
    }

    // Step 3: Try initializing Gemini
    try {
      const { GoogleGenAI } = await import("@google/genai");
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      diagnostics.steps.push({ step: 5, status: 'GoogleGenAI initialized successfully' });
    } catch (err: any) {
      diagnostics.steps.push({ step: 5, status: 'Failed to initialize GoogleGenAI', error: err.message });
    }

    return res.status(200).json(diagnostics);
    
  } catch (error: any) {
    return res.status(500).json({ 
      error: 'Test endpoint error',
      message: error.message,
      stack: error.stack
    });
  }
}

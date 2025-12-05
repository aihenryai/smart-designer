import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const results: any = {
    step1: 'before import'
  };
  
  try {
    results.step2 = 'importing firebase-admin module';
    const firebaseAdmin = await import('./lib/firebase-admin');
    results.step3 = 'import successful';
    results.exports = Object.keys(firebaseAdmin);
    
    results.step4 = 'calling checkFirebaseAdmin';
    const status = await firebaseAdmin.checkFirebaseAdmin();
    results.step5 = 'checkFirebaseAdmin returned';
    results.firebaseStatus = status;
    
    results.success = true;
  } catch (error: any) {
    results.error = {
      message: error.message,
      name: error.name,
      stack: error.stack?.split('\n').slice(0, 5).join('\n')
    };
  }
  
  return res.status(200).json(results);
}

import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const results: Record<string, any> = {
    timestamp: new Date().toISOString(),
    steps: []
  };
  
  try {
    // Step 1: Try to import firebase-admin
    results.steps.push({ step: 'import', status: 'starting' });
    const admin = await import('firebase-admin');
    results.steps.push({ step: 'import', status: 'success', keys: Object.keys(admin).slice(0, 10) });
    
    // Step 2: Check apps array - handle potential undefined
    const apps = admin.apps || admin.default?.apps || [];
    results.steps.push({ step: 'check_apps', count: apps?.length || 0, appsType: typeof apps });
    
    if (apps && apps.length > 0) {
      results.steps.push({ step: 'already_initialized', status: 'true' });
      results.success = true;
      return res.status(200).json(results);
    }
    
    // Step 3: Parse service account
    results.steps.push({ step: 'parse_service_account', status: 'starting' });
    const serviceAccountEnv = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (!serviceAccountEnv) {
      results.steps.push({ step: 'parse_service_account', status: 'error', error: 'not set' });
      return res.status(200).json(results);
    }
    
    const serviceAccount = JSON.parse(serviceAccountEnv);
    results.steps.push({ 
      step: 'parse_service_account', 
      status: 'success',
      project_id: serviceAccount.project_id,
      has_private_key: !!serviceAccount.private_key,
      private_key_length: serviceAccount.private_key?.length || 0,
      client_email: serviceAccount.client_email
    });
    
    // Step 4: Get the correct admin reference
    const adminModule = admin.default || admin;
    results.steps.push({ step: 'get_admin_module', hasDefault: !!admin.default });
    
    // Step 5: Create credential
    results.steps.push({ step: 'create_credential', status: 'starting' });
    const credential = adminModule.credential.cert(serviceAccount);
    results.steps.push({ step: 'create_credential', status: 'success' });
    
    // Step 6: Initialize app
    results.steps.push({ step: 'initialize_app', status: 'starting' });
    adminModule.initializeApp({
      credential: credential,
      projectId: serviceAccount.project_id
    });
    results.steps.push({ step: 'initialize_app', status: 'success' });
    
    // Step 7: Test auth
    results.steps.push({ step: 'get_auth', status: 'starting' });
    const auth = adminModule.auth();
    results.steps.push({ step: 'get_auth', status: 'success' });
    
    // Step 8: Test firestore
    results.steps.push({ step: 'get_firestore', status: 'starting' });
    const db = adminModule.firestore();
    results.steps.push({ step: 'get_firestore', status: 'success' });
    
    results.success = true;
    
  } catch (error: any) {
    results.error = {
      message: error.message,
      stack: error.stack?.split('\n').slice(0, 5).join('\n'),
      name: error.name,
      code: error.code
    };
  }
  
  return res.status(200).json(results);
}

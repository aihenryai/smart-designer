import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyAuth, checkCredits } from './lib/auth-middleware';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const results: any = {
    timestamp: new Date().toISOString(),
    method: req.method,
    headers: {
      authorization: req.headers.authorization ? 
        `Bearer ${req.headers.authorization.substring(7, 20)}...` : 'missing',
      contentType: req.headers['content-type']
    },
    steps: []
  };

  try {
    // Step 1: Check auth header
    const authHeader = req.headers.authorization;
    results.steps.push({
      step: 1,
      name: 'Check auth header',
      hasHeader: !!authHeader,
      startsWithBearer: authHeader?.startsWith('Bearer '),
      tokenLength: authHeader ? authHeader.length - 7 : 0
    });

    // Step 2: Try to verify auth
    results.steps.push({
      step: 2,
      name: 'Starting verifyAuth...'
    });

    const user = await verifyAuth(req as any);
    results.steps.push({
      step: 3,
      name: 'verifyAuth result',
      success: !!user,
      userUid: user?.uid ? `${user.uid.substring(0, 8)}...` : null,
      userEmail: user?.email || null
    });

    if (!user) {
      return res.status(401).json({
        ...results,
        error: 'Authentication failed - no user returned from verifyAuth'
      });
    }

    // Step 3: Check credits
    results.steps.push({
      step: 4,
      name: 'Starting checkCredits...'
    });

    const creditsStatus = await checkCredits(user.uid);
    results.steps.push({
      step: 5,
      name: 'checkCredits result',
      ...creditsStatus
    });

    results.success = true;
    results.user = {
      uid: user.uid,
      email: user.email
    };
    results.credits = creditsStatus;

    return res.status(200).json(results);

  } catch (error: any) {
    results.error = {
      message: error.message,
      name: error.name,
      code: error.code,
      stack: error.stack?.split('\n').slice(0, 5)
    };
    return res.status(500).json(results);
  }
}

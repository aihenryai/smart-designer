import type { VercelRequest, VercelResponse } from '@vercel/node';

// SUMIT API Configuration
const SUMIT_API_URL = 'https://api.sumit.co.il';
const SUMIT_COMPANY_ID = 129622277;

// CORS helper
function setCorsHeaders(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );
}

// Main handler with internal routing based on query param
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Get action from query param: /api/payments?action=create-checkout or /api/payments?action=webhook
  const action = req.query.action as string;

  switch (action) {
    case 'create-checkout':
      return handleCreateCheckout(req, res);
    case 'webhook':
      return handleWebhook(req, res);
    default:
      return res.status(400).json({ error: 'Invalid action. Use ?action=create-checkout or ?action=webhook' });
  }
}

// Create checkout session
async function handleCreateCheckout(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify authentication
    const { verifyAuth, sendAuthError } = await import('./lib/auth-middleware.js');
    const user = await verifyAuth(req);
    
    if (!user) {
      return sendAuthError(res);
    }

    const { plan, returnUrl } = req.body;

    if (!plan || plan !== 'premium') {
      return res.status(400).json({ error: 'Invalid plan specified' });
    }

    const SUMIT_API_KEY = process.env.SUMIT_API_KEY;
    if (!SUMIT_API_KEY) {
      console.error('SUMIT_API_KEY not configured');
      return res.status(500).json({ error: 'Payment system not configured' });
    }

    // Determine base URL for redirects
    const baseUrl = returnUrl || 'https://smart-designer-opal.vercel.app';

    // Create payment request to SUMIT
    const sumitPayload = {
      Credentials: {
        CompanyID: SUMIT_COMPANY_ID,
        APIKey: SUMIT_API_KEY
      },
      Customer: {
        Name: user.email?.split('@')[0] || 'Smart Studio User',
        EmailAddress: user.email,
        ExternalIdentifier: user.uid
      },
      Items: [
        {
          Item: {
            Name: 'Smart Studio Premium - מנוי חודשי',
            Description: 'גישה מלאה לכל התכונות - יצירות ללא הגבלה'
          },
          Quantity: 1,
          UnitPrice: 49
        }
      ],
      VATIncluded: true,
      RedirectURL: `${baseUrl}/payment/success`,
      CancelRedirectURL: `${baseUrl}/payment/cancel`,
      IPNURL: `${baseUrl}/api/payments?action=webhook`,
      ExternalIdentifier: `order_${user.uid}_${Date.now()}`,
      MaximumPayments: 1,
      SendUpdateByEmailAddress: user.email,
      Language: 'he'
    };

    console.log('Creating SUMIT payment for user:', user.uid);

    const sumitResponse = await fetch(`${SUMIT_API_URL}/billing/payments/beginredirect/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(sumitPayload)
    });

    const sumitData = await sumitResponse.json();

    if (sumitData.Status && sumitData.Status.startsWith('Success')) {
      // Save pending payment to Firestore
      const { getAdminDb } = await import('./lib/firebase-admin.js');
      const db = await getAdminDb();
      
      await db.collection('payments').add({
        userId: user.uid,
        userEmail: user.email,
        orderId: sumitPayload.ExternalIdentifier,
        plan: 'premium',
        amount: 49,
        currency: 'ILS',
        status: 'pending',
        createdAt: new Date(),
        sumitData: {
          paymentUrl: sumitData.Data?.PaymentURL
        }
      });

      return res.status(200).json({
        success: true,
        paymentUrl: sumitData.Data?.PaymentURL,
        orderId: sumitPayload.ExternalIdentifier
      });
    } else {
      console.error('SUMIT error:', sumitData);
      return res.status(400).json({
        error: 'Failed to create payment',
        details: sumitData.UserErrorMessage || sumitData.TechnicalErrorDetails
      });
    }

  } catch (error: any) {
    console.error('Create checkout error:', error);
    return res.status(500).json({
      error: 'Failed to create checkout session',
      message: error.message
    });
  }
}

// Handle SUMIT webhook
async function handleWebhook(req: VercelRequest, res: VercelResponse) {
  // Accept both GET and POST (SUMIT may use either)
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get data from query params (GET) or body (POST)
    const data = req.method === 'GET' ? req.query : req.body;

    console.log('SUMIT Webhook received:', JSON.stringify(data, null, 2));

    // Extract user ID from ExternalIdentifier (format: order_userId_timestamp)
    const externalId = data.ExternalIdentifier || data.CustomerExternalIdentifier;
    
    if (!externalId) {
      console.warn('No external identifier in webhook');
      return res.status(200).json({ received: true, processed: false });
    }

    // Parse userId from order ID (order_userId_timestamp)
    let userId: string | null = null;
    if (typeof externalId === 'string' && externalId.startsWith('order_')) {
      const parts = externalId.split('_');
      if (parts.length >= 2) {
        userId = parts[1];
      }
    } else {
      // Maybe CustomerExternalIdentifier is directly the userId
      userId = data.CustomerExternalIdentifier as string || null;
    }

    if (!userId) {
      console.warn('Could not extract userId from:', externalId);
      return res.status(200).json({ received: true, processed: false });
    }

    const { getAdminDb } = await import('./lib/firebase-admin.js');
    const db = await getAdminDb();

    // Update payment record
    const paymentsQuery = await db.collection('payments')
      .where('orderId', '==', externalId)
      .limit(1)
      .get();

    if (!paymentsQuery.empty) {
      const paymentDoc = paymentsQuery.docs[0];
      await paymentDoc.ref.update({
        status: 'completed',
        completedAt: new Date(),
        sumitTransactionId: data.TransactionID,
        sumitDocumentNumber: data.DocumentNumber,
        webhookData: data
      });
      console.log('Updated payment record:', paymentDoc.id);
    } else {
      // Create new payment record if not found
      await db.collection('payments').add({
        userId,
        orderId: externalId,
        plan: 'premium',
        status: 'completed',
        amount: data.Amount || 49,
        currency: 'ILS',
        completedAt: new Date(),
        createdAt: new Date(),
        sumitTransactionId: data.TransactionID,
        sumitDocumentNumber: data.DocumentNumber,
        webhookData: data
      });
      console.log('Created new payment record for user:', userId);
    }

    // Upgrade user to premium
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (userDoc.exists) {
      await userRef.update({
        plan: 'premium',
        'subscription.status': 'active',
        'subscription.startDate': new Date(),
        'subscription.plan': 'premium',
        'credits.limit': -1, // Unlimited
        updatedAt: new Date()
      });
      console.log('Upgraded user to premium:', userId);
    } else {
      // Create user record if doesn't exist
      await userRef.set({
        uid: userId,
        email: data.CustomerEmail,
        plan: 'premium',
        subscription: {
          status: 'active',
          startDate: new Date(),
          plan: 'premium'
        },
        credits: {
          used: 0,
          limit: -1 // Unlimited
        },
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('Created premium user:', userId);
    }

    return res.status(200).json({ 
      received: true, 
      processed: true,
      userId 
    });

  } catch (error: any) {
    console.error('SUMIT Webhook error:', error);
    // Always return 200 to SUMIT to prevent retries
    return res.status(200).json({ 
      received: true, 
      processed: false,
      error: error.message 
    });
  }
}

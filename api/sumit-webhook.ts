import type { VercelRequest, VercelResponse } from '@vercel/node';

// SUMIT Webhook Handler
// Receives payment status updates from SUMIT

interface SumitWebhookPayload {
  // SUMIT sends various fields depending on the event
  DocumentNumber?: string;
  CustomerName?: string;
  CustomerEmail?: string;
  CustomerExternalIdentifier?: string;
  ExternalIdentifier?: string;
  Amount?: number;
  Status?: string;
  PaymentMethod?: string;
  TransactionID?: string;
  [key: string]: any;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Accept both GET and POST (SUMIT may use either)
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get data from query params (GET) or body (POST)
    const data: SumitWebhookPayload = req.method === 'GET' 
      ? req.query as any
      : req.body;

    console.log('SUMIT Webhook received:', JSON.stringify(data, null, 2));

    // Extract user ID from ExternalIdentifier (format: order_userId_timestamp)
    const externalId = data.ExternalIdentifier || data.CustomerExternalIdentifier;
    
    if (!externalId) {
      console.warn('No external identifier in webhook');
      return res.status(200).json({ received: true, processed: false });
    }

    // Parse userId from order ID (order_userId_timestamp)
    let userId: string | null = null;
    if (externalId.startsWith('order_')) {
      const parts = externalId.split('_');
      if (parts.length >= 2) {
        userId = parts[1];
      }
    } else {
      // Maybe CustomerExternalIdentifier is directly the userId
      userId = data.CustomerExternalIdentifier || null;
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

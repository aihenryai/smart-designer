import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

async function callWithTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutMessage: string
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs)
  );
  return Promise.race([promise, timeoutPromise]);
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { targetField, context } = req.body;

    if (!targetField || !context) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) {
      return res.status(500).json({ error: 'API key not configured' });
    }

    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const TEXT_MODEL = "gemini-2.5-flash";

    const prompt = `
      CONTEXT:
      Subject: ${context.subject}
      Instructions: ${context.instructions}
      Essential Info: ${context.essentialInfo}

      TASK:
      You are a world-class creative director at a top design studio.
      Your goal is to provide a specific, professional, and sharp Hebrew suggestion for the form field: "${targetField}".
      
      GUIDELINES:
      1. Language: HEBREW ONLY.
      2. Be specific to the context.
      3. Style: Modern, appealing, and marketing-oriented.
      4. Output: Return ONLY the suggested text value. No explanations.
    `;

    const response = await callWithTimeout<GenerateContentResponse>(
      ai.models.generateContent({
        model: TEXT_MODEL,
        contents: { parts: [{ text: prompt }] }
      }),
      60000,
      "Auto-fill generation timed out"
    );

    const suggestion = response.text?.trim() || "";
    
    return res.status(200).json({ suggestion });

  } catch (error: any) {
    console.error('Auto-fill error:', error);
    return res.status(500).json({ 
      error: 'Failed to generate suggestion',
      message: error.message 
    });
  }
}

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from "@google/genai";
import { verifyAuth, sendAuthError } from './lib/auth-middleware.js';

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
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify authentication
    const user = await verifyAuth(req);
    if (!user) {
      return sendAuthError(res);
    }

    const { concept, edits, attachments } = req.body;

    if (!concept || !edits) {
      return res.status(400).json({ error: 'Missing required data' });
    }

    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) {
      return res.status(500).json({ error: 'API key not configured' });
    }

    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const TEXT_MODEL = "gemini-2.5-flash";
    // Use Gemini 3 Pro Image Preview (Nano Banana Pro) for Hebrew text rendering
    const IMAGE_MODEL = "gemini-3-pro-image-preview";

    // Generate improved prompt based on edits
    const rewritePrompt = `
      Act as an Expert Prompt Engineer for image generation.
      ORIGINAL PROMPT: "${concept.imageGenerationPrompt}"
      
      USER REQUESTED CHANGES:
      - New Headline Text (HEBREW): "${edits.newHeadline}"
      - Visual Edits: "${edits.userInstructions}"
      
      TASK: Rewrite the prompt to incorporate these changes naturally.
      
      CRITICAL REQUIREMENTS:
      1. Write the prompt structure in English
      2. MUST include the actual HEBREW headline text: "${edits.newHeadline}"
      3. Specify exactly where and how this Hebrew text should appear in the design
      4. The image generator supports Hebrew text rendering - use it!
      5. Focus on visual composition, colors, lighting, style
      6. Example: "Modern poster design with bold Hebrew headline '${edits.newHeadline}' centered at the top, professional layout..."
      
      OUTPUT: Only the new English prompt with embedded Hebrew text, nothing else.
    `;

    let newPrompt = concept.imageGenerationPrompt;
    try {
      const response = await ai.models.generateContent({
        model: TEXT_MODEL,
        contents: { parts: [{ text: rewritePrompt }] }
      });
      if (response.text) newPrompt = response.text.trim();
    } catch (e) {
      // Fallback: manually add Hebrew text to original prompt
      newPrompt = `${concept.imageGenerationPrompt}. Updated with Hebrew headline '${edits.newHeadline}' prominently displayed. ${edits.userInstructions}`;
    }

    // Determine aspect ratio
    let aspectRatio: "1:1" | "3:4" | "4:3" | "9:16" | "16:9" = "3:4";
    const ratioStr = edits.aspectRatio || "";
    if (ratioStr.includes("1:1")) aspectRatio = "1:1";
    else if (ratioStr.includes("9:16")) aspectRatio = "9:16";
    else if (ratioStr.includes("16:9")) aspectRatio = "16:9";
    else if (ratioStr.includes("4:3")) aspectRatio = "4:3";
    else if (ratioStr.includes("3:4")) aspectRatio = "3:4";

    const imageSize = edits.imageSize === "4K" ? "2K" : "1K";
    const timeout = edits.imageSize === "4K" ? 180000 : 120000;

    // Use generateContent with IMAGE response modality for Gemini 3 Pro Image (Nano Banana Pro)
    const imgResponse = await callWithTimeout(
      ai.models.generateContent({
        model: IMAGE_MODEL,
        contents: { parts: [{ text: newPrompt }] },
        config: {
          responseModalities: ['IMAGE'],
          imageConfig: {
            aspectRatio: aspectRatio,
            imageSize: imageSize
          }
        }
      }),
      timeout,
      "Image generation timed out"
    );

    let imageUrl = "";
    
    // Extract image from response - Gemini returns image in inlineData
    if (imgResponse.candidates && imgResponse.candidates.length > 0) {
      const parts = imgResponse.candidates[0].content.parts;
      for (const part of parts) {
        if (part.inlineData) {
          const imageData = part.inlineData.data;
          if (imageData) {
            imageUrl = `data:image/png;base64,${imageData}`;
            break;
          }
        }
      }
    }

    if (!imageUrl) {
      throw new Error("Failed to generate image");
    }

    return res.status(200).json({ imageUrl });

  } catch (error: any) {
    console.error('Update image error:', error);
    return res.status(500).json({ 
      error: 'Failed to update image',
      message: error.message 
    });
  }
}
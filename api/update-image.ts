import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from "@google/genai";
import { verifyAuth, sendAuthError } from './lib/auth-middleware';

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
    // Use Imagen 4 for image generation
    const IMAGE_MODEL = "imagen-4.0-fast-generate-001";

    // Generate improved prompt based on edits
    const rewritePrompt = `
      Act as an Expert Prompt Engineer for image generation.
      ORIGINAL PROMPT: "${concept.imageGenerationPrompt}"
      
      USER REQUESTED CHANGES:
      - New Headline Text: "${edits.newHeadline}"
      - Visual Edits: "${edits.userInstructions}"
      
      TASK: Rewrite the prompt to incorporate these changes naturally.
      
      REQUIREMENTS:
      1. Write only in English
      2. Do not include any Hebrew text in the prompt itself
      3. Focus on visual composition, colors, lighting, style
      4. Describe where text elements would be placed (but don't include actual text)
      
      OUTPUT: Only the new English prompt, nothing else.
    `;

    let newPrompt = concept.imageGenerationPrompt;
    try {
      const response = await ai.models.generateContent({
        model: TEXT_MODEL,
        contents: { parts: [{ text: rewritePrompt }] }
      });
      if (response.text) newPrompt = response.text.trim();
    } catch (e) {
      newPrompt = `${concept.imageGenerationPrompt}. Additional requirements: ${edits.userInstructions}`;
    }

    // Determine aspect ratio
    let aspectRatio: "1:1" | "3:4" | "4:3" | "9:16" | "16:9" = "3:4";
    const ratioStr = edits.aspectRatio || "";
    if (ratioStr.includes("1:1")) aspectRatio = "1:1";
    else if (ratioStr.includes("9:16")) aspectRatio = "9:16";
    else if (ratioStr.includes("16:9")) aspectRatio = "16:9";
    else if (ratioStr.includes("4:3")) aspectRatio = "4:3";
    else if (ratioStr.includes("3:4")) aspectRatio = "3:4";

    const timeout = edits.imageSize === "4K" ? 180000 : 120000;

    // Use generateImages API for Imagen model
    const imgResponse = await callWithTimeout(
      ai.models.generateImages({
        model: IMAGE_MODEL,
        prompt: newPrompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/png',
          aspectRatio: aspectRatio,
        }
      }),
      timeout,
      "Image generation timed out"
    );

    let imageUrl = "";
    
    // Extract image from response
    if (imgResponse.generatedImages && imgResponse.generatedImages.length > 0) {
      const imageData = imgResponse.generatedImages[0].image?.imageBytes;
      if (imageData) {
        imageUrl = `data:image/png;base64,${imageData}`;
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

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from "@google/genai";

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
    // Nano Banana Pro - best for Hebrew text in images!
    const IMAGE_MODEL = "gemini-3-pro-image-preview";

    const rewritePrompt = `
      Act as an Expert Prompt Engineer.
      ORIGINAL PROMPT: "${concept.imageGenerationPrompt}"
      
      USER REQUESTED CHANGES:
      - New Headline Text (Hebrew): "${edits.newHeadline}"
      - Visual Edits: "${edits.userInstructions}"
      
      TASK: Rewrite the English prompt to incorporate these changes naturally.
      
      CRITICAL REQUIREMENTS:
      1. The prompt MUST explicitly instruct the image generator to render the specific Hebrew text "${edits.newHeadline}". 
         Format: "...featuring the Hebrew text '${edits.newHeadline}' written in clear, bold typography...".
      
      OUTPUT: The new English prompt only.
    `;

    let newPrompt = concept.imageGenerationPrompt;
    try {
      const response = await ai.models.generateContent({
        model: TEXT_MODEL,
        contents: { parts: [{ text: rewritePrompt }] }
      });
      if (response.text) newPrompt = response.text.trim();
    } catch (e) {
      newPrompt = `${concept.imageGenerationPrompt}. CHANGES: ${edits.userInstructions}. REQUIRED TEXT: "${edits.newHeadline}"`;
    }

    const timeout = edits.imageSize === "4K" ? 180000 : 120000;

    // Using Nano Banana Pro (gemini-3-pro-image-preview) for superior Hebrew text rendering
    const imgResponse = await callWithTimeout(
      ai.models.generateContent({
        model: IMAGE_MODEL,
        contents: { 
          parts: [{ 
            text: `Generate an image: ${newPrompt}. Aspect ratio: ${edits.aspectRatio || "3:4"}. Make sure any Hebrew text is rendered clearly and accurately.` 
          }] 
        },
        config: {
          responseModalities: ["IMAGE", "TEXT"],
        }
      }),
      timeout,
      "Image generation timed out"
    );

    let imageUrl = "";
    
    // Parse Nano Banana Pro response - look for inlineData in parts
    const candidates = (imgResponse as any).candidates;
    if (candidates && candidates[0]?.content?.parts) {
      for (const part of candidates[0].content.parts) {
        if (part.inlineData) {
          const imageData = part.inlineData.data;
          const mimeType = part.inlineData.mimeType || 'image/png';
          imageUrl = `data:${mimeType};base64,${imageData}`;
          break;
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

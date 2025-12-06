import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from "@google/genai";

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
    // Dynamic import for auth middleware with .js extension for ESM compatibility
    const { verifyAuth, checkCredits, useCredit, sendAuthError, sendCreditsError } = await import('./lib/auth-middleware.js');
    
    // Verify authentication
    const user = await verifyAuth(req);
    if (!user) {
      return sendAuthError(res);
    }

    // Check credits - pass email for unlimited access check
    const creditsStatus = await checkCredits(user.uid, user.email);
    if (!creditsStatus.hasCredits) {
      return sendCreditsError(res, creditsStatus.remaining);
    }

    const { brief } = req.body;

    if (!brief) {
      return res.status(400).json({ error: 'Missing brief data' });
    }

    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) {
      return res.status(500).json({ error: 'API key not configured' });
    }

    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const TEXT_MODEL = "gemini-2.5-flash";
    // Use Gemini 3 Pro Image Preview (Nano Banana Pro) for Hebrew text rendering
    const IMAGE_MODEL = "gemini-3-pro-image-preview";

    const attachmentsInfo = (brief.attachments || []).map((att: any, idx: number) => 
      `Attachment ${idx + 1} (${att.fileName}): ${att.userInstruction}`
    ).join('\n');

    const prompt = `
      Role: Expert Creative Director for a high-end international design agency.
      Task: Create 4 distinct, high-impact graphic design concepts based on the client brief.
      
      Brief Data:
      Subject: ${brief.subject}
      Instructions: ${brief.instructions}
      Info: ${brief.essentialInfo}
      Target: ${brief.targetAudience}
      Platforms: ${(brief.platforms || []).join(', ')}
      Attachments: ${attachmentsInfo || "None"}
      
      Requirements:
      1. Language: All output fields (title, visualDescription, headline, colorPaletteSuggestion, rationale) MUST be in Hebrew.
      2. EXCEPTION: 'imageGenerationPrompt' structure MUST be in English for the image generator.
      3. CRITICAL - HEBREW TEXT IN DESIGN: 
         - The visual design MUST include text in HEBREW (עברית).
         - In 'imageGenerationPrompt', write in English but INCLUDE the actual Hebrew headline/text that should appear in the design.
         - Example: "Modern poster design with bold Hebrew text 'כותרת ראשית' at the center..."
         - The image generator supports Hebrew text rendering - use it!
      4. STYLE: Modern, Trendy, Commercial, Clean, High-End.
      5. IN THE 'imageGenerationPrompt': 
         - Write a detailed English description of the visual design.
         - INCLUDE the exact Hebrew text from 'headline' field in the prompt.
         - Specify text placement, size, and styling.
         - Include details on Lighting, Composition, Colors, and Style.
      
      Structure the response as a JSON array of 4 concepts.
    `;

    const responseSchema = {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "Creative Title (Hebrew)" },
          visualDescription: { type: Type.STRING, description: "Detailed visual description (Hebrew)" },
          headline: { type: Type.STRING, description: "Main Copy/Headline (Hebrew)" },
          colorPaletteSuggestion: { type: Type.STRING, description: "Color palette and mood (Hebrew)" },
          rationale: { type: Type.STRING, description: "Why this works for the brief (Hebrew)" },
          imageGenerationPrompt: { type: Type.STRING, description: "Detailed English prompt for image generation. MUST include the actual Hebrew headline text from the 'headline' field. Describe visual elements, colors, composition, lighting, style, and specify exactly where and how the Hebrew text should appear." }
        },
        required: ["title", "headline", "imageGenerationPrompt", "rationale", "visualDescription", "colorPaletteSuggestion"]
      }
    };

    const response = await callWithTimeout(
      ai.models.generateContent({
        model: TEXT_MODEL,
        contents: { parts: [{ text: prompt }] },
        config: {
          responseMimeType: "application/json",
          responseSchema: responseSchema
        }
      }),
      120000,
      "Concept generation timed out"
    );

    let rawText = response.text || "[]";
    rawText = rawText.replace(/```json|```/g, "").trim();
    const textConcepts = JSON.parse(rawText);

    if (!Array.isArray(textConcepts) || textConcepts.length === 0) {
      throw new Error("Failed to generate valid concepts");
    }

    // Determine aspect ratio from platform selection
    let targetRatio: "1:1" | "3:4" | "4:3" | "9:16" | "16:9" = "3:4";
    const platformsStr = (brief.platforms || []).join(' ');
    if (platformsStr.includes("1:1")) targetRatio = "1:1";
    else if (platformsStr.includes("9:16")) targetRatio = "9:16";
    else if (platformsStr.includes("16:9")) targetRatio = "16:9";
    else if (platformsStr.includes("3:4")) targetRatio = "3:4";

    const conceptsWithImages = await Promise.all(
      textConcepts.map(async (concept: any) => {
        try {
          // Use generateContent with IMAGE response modality for Gemini 3 Pro Image (Nano Banana Pro)
          const imgResponse = await callWithTimeout(
            ai.models.generateContent({
              model: IMAGE_MODEL,
              contents: { parts: [{ text: concept.imageGenerationPrompt }] },
              config: {
                responseModalities: ['IMAGE'],
                imageConfig: {
                  aspectRatio: targetRatio,
                  imageSize: '1K'
                }
              }
            }),
            180000,
            "Image generation timed out"
          );

          // Extract image from response - Gemini returns image in inlineData
          if (imgResponse.candidates && imgResponse.candidates.length > 0) {
            const parts = imgResponse.candidates[0].content.parts;
            for (const part of parts) {
              if (part.inlineData) {
                const imageData = part.inlineData.data;
                if (imageData) {
                  concept.imageUrl = `data:image/png;base64,${imageData}`;
                  break;
                }
              }
            }
          }

          return concept;
        } catch (error) {
          console.error(`Image gen failed for "${concept.title}"`, error);
          return concept;
        }
      })
    );

    // Use one credit after successful generation
    const creditUsed = await useCredit(user.uid);
    if (!creditUsed) {
      console.warn('Failed to decrement credit for user:', user.uid);
    }

    return res.status(200).json({ 
      concepts: conceptsWithImages,
      creditsRemaining: creditsStatus.remaining - 1
    });

  } catch (error: any) {
    console.error('Generate concepts error:', error);
    return res.status(500).json({ 
      error: 'Failed to generate concepts',
      message: error.message 
    });
  }
}
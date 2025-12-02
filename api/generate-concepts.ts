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
    // Nano Banana Pro - best for Hebrew text rendering!
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
      2. EXCEPTION: 'imageGenerationPrompt' MUST be in English for the image generator.
      3. TEXT RENDERING: The visual design MUST include the exact Hebrew headline text visible in the image.
      4. STYLE: Modern, Trendy, Commercial, Clean, High-End.
      5. IN THE 'imageGenerationPrompt': 
         - Explicitly instruct to write the text using actual Hebrew characters.
         - Format: "A poster design displaying the Hebrew text 'THE_HEBREW_HEADLINE' in [Specific Font Style] typography".
         - Include details on Lighting & Composition.
      
      Structure the response as a JSON array of 4 concepts.
    `;

    const responseSchema = {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "Creative Title (Hebrew)" },
          visualDescription: { type: Type.STRING, description: "Detailed visual description (Hebrew)" },
          headline: { type: Type.STRING, description: "Main Copy/Headline to appear on image (Hebrew)" },
          colorPaletteSuggestion: { type: Type.STRING, description: "Color palette and mood (Hebrew)" },
          rationale: { type: Type.STRING, description: "Why this works for the brief (Hebrew)" },
          imageGenerationPrompt: { type: Type.STRING, description: "Detailed English prompt. MUST include: displaying the Hebrew text 'HEADLINE'." }
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

    let targetRatio = "3:4";
    const platformsStr = (brief.platforms || []).join(' ');
    if (platformsStr.includes("1:1")) targetRatio = "1:1";
    else if (platformsStr.includes("9:16")) targetRatio = "9:16";
    else if (platformsStr.includes("16:9")) targetRatio = "16:9";

    const conceptsWithImages = await Promise.all(
      textConcepts.map(async (concept: any) => {
        try {
          // Using Nano Banana Pro for superior Hebrew text rendering
          const imgResponse = await callWithTimeout(
            ai.models.generateContent({
              model: IMAGE_MODEL,
              contents: { 
                parts: [{ 
                  text: `Generate an image: ${concept.imageGenerationPrompt}. Aspect ratio: ${targetRatio}. Make sure any Hebrew text is rendered clearly and accurately.` 
                }] 
              },
              config: {
                responseModalities: ["IMAGE", "TEXT"],
              }
            }),
            180000, // Longer timeout for Pro model
            "Image generation timed out"
          );

          // Parse response - look for inlineData in parts
          const candidates = (imgResponse as any).candidates;
          if (candidates && candidates[0]?.content?.parts) {
            for (const part of candidates[0].content.parts) {
              if (part.inlineData) {
                const imageData = part.inlineData.data;
                const mimeType = part.inlineData.mimeType || 'image/png';
                concept.imageUrl = `data:${mimeType};base64,${imageData}`;
                break;
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

    return res.status(200).json({ concepts: conceptsWithImages });

  } catch (error: any) {
    console.error('Generate concepts error:', error);
    return res.status(500).json({ 
      error: 'Failed to generate concepts',
      message: error.message 
    });
  }
}

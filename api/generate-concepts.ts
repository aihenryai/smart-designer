import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";

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

function extractBase64Data(dataUrl: string): [string, string] {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return ['', ''];
  return [match[1], match[2]];
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
    const TEXT_MODEL = "gemini-2.5-flash-preview-05-20";
    const IMAGE_MODEL = "imagen-3.0-generate-002";

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

    const response = await callWithTimeout<GenerateContentResponse>(
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
          const imgResponse = await callWithTimeout<GenerateContentResponse>(
            ai.models.generateImages({
              model: IMAGE_MODEL,
              prompt: concept.imageGenerationPrompt,
              config: {
                numberOfImages: 1,
                aspectRatio: targetRatio
              }
            }),
            120000,
            "Image generation timed out"
          );

          if (imgResponse.generatedImages && imgResponse.generatedImages.length > 0) {
            const img = imgResponse.generatedImages[0];
            if (img.image?.imageBytes) {
              concept.imageUrl = `data:image/png;base64,${img.image.imageBytes}`;
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

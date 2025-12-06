import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from "@google/genai";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  const results: any = {
    timestamp: new Date().toISOString(),
    steps: []
  };

  try {
    // Step 1: Check API Key
    const API_KEY = process.env.GEMINI_API_KEY;
    results.steps.push({
      step: 1,
      name: 'Check API Key',
      success: !!API_KEY,
      keyLength: API_KEY?.length || 0
    });

    if (!API_KEY) {
      return res.status(500).json({ ...results, error: 'GEMINI_API_KEY not set' });
    }

    // Step 2: Initialize GoogleGenAI
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    results.steps.push({
      step: 2,
      name: 'Initialize GoogleGenAI',
      success: true
    });

    // Step 3: Try generating a simple image
    results.steps.push({
      step: 3,
      name: 'Starting image generation',
      model: 'imagen-4.0-fast-generate-001',
      prompt: 'A simple red circle on white background'
    });

    const response = await ai.models.generateImages({
      model: 'imagen-4.0-fast-generate-001',
      prompt: 'A simple red circle on white background',
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: '1:1',
      },
    });

    results.steps.push({
      step: 4,
      name: 'Image generation response',
      hasGeneratedImages: !!response.generatedImages,
      imageCount: response.generatedImages?.length || 0,
      success: true
    });

    // Check if we got an image
    if (response.generatedImages && response.generatedImages.length > 0) {
      const imageData = response.generatedImages[0].image?.imageBytes;
      results.steps.push({
        step: 5,
        name: 'Extract image data',
        hasImageBytes: !!imageData,
        imageBytesLength: imageData?.length || 0,
        success: !!imageData
      });

      if (imageData) {
        results.imagePreview = `data:image/jpeg;base64,${imageData.substring(0, 100)}...`;
      }
    }

    results.success = true;
    return res.status(200).json(results);

  } catch (error: any) {
    results.error = {
      message: error.message,
      name: error.name,
      stack: error.stack?.split('\n').slice(0, 5)
    };
    results.success = false;
    return res.status(500).json(results);
  }
}

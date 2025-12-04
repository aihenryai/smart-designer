// Gemini API client utilities
// This file provides helper functions for interacting with Gemini API

import { AIConcept, ReferenceAttachment } from '../types';

export interface AutoFillSuggestion {
  field: string;
  suggestion: string;
}

export interface UpdateImageParams {
  newHeadline: string;
  newEssentialInfo: string;
  userInstructions: string;
  aspectRatio: string;
  imageSize: "1K" | "2K" | "4K";
}

/**
 * Generate AI suggestions for form fields
 * Note: This function calls the backend API which uses Gemini
 */
export async function generateAutoFillSuggestion(
  field: string,
  context: Record<string, any>
): Promise<string> {
  try {
    const response = await fetch('/api/auto-fill', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ field, context }),
    });

    if (!response.ok) {
      throw new Error(`Failed to generate suggestion: ${response.statusText}`);
    }

    const data = await response.json();
    return data.suggestion || '';
  } catch (error) {
    console.error('Error generating auto-fill suggestion:', error);
    return '';
  }
}

/**
 * Update a concept's image with new parameters
 * Note: This function calls the backend API which uses Gemini
 */
export async function updateConceptImage(
  concept: AIConcept,
  params: UpdateImageParams,
  attachments: ReferenceAttachment[]
): Promise<string> {
  try {
    const response = await fetch('/api/update-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        concept,
        params,
        attachments
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update image: ${response.statusText}`);
    }

    const data = await response.json();
    return data.imageUrl || concept.imageUrl;
  } catch (error) {
    console.error('Error updating concept image:', error);
    throw error;
  }
}

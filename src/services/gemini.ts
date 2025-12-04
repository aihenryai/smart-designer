// Gemini API client utilities
// This file provides helper functions for interacting with Gemini API

export interface AutoFillSuggestion {
  field: string;
  suggestion: string;
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

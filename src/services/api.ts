import { auth } from '../config/firebase';
import { AIConcept, ReferenceAttachment } from '../../types';

export interface UpdateImageParams {
  newHeadline: string;
  newEssentialInfo: string;
  userInstructions: string;
  aspectRatio: string;
  imageSize: "1K" | "2K" | "4K";
}

export interface UpdateImageResponse {
  imageUrl: string;
  updatedPrompt: string; // Return updated prompt for sequential edits
}

/**
 * Make an authenticated API request
 */
export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const user = auth.currentUser;
  
  if (!user) {
    throw new Error('נדרשת התחברות למערכת');
  }

  // Get ID token
  const idToken = await user.getIdToken();

  // Add Authorization header
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${idToken}`,
    ...options.headers
  };

  const response = await fetch(endpoint, {
    ...options,
    headers
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || errorData.error || 'שגיאה בבקשה לשרת');
  }

  return response.json();
}

/**
 * Generate concepts from brief
 */
export async function generateConcepts(brief: any) {
  return apiRequest('/api/generate-concepts', {
    method: 'POST',
    body: JSON.stringify({ brief })
  });
}

/**
 * Update a concept's image with new parameters
 * Returns both the new image URL and the updated prompt for sequential edits
 */
export async function updateConceptImage(
  concept: AIConcept,
  params: UpdateImageParams,
  attachments: ReferenceAttachment[]
): Promise<UpdateImageResponse> {
  return apiRequest<UpdateImageResponse>('/api/update-image', {
    method: 'POST',
    body: JSON.stringify({
      concept,
      edits: {
        newHeadline: params.newHeadline,
        newEssentialInfo: params.newEssentialInfo,
        userInstructions: params.userInstructions,
        aspectRatio: params.aspectRatio,
        imageSize: params.imageSize
      },
      attachments
    })
  });
}

/**
 * Generate auto-fill suggestion for form fields
 */
export async function generateAutoFillSuggestion(
  field: string,
  context: Record<string, any>
): Promise<string> {
  try {
    const result = await apiRequest<{ suggestion: string }>('/api/auto-fill', {
      method: 'POST',
      body: JSON.stringify({ field, context })
    });
    return result.suggestion || '';
  } catch (error) {
    console.error('Error generating auto-fill suggestion:', error);
    return '';
  }
}

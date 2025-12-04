import { auth } from '../config/firebase';

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
 * Update a concept image
 */
export async function updateConceptImage(conceptId: string, prompt: string) {
  return apiRequest('/api/update-image', {
    method: 'POST',
    body: JSON.stringify({ conceptId, prompt })
  });
}

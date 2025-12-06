// Gemini types - shared type definitions
// Note: API functions are now in src/services/api.ts for authenticated requests

export interface AutoFillSuggestion {
  field: string;
  suggestion: string;
}

// This file is kept for backwards compatibility
// All API calls should use src/services/api.ts instead


export interface ReferenceAttachment {
  id: string;
  fileBase64: string; // The file data
  mimeType: string;   // image/png, text/plain, etc.
  fileName: string;
  userInstruction: string; // "Use this for color palette", "Use structure", etc.
}

export interface DesignBrief {
  subject: string;
  instructions: string; 
  essentialInfo: string;
  targetAudience: string;
  goal: string;
  differentiation: string;
  platforms: string[];
  coreMessage: string;
  callToAction: string;
  attachments: ReferenceAttachment[]; 
}

export interface AIConcept {
  title: string;
  visualDescription: string;
  headline: string;
  colorPaletteSuggestion: string;
  rationale: string;
  imageGenerationPrompt: string; 
  imageUrl?: string; 
}

export enum AppState {
  WELCOME = 'WELCOME',
  FORM = 'FORM',
  LOADING = 'LOADING',
  RESULTS = 'RESULTS',
  EDITOR = 'EDITOR'
}

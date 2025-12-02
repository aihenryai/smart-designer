import { DesignBrief, AIConcept, ReferenceAttachment } from "../types";

const API_BASE = '/api';

export const generateAutoFillSuggestion = async (
  targetField: string,
  context: { subject: string; instructions: string; essentialInfo: string }
): Promise<string> => {
  try {
    const response = await fetch(`${API_BASE}/auto-fill`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ targetField, context })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.suggestion || "";
  } catch (error) {
    console.warn("Auto-fill failed:", error);
    return "";
  }
};

export const analyzeBriefAndGenerateConcepts = async (brief: DesignBrief): Promise<AIConcept[]> => {
  try {
    const response = await fetch(`${API_BASE}/generate-concepts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ brief })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.concepts || [];
  } catch (error: any) {
    console.error("Failed to generate concepts:", error);
    throw new Error(`Failed to generate concepts: ${error.message}`);
  }
};

export const updateConceptImage = async (
  concept: AIConcept,
  edits: {
    newHeadline: string;
    newEssentialInfo: string;
    userInstructions: string;
    aspectRatio: string;
    imageSize?: "1K" | "2K" | "4K";
  },
  attachments: ReferenceAttachment[] = []
): Promise<string> => {
  try {
    const response = await fetch(`${API_BASE}/update-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ concept, edits, attachments })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.imageUrl) {
      throw new Error("Failed to regenerate image.");
    }

    return data.imageUrl;
  } catch (error: any) {
    console.error("Failed to update image:", error);
    throw new Error(`Failed to update image: ${error.message}`);
  }
};

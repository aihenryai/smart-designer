import { DesignBrief, AIConcept, ReferenceAttachment } from "../types";
import { apiPost } from "./apiClient";

interface GenerateConceptsResponse {
  concepts: AIConcept[];
  creditsRemaining: number;
}

interface AutoFillResponse {
  suggestion: string;
}

interface UpdateImageResponse {
  imageUrl: string;
  creditsRemaining?: number;
}

export const generateAutoFillSuggestion = async (
  targetField: string,
  context: { subject: string; instructions: string; essentialInfo: string }
): Promise<string> => {
  try {
    const data = await apiPost<AutoFillResponse>('/auto-fill', { targetField, context });
    return data.suggestion || "";
  } catch (error) {
    console.warn("Auto-fill failed:", error);
    return "";
  }
};

export const analyzeBriefAndGenerateConcepts = async (brief: DesignBrief): Promise<AIConcept[]> => {
  try {
    const data = await apiPost<GenerateConceptsResponse>('/generate-concepts', { brief });
    return data.concepts || [];
  } catch (error: any) {
    console.error("Failed to generate concepts:", error);
    throw new Error(error.message || `Failed to generate concepts`);
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
    const data = await apiPost<UpdateImageResponse>('/update-image', { concept, edits, attachments });
    
    if (!data.imageUrl) {
      throw new Error("Failed to regenerate image.");
    }

    return data.imageUrl;
  } catch (error: any) {
    console.error("Failed to update image:", error);
    throw new Error(error.message || `Failed to update image`);
  }
};

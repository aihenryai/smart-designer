import { GenerateContentResponse } from "@google/genai";

export const fileToBase64 = (file: File | Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Splits a standard Base64 string (data:image/png;base64,...) into mimeType and data parts.
 */
export const extractBase64Data = (fullBase64: string): [string, string] => {
  const parts = fullBase64.split(',');
  const mime = parts[0]?.match(/:(.*?);/)?.[1] || "image/png";
  const data = parts[1] || "";
  return [mime, data];
};

export const callWithTimeout = async <T>(promise: Promise<T>, timeoutMs: number, errorMsg: string): Promise<T> => {
  let timeoutHandle: ReturnType<typeof setTimeout>;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutHandle = setTimeout(() => reject(new Error(errorMsg)), timeoutMs);
  });

  try {
    const result = await Promise.race([promise, timeoutPromise]);
    clearTimeout(timeoutHandle!);
    return result;
  } catch (error) {
    clearTimeout(timeoutHandle!);
    throw error;
  }
};
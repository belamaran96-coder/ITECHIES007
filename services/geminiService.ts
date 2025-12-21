import { GoogleGenAI, Type } from "@google/genai";
import { AspectRatio, Framework } from "../types";

/**
 * Safely retrieves the API Key from the environment.
 */
const getSafeApiKey = (): string => {
  try {
    const key = process.env.API_KEY;
    if (key && key !== "undefined" && key !== "null" && key !== "") {
      return key;
    }
  } catch (e) {
    // Environment variables not accessible or defined
  }
  return "";
};

/**
 * Creates a fresh GoogleGenAI instance.
 */
const getAIInstance = () => {
  const apiKey = getSafeApiKey();
  if (!apiKey) {
    console.warn("API_KEY environment variable is missing. Requests will likely fail.");
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Standard error handler for API calls.
 */
const handleApiError = async (error: any) => {
  const errorMessage = error?.message || "An unexpected error occurred.";
  console.error("Gemini API Error:", error);
  throw new Error(errorMessage);
};

// --- Image Generation ---
export const generateImage = async (
  prompt: string,
  aspectRatio: AspectRatio
): Promise<string> => {
  try {
    const ai = getAIInstance(); 
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] },
      config: {
        imageConfig: { aspectRatio: aspectRatio }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("The model did not return an image.");
  } catch (err) {
    return handleApiError(err);
  }
};

// --- Image Editing ---
export const editImage = async (
  base64Image: string,
  mimeType: string,
  prompt: string
): Promise<string> => {
  try {
    const ai = getAIInstance();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data: base64Image, mimeType: mimeType } },
          { text: prompt }
        ]
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("Failed to edit the image.");
  } catch (err) {
    return handleApiError(err);
  }
};

// --- Code Generation ---
export const generateCodeFromImage = async (
  base64Image: string,
  mimeType: string,
  additionalPrompt: string,
  framework: Framework
): Promise<string> => {
  try {
    const ai = getAIInstance();
    let frameworkInstructions = "";
    switch (framework) {
      case Framework.REACT:
        frameworkInstructions = "Generate a single-file React functional component (.tsx) using Tailwind CSS. Use 'lucide-react' for icons.";
        break;
      case Framework.VUE:
        frameworkInstructions = "Generate a Vue 3 SFC (.vue) using <script setup> and Tailwind CSS.";
        break;
      case Framework.VANILLA:
        frameworkInstructions = "Generate a single-file HTML5 document with Tailwind CSS via CDN.";
        break;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          { inlineData: { data: base64Image, mimeType: mimeType } },
          { text: `${frameworkInstructions}\nAdditional: ${additionalPrompt}\nReturn code in componentCode field and analysis in explanation field.` }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            componentCode: { type: Type.STRING },
            explanation: { type: Type.STRING }
          },
          required: ["componentCode", "explanation"]
        }
      }
    });
    return response.text;
  } catch (err) {
    return handleApiError(err);
  }
};

// --- Video Generation ---
export const generateVideo = async (
  prompt: string,
  aspectRatio: '16:9' | '9:16'
): Promise<string> => {
  try {
    const ai = getAIInstance();
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: aspectRatio
      }
    });

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) throw new Error("Video generation failed.");

    const key = getSafeApiKey();
    const response = await fetch(`${downloadLink}&key=${key}`);
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (err) {
    return handleApiError(err);
  }
};

// --- Chat Assistant ---
export const sendChatMessage = async (history: any[], message: string) => {
  try {
    const ai = getAIInstance();
    const chat = ai.chats.create({
        model: 'gemini-3-pro-preview',
        history: history,
        config: {
            systemInstruction: "You are an expert Frontend Developer and UI/UX Designer assistant."
        }
    });
    const result = await chat.sendMessage({ message });
    return result.text;
  } catch (err) {
    return handleApiError(err);
  }
}
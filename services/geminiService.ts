import { GoogleGenAI, Type } from "@google/genai";
import { AspectRatio, Framework } from "../types";

/**
 * World-class frontend implementation following strict @google/genai guidelines.
 * API key is accessed exclusively via process.env.API_KEY.
 */

// --- Image Generation ---
export const generateImage = async (
  prompt: string,
  aspectRatio: AspectRatio
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
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
};

// --- Image Editing ---
export const editImage = async (
  base64Image: string,
  mimeType: string,
  prompt: string
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
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
};

// --- Code Generation ---
export const generateCodeFromImage = async (
  base64Image: string,
  mimeType: string,
  additionalPrompt: string,
  framework: Framework
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
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
        { text: `${frameworkInstructions}\nAdditional requirements: ${additionalPrompt}\nReturn code in 'componentCode' field and analysis in 'explanation' field.` }
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
};

// --- Video Generation ---
export const generateVideo = async (
  prompt: string,
  aspectRatio: '16:9' | '9:16'
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
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

  const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
  const blob = await response.blob();
  return URL.createObjectURL(blob);
};

// --- Chat Assistant ---
export const sendChatMessage = async (history: any[], message: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const chat = ai.chats.create({
      model: 'gemini-3-pro-preview',
      history: history,
      config: {
          systemInstruction: "You are ITechies Assistant, an expert Frontend Developer and UI/UX Designer."
      }
  });
  const result = await chat.sendMessage({ message });
  return result.text;
};

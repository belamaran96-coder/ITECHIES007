import { GoogleGenAI, Type } from "@google/genai";
import { AspectRatio, Framework } from "../types";

// Initialize AI directly in the frontend using the injected API_KEY
const getAI = () => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY is not defined. Please ensure it is set in your environment.");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generateImage = async (prompt: string, aspectRatio: AspectRatio): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: [{ text: prompt }] },
    config: {
      imageConfig: {
        aspectRatio: aspectRatio as any
      }
    },
  });

  const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
  if (!part?.inlineData?.data) throw new Error("No image data returned. Try a different prompt.");
  
  return `data:image/png;base64,${part.inlineData.data}`;
};

export const editImage = async (base64Data: string, mimeType: string, prompt: string): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { inlineData: { data: base64Data, mimeType } },
        { text: prompt }
      ]
    }
  });

  const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
  if (!part?.inlineData?.data) throw new Error("Could not edit image.");
  
  return `data:image/png;base64,${part.inlineData.data}`;
};

export const generateCodeFromImage = async (
  base64Data: string, 
  mimeType: string, 
  additionalPrompt: string, 
  framework: Framework
): Promise<string> => {
  const ai = getAI();
  
  let frameworkInstructions = "";
  switch (framework) {
    case Framework.REACT: frameworkInstructions = "React component using Tailwind CSS and Lucide React icons."; break;
    case Framework.VUE: frameworkInstructions = "Vue 3 SFC using <script setup> and Tailwind CSS."; break;
    case Framework.VANILLA: frameworkInstructions = "Standard HTML5 file with Tailwind CDN."; break;
  }

  const prompt = `Convert this UI mockup into ${frameworkInstructions}. 
    Additional requirements: ${additionalPrompt}. 
    Return strictly JSON with 'componentCode' and 'explanation'.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: {
      parts: [
        { inlineData: { data: base64Data, mimeType } },
        { text: prompt }
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

export const generateVideo = async (prompt: string, aspectRatio: '16:9' | '9:16'): Promise<string> => {
  const ai = getAI();
  
  // Start the generation
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: prompt,
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: aspectRatio
    }
  });

  // Poll for completion (Veo is asynchronous)
  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!downloadLink) throw new Error("Video generation failed to return a file.");

  // Fetch the video through the key-authenticated link
  const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
  if (!videoResponse.ok) throw new Error("Failed to download video file.");
  
  const blob = await videoResponse.blob();
  return URL.createObjectURL(blob);
};

export const sendChatMessage = async (history: any[], message: string): Promise<string> => {
  const ai = getAI();
  const chat = ai.chats.create({
    model: 'gemini-3-pro-preview',
    history: history,
    config: {
      systemInstruction: "You are ITechies Assistant, an expert frontend engineer. Help users with UI/UX and code."
    }
  });

  const response = await chat.sendMessage({ message });
  return response.text || "I couldn't process that request.";
};

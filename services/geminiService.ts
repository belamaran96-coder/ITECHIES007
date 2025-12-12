import { GoogleGenAI, Type } from "@google/genai";
import { AspectRatio, Framework } from "../types";

// Helper to get AI instance. 
// For Veo (Videos), we need to ensure we use the key from the selector if available.
const getAI = async (requireUserKey = false) => {
  // If requesting a user key (e.g. for Veo/Pro Vision high cost), check if selected
  if (requireUserKey) {
    const win = window as any;
    if (win.aistudio && win.aistudio.hasSelectedApiKey) {
       const hasKey = await win.aistudio.hasSelectedApiKey();
       if (!hasKey) {
         // Trigger selection if not present
         await win.aistudio.openSelectKey();
       }
    }
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

// --- Image Generation ---
export const generateImage = async (
  prompt: string,
  aspectRatio: AspectRatio
): Promise<string> => {
  const ai = await getAI(); 
  
  // Using gemini-2.5-flash-image for broader availability and to avoid permission issues
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [{ text: prompt }]
    },
    config: {
      imageConfig: {
        aspectRatio: aspectRatio
      }
    }
  });

  // Extract image
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("No image generated");
};

// --- Image Editing ---
export const editImage = async (
  base64Image: string,
  mimeType: string,
  prompt: string
): Promise<string> => {
  const ai = await getAI();
  // Using gemini-2.5-flash-image for fast editing
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          inlineData: {
            data: base64Image,
            mimeType: mimeType
          }
        },
        { text: prompt }
      ]
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("No edited image generated");
};

// --- Code Generation ---
export const generateCodeFromImage = async (
  base64Image: string,
  mimeType: string,
  additionalPrompt: string,
  framework: Framework
): Promise<string> => {
  const ai = await getAI();
  
  let frameworkInstructions = "";
  switch (framework) {
    case Framework.REACT:
      frameworkInstructions = "Generate a single-file React functional component (.tsx) using Tailwind CSS. Use 'lucide-react' for icons if needed. Ensure it is production-ready code.";
      break;
    case Framework.VUE:
      frameworkInstructions = "Generate a Vue 3 Single File Component (.vue) using <script setup> and Tailwind CSS. Ensure it is production-ready code.";
      break;
    case Framework.VANILLA:
      frameworkInstructions = "Generate a complete, single-file HTML5 document. Include Tailwind CSS via CDN in the <head>. Include all CSS and Vanilla JavaScript within the file (in <style> and <script> tags).";
      break;
  }

  // Using gemini-3-pro-preview for complex reasoning and code gen
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: {
      parts: [
        {
          inlineData: {
            data: base64Image,
            mimeType: mimeType
          }
        },
        { 
          text: `
            Analyze this UI design image.
            ${frameworkInstructions}
            
            Additional Instructions: ${additionalPrompt}

            Return the response in JSON format with the following schema:
            {
              "componentCode": "The full code string (HTML/JSX/Vue)",
              "explanation": "A comprehensive explanation of the implementation. Detail the structure of the component, specific styling choices (layout, typography, colors using Tailwind), and any interactive logic or state management included to match the design."
            }
          ` 
        }
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
  // Video generation requires user API key selection
  const ai = await getAI(true);
  
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: prompt,
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: aspectRatio
    }
  });

  // Polling for completion
  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 5000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!videoUri) throw new Error("Video generation failed");

  // Fetch actual video bytes using the key
  const response = await fetch(`${videoUri}&key=${process.env.API_KEY}`);
  const blob = await response.blob();
  return URL.createObjectURL(blob);
};

// --- Chat Assistant ---
export const sendChatMessage = async (history: any[], message: string) => {
    const ai = await getAI();
    const chat = ai.chats.create({
        model: 'gemini-3-pro-preview',
        history: history,
        config: {
            systemInstruction: "You are an expert Frontend Developer and UI/UX Designer assistant."
        }
    });
    
    const result = await chat.sendMessage({ message });
    return result.text;
}
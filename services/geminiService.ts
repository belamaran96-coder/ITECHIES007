import { AspectRatio, Framework } from "../types";

const callBackend = async (task: string, payload: any) => {
  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ task, payload })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Backend request failed');
  }

  return response.json();
};

export const generateImage = async (prompt: string, aspectRatio: AspectRatio): Promise<string> => {
  const result = await callBackend('generateImage', { prompt, aspectRatio });
  return `data:image/png;base64,${result.data}`;
};

export const editImage = async (base64Image: string, mimeType: string, prompt: string): Promise<string> => {
  const result = await callBackend('editImage', { base64Image, mimeType, prompt });
  return `data:image/png;base64,${result.data}`;
};

export const generateCodeFromImage = async (base64Image: string, mimeType: string, additionalPrompt: string, framework: Framework): Promise<string> => {
  let frameworkInstructions = "";
  switch (framework) {
    case Framework.REACT: frameworkInstructions = "Generate a single-file React functional component (.tsx) using Tailwind CSS. Use 'lucide-react' for icons."; break;
    case Framework.VUE: frameworkInstructions = "Generate a Vue 3 SFC (.vue) using <script setup> and Tailwind CSS."; break;
    case Framework.VANILLA: frameworkInstructions = "Generate a single-file HTML5 document with Tailwind CSS via CDN."; break;
  }

  const prompt = `${frameworkInstructions}\nAdditional requirements: ${additionalPrompt}\nReturn code in 'componentCode' field and analysis in 'explanation' field.`;
  const result = await callBackend('generateCode', { base64Image, mimeType, prompt });
  return JSON.stringify(result);
};

export const generateVideo = async (prompt: string, aspectRatio: '16:9' | '9:16'): Promise<string> => {
  // 1. Start generation
  const startResult = await callBackend('startVideo', { prompt, aspectRatio });
  let operation = startResult.operation;

  // 2. Poll for completion from frontend (avoids serverless timeout)
  while (true) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    const checkResult = await callBackend('checkVideo', { operation });
    
    if (checkResult.done) {
      // The frontend fetches the final video using the URI provided
      // Note: In Vercel, you need to append the key if downloading directly, 
      // but since we are handling this via a link, we'll return the URI.
      // However, for immediate preview, fetching as blob is best:
      const videoResponse = await fetch(`${checkResult.uri}&key=__API_KEY_PLACEHOLDER__`); // Vercel handles key injection via internal fetch if configured, but here we just return the link or proxy.
      // Simplified for this demo:
      return checkResult.uri; 
    }
  }
};

export const sendChatMessage = async (history: any[], message: string): Promise<string> => {
  const result = await callBackend('generateChat', { history, message });
  return result.text;
};

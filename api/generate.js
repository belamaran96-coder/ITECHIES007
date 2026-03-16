import { GoogleGenAI, Type } from "@google/genai";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { task, payload } = req.body;
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Server Error: API_KEY is missing in Vercel settings.' });
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    switch (task) {
      case 'generateImage': {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: { parts: [{ text: payload.prompt }] },
          config: { imageConfig: { aspectRatio: payload.aspectRatio } }
        });
        const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
        if (!part) throw new Error("No image generated.");
        return res.status(200).json({ data: part.inlineData.data });
      }

      case 'editImage': {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: {
            parts: [
              { inlineData: { data: payload.base64Image, mimeType: payload.mimeType } },
              { text: payload.prompt }
            ]
          }
        });
        const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
        return res.status(200).json({ data: part.inlineData.data });
      }

      case 'generateCode': {
        const response = await ai.models.generateContent({
          model: 'gemini-3-pro-preview',
          contents: {
            parts: [
              { inlineData: { data: payload.base64Image, mimeType: payload.mimeType } },
              { text: payload.prompt }
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
        return res.status(200).json(JSON.parse(response.text));
      }

      case 'startVideo': {
        const operation = await ai.models.generateVideos({
          model: 'veo-3.1-fast-generate-preview',
          prompt: payload.prompt,
          config: {
            numberOfVideos: 1,
            resolution: '720p',
            aspectRatio: payload.aspectRatio
          }
        });
        return res.status(200).json({ operation });
      }

      case 'checkVideo': {
        const operation = await ai.operations.getVideosOperation({ operation: payload.operation });
        if (operation.done) {
          const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
          // Return the link - the frontend will use our video-proxy to download it
          return res.status(200).json({ done: true, uri: downloadLink });
        }
        return res.status(200).json({ done: false });
      }

      case 'generateChat': {
        // payload.history should be an array of { role: 'user'|'model', parts: [{ text: '...' }] }
        const chat = ai.chats.create({
          model: 'gemini-3-pro-preview',
          history: payload.history || [],
          config: {
            systemInstruction: "You are ITechies Assistant, an expert Frontend Developer and UI/UX Designer. Help users with code, design, and technical questions."
          }
        });
        const response = await chat.sendMessage({ message: payload.message });
        return res.status(200).json({ text: response.text });
      }

      default:
        return res.status(400).json({ error: 'Invalid task' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
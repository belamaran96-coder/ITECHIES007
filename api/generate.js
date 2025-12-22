import { GoogleGenAI, Type } from "@google/genai";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { task, payload } = req.body;
  
  // Use the system-required environment variable name
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API_KEY environment variable is not set on the server.' });
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    switch (task) {
      case 'generateImage': {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: { parts: [{ text: payload.prompt }] },
          config: {
            imageConfig: { aspectRatio: payload.aspectRatio }
          }
        });
        const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
        if (!part) throw new Error("No image data returned from model.");
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
        if (!part) throw new Error("No edited image data returned.");
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

      case 'generateVideo': {
        let operation = await ai.models.generateVideos({
          model: 'veo-3.1-fast-generate-preview',
          prompt: payload.prompt,
          config: {
            numberOfVideos: 1,
            resolution: '720p',
            aspectRatio: payload.aspectRatio
          }
        });

        // Poll for completion (Vercel Pro/Enterprise recommended for long timeouts)
        while (!operation.done) {
          await new Promise(resolve => setTimeout(resolve, 10000));
          operation = await ai.operations.getVideosOperation({ operation: operation });
        }

        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (!downloadLink) throw new Error("Video generation failed.");
        
        // Return the link and let frontend handle blob or proxy the bytes
        // To keep it secure, we fetch the bytes on the server and send them
        const videoResponse = await fetch(`${downloadLink}&key=${apiKey}`);
        const videoBuffer = await videoResponse.arrayBuffer();
        
        res.setHeader('Content-Type', 'video/mp4');
        return res.send(Buffer.from(videoBuffer));
      }

      default:
        return res.status(400).json({ error: 'Invalid task' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
export default async function handler(req, res) {
  const { url } = req.query;
  const apiKey = process.env.API_KEY;

  if (!url || !apiKey) {
    return res.status(400).json({ error: "Missing URL or API Key" });
  }

  try {
    const videoResponse = await fetch(`${url}&key=${apiKey}`);
    if (!videoResponse.ok) throw new Error("Failed to fetch video from source");

    const contentType = videoResponse.headers.get("content-type");
    res.setHeader("Content-Type", contentType || "video/mp4");
    
    const arrayBuffer = await videoResponse.arrayBuffer();
    return res.send(Buffer.from(arrayBuffer));
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
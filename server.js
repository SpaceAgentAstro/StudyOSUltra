import express from 'express';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
// Keep API payloads bounded to protect server memory while client-side file uploads stay local.
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

const PORT = 3001;
const API_KEY = process.env.GEMINI_API_KEY || process.env.API_KEY;

if (!API_KEY) {
  console.warn("WARNING: GEMINI_API_KEY is not set in environment variables.");
}

const aiClient = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

app.post('/api/generate', async (req, res) => {
  if (!aiClient) {
    return res.status(500).json({ error: "Server Error: API Key not configured." });
  }

  try {
    const { model, contents, config } = req.body;
    const response = await aiClient.models.generateContent({
      model,
      contents,
      config
    });

    // Ensure we send the text property which is often a getter or function in the SDK
    const text = typeof response.text === 'function' ? response.text() : response.text;

    // Create a plain object to send
    const responseData = {
      candidates: response.candidates,
      usageMetadata: response.usageMetadata,
      text: text
    };

    res.json(responseData);
  } catch (error) {
    console.error("Error in /api/generate:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
});

app.post('/api/stream', async (req, res) => {
  if (!aiClient) {
    return res.status(500).json({ error: "Server Error: API Key not configured." });
  }

  try {
    const { model, contents, config } = req.body;

    const result = await aiClient.models.generateContentStream({
      model,
      contents,
      config
    });

    // Handle stream source: either result.stream or result itself
    const stream = result.stream || result;

    // Set headers for streaming
    res.setHeader('Content-Type', 'application/x-ndjson');
    res.setHeader('Transfer-Encoding', 'chunked');

    for await (const chunk of stream) {
      const text = typeof chunk.text === 'function' ? chunk.text() : chunk.text;

      const chunkData = {
        candidates: chunk.candidates,
        usageMetadata: chunk.usageMetadata,
        text: text
      };

      res.write(JSON.stringify(chunkData) + "\n");
    }
    res.end();
  } catch (error) {
    console.error("Error in /api/stream:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message || "Internal Server Error" });
    } else {
      res.end();
    }
  }
});

app.post('/api/generate-image', async (req, res) => {
  if (!aiClient) {
    return res.status(500).json({ error: "Server Error: API Key not configured." });
  }

  try {
    const { prompt } = req.body;
    const imageApi = aiClient.models.generateImages;

    if (typeof imageApi !== 'function') {
      return res.status(500).json({ error: "Image generation not supported by server SDK." });
    }

    const response = await imageApi({
      model: 'imagen-3.0-generate-002',
      prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
      },
    });

    const bytes = response?.generatedImages?.[0]?.image?.imageBytes;

    if (bytes) {
      res.json({ image: `data:image/jpeg;base64,${bytes}` });
    } else {
      res.status(500).json({ error: "No image generated." });
    }
  } catch (error) {
    console.error("Error in /api/generate-image:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
});

app.post('/api/generate-video', async (req, res) => {
  if (!aiClient) {
    return res.status(500).json({ error: "Server Error: API Key not configured." });
  }

  try {
    const { prompt, config } = req.body;
    const videoApi = aiClient.models.generateVideos;

    if (typeof videoApi !== 'function') {
      return res.status(500).json({ error: "Video generation not supported by server SDK." });
    }

    const response = await videoApi({
      model: 'veo-2.0-generate-001',
      prompt,
      config,
    });

    const videoUrl = response?.generatedVideos?.[0]?.video?.uri;

    if (videoUrl) {
      res.json({ videoUrl });
    } else {
      res.status(500).json({ error: "No video generated." });
    }
  } catch (error) {
    console.error("Error in /api/generate-video:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

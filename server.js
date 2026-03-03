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

// Security: Enforce authentication for API access
const authenticate = (req, res, next) => {
  const internalSecret = req.headers['x-internal-secret'];
  const userApiKey = req.headers['x-api-key'];

  // Require either an internal secret (from Vite proxy) or an explicit API key
  const expectedSecret = process.env.JULES_API_KEY;
  const isInternalValid = expectedSecret && internalSecret === expectedSecret;
  const hasUserApiKey = Boolean(userApiKey);

  // Require either an internal secret (from Vite proxy) or an explicit user API key header.
  if (isInternalValid || hasUserApiKey) {
    return next();
  }

  return res.status(401).json({ error: "Unauthorized: Missing or invalid authentication." });
};

app.post('/api/generate', authenticate, async (req, res) => {
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

app.post('/api/stream', authenticate, async (req, res) => {
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

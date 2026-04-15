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

const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',').map(s => s.trim()) : [];
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (
      origin.startsWith('http://localhost:') ||
      origin.startsWith('http://127.0.0.1:') ||
      allowedOrigins.includes(origin)
    ) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
};
app.use(cors(corsOptions));

// Keep API payloads bounded to protect server memory while client-side file uploads stay local.
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

const PORT = 3001;
const API_KEY = process.env.GEMINI_API_KEY || process.env.API_KEY;

if (!API_KEY) {
  console.warn("WARNING: GEMINI_API_KEY is not set in environment variables.");
}

const aiClient = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

// Simple in-memory rate limiter
const rateLimitCache = new Map();
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 20;

const rateLimiter = (req, res, next) => {
  const ip = req.socket.remoteAddress || 'unknown';
  const now = Date.now();

  if (!rateLimitCache.has(ip)) {
    rateLimitCache.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return next();
  }

  const clientData = rateLimitCache.get(ip);
  if (now > clientData.resetTime) {
    rateLimitCache.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return next();
  }

  if (clientData.count >= MAX_REQUESTS_PER_WINDOW) {
    return res.status(429).json({ error: "Too many requests. Please try again later." });
  }

  clientData.count += 1;
  next();
};

// Clean up rate limit cache periodically to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of rateLimitCache.entries()) {
    if (now > data.resetTime) {
      rateLimitCache.delete(ip);
    }
  }
}, RATE_LIMIT_WINDOW_MS);

app.post('/api/generate', rateLimiter, async (req, res) => {
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
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post('/api/stream', rateLimiter, async (req, res) => {
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
      res.status(500).json({ error: "Internal Server Error" });
    } else {
      res.end();
    }
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

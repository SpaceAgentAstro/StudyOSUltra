export const config = {
  geminiApiKey: import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_API_KEY || import.meta.env.VITE_JULES_API_KEY || '',
  julesApiKey: import.meta.env.VITE_JULES_API_KEY || '',
  openaiApiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
  openaiBaseUrl: import.meta.env.VITE_OPENAI_BASE_URL || 'https://api.openai.com/v1',
  openaiModel: import.meta.env.VITE_OPENAI_MODEL || 'gpt-4.1-mini',
  openaiImageModel: import.meta.env.VITE_OPENAI_IMAGE_MODEL || 'gpt-image-1',
  anthropicApiKey: import.meta.env.VITE_ANTHROPIC_API_KEY || '',
  anthropicBaseUrl: import.meta.env.VITE_ANTHROPIC_BASE_URL || 'https://api.anthropic.com/v1',
  anthropicModel: import.meta.env.VITE_ANTHROPIC_MODEL || 'claude-3-5-sonnet-latest',
  modelProvider: import.meta.env.VITE_MODEL_PROVIDER || 'auto',
  ollamaModel: import.meta.env.VITE_OLLAMA_MODEL || 'qwen2.5:latest',
  ollamaBaseUrl: import.meta.env.VITE_OLLAMA_BASE_URL || 'http://localhost:11434',
  firebase: {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || undefined,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || undefined,
  }
};

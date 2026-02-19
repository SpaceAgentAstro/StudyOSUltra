/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GEMINI_API_KEY: string
  readonly VITE_API_KEY: string
  readonly VITE_JULES_API_KEY: string
  readonly VITE_OPENAI_API_KEY: string
  readonly VITE_OPENAI_BASE_URL: string
  readonly VITE_OPENAI_MODEL: string
  readonly VITE_OPENAI_IMAGE_MODEL: string
  readonly VITE_ANTHROPIC_API_KEY: string
  readonly VITE_ANTHROPIC_BASE_URL: string
  readonly VITE_ANTHROPIC_MODEL: string
  readonly VITE_MODEL_PROVIDER: string
  readonly VITE_OLLAMA_MODEL: string
  readonly VITE_OLLAMA_BASE_URL: string
  readonly VITE_FIREBASE_API_KEY: string
  readonly VITE_FIREBASE_AUTH_DOMAIN: string
  readonly VITE_FIREBASE_PROJECT_ID: string
  readonly VITE_FIREBASE_APP_ID: string
  readonly VITE_FIREBASE_STORAGE_BUCKET: string
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

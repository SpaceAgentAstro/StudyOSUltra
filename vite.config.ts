/// <reference types="vitest" />
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const isTest = mode === 'test' || process.env.VITEST === 'true';

  return {
    base: mode === 'production' ? './' : '/',
    server: {
      port: 3000,
      host: '0.0.0.0',
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
          secure: false,
        },
      },
    },
    plugins: [react()],
    define: isTest
      ? {}
      : {
          'process.env.OPENAI_BASE_URL': JSON.stringify(env.OPENAI_BASE_URL || 'https://api.openai.com/v1'),
          'process.env.OPENAI_MODEL': JSON.stringify(env.OPENAI_MODEL || 'gpt-4.1-mini'),
          'process.env.OPENAI_IMAGE_MODEL': JSON.stringify(env.OPENAI_IMAGE_MODEL || 'gpt-image-1'),
          'process.env.ANTHROPIC_BASE_URL': JSON.stringify(env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com/v1'),
          'process.env.ANTHROPIC_MODEL': JSON.stringify(env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-latest'),
          'process.env.MODEL_PROVIDER': JSON.stringify(env.MODEL_PROVIDER || 'auto'),
          'process.env.OLLAMA_MODEL': JSON.stringify(env.OLLAMA_MODEL || 'qwen2.5:latest'),
          'process.env.OLLAMA_BASE_URL': JSON.stringify(env.OLLAMA_BASE_URL || 'http://localhost:11434'),
          'process.env.FIREBASE_API_KEY': JSON.stringify(env.FIREBASE_API_KEY || ''),
          'process.env.FIREBASE_AUTH_DOMAIN': JSON.stringify(env.FIREBASE_AUTH_DOMAIN || ''),
          'process.env.FIREBASE_PROJECT_ID': JSON.stringify(env.FIREBASE_PROJECT_ID || ''),
          'process.env.FIREBASE_APP_ID': JSON.stringify(env.FIREBASE_APP_ID || ''),
          'process.env.FIREBASE_STORAGE_BUCKET': JSON.stringify(env.FIREBASE_STORAGE_BUCKET || ''),
          'process.env.FIREBASE_MESSAGING_SENDER_ID': JSON.stringify(env.FIREBASE_MESSAGING_SENDER_ID || ''),
        },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./vitest.setup.ts'],
    },
  };
});

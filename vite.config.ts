import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const isTest = mode === 'test' || process.env.VITEST === 'true';
    return {
      // Use relative asset paths in production so GitHub Pages (repo subpaths) works.
      base: mode === 'production' ? './' : '/',
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./vitest.setup.ts'],
      },
      plugins: [react()],
      define: isTest ? {} : {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.JULES_API_KEY': JSON.stringify(env.JULES_API_KEY),
        'process.env.OPENAI_API_KEY': JSON.stringify(env.OPENAI_API_KEY),
        'process.env.OPENAI_BASE_URL': JSON.stringify(env.OPENAI_BASE_URL || 'https://api.openai.com/v1'),
        'process.env.OPENAI_MODEL': JSON.stringify(env.OPENAI_MODEL || 'gpt-4.1-mini'),
        'process.env.OPENAI_IMAGE_MODEL': JSON.stringify(env.OPENAI_IMAGE_MODEL || 'gpt-image-1'),
        'process.env.ANTHROPIC_API_KEY': JSON.stringify(env.ANTHROPIC_API_KEY),
        'process.env.ANTHROPIC_BASE_URL': JSON.stringify(env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com/v1'),
        'process.env.ANTHROPIC_MODEL': JSON.stringify(env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-latest'),
        'process.env.MODEL_PROVIDER': JSON.stringify(env.MODEL_PROVIDER || 'auto'),
        'process.env.OLLAMA_MODEL': JSON.stringify(env.OLLAMA_MODEL || 'qwen2.5:latest'),
        'process.env.OLLAMA_BASE_URL': JSON.stringify(env.OLLAMA_BASE_URL || 'http://localhost:11434')
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});

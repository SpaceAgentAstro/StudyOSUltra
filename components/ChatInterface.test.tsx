/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import ChatInterface from './ChatInterface';
import { Message, FileDocument } from '../types';
import * as matchers from '@testing-library/jest-dom/matchers';

expect.extend(matchers);

// Mock scrollToBottom
Element.prototype.scrollIntoView = vi.fn();

// Mock localStorage
const localStorageMock = (function () {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
    removeItem: (key: string) => {
      delete store[key];
    }
  };
})();
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock SpeechRecognition
class MockSpeechRecognition {
  start = vi.fn();
  stop = vi.fn();
  abort = vi.fn();
  addEventListener = vi.fn();
  removeEventListener = vi.fn();
  continuous = false;
  interimResults = false;
  lang = 'en-US';
  onresult = null;
  onstart = null;
  onend = null;
  onerror = null;
}

Object.defineProperty(window, 'SpeechRecognition', {
  writable: true,
  value: MockSpeechRecognition
});
Object.defineProperty(window, 'webkitSpeechRecognition', {
    writable: true,
    value: MockSpeechRecognition
});

// Mock SpeechSynthesis
Object.defineProperty(window, 'speechSynthesis', {
    writable: true,
    value: {
        speak: vi.fn(),
        cancel: vi.fn(),
        onend: vi.fn(),
    }
});
Object.defineProperty(window, 'SpeechSynthesisUtterance', {
    writable: true,
    value: vi.fn()
});

// Mock Gemini Service
vi.mock('../services/geminiService', () => ({
  setRuntimeApiKey: vi.fn(),
  setRuntimeApiKeyForProvider: vi.fn(),
  setRuntimeProvider: vi.fn(),
  setRuntimeOllamaConfig: vi.fn(),
  getProviderRuntimeStatus: vi.fn().mockReturnValue({ configured: {}, keySource: {} }),
  streamChatResponse: vi.fn(),
}));

describe('ChatInterface', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders initial messages correctly', () => {
    const messages: Message[] = [
      { id: '1', role: 'user', text: 'Hello User', timestamp: 123 },
      { id: '2', role: 'model', agent: 'TEACHER', text: 'Hi there Teacher!', timestamp: 124 }
    ];
    const files: FileDocument[] = [];

    render(<ChatInterface files={files} initialMessages={messages} />);

    expect(screen.getByText('Hello User')).toBeInTheDocument();
    expect(screen.getByText('Hi there Teacher!')).toBeInTheDocument();
  });
});
